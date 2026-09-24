// src/data/repositories/cash.repo.ts
import { getDb } from '../db/client';
import type {
    CashFilters,
    CashInput,
    CashInputSource,
    CashMovement,
    CashOutput,
    CashRegisterRow,
} from '../types/cash';

export const CashRepo = {
    /** Retourne la caisse actuellement ouverte (s’il y en a une). */
    async findOpen(orgId: number | null): Promise<CashRegisterRow | null> {
        const db = await getDb();
        const orgFilter = orgId ? 'AND r.organization_id = ?' : '';
        const params = orgId ? [orgId] : [];

        return db.getFirstAsync<CashRegisterRow>(
            `SELECT r.*, u.name AS user_name
             FROM cash_registers r
             LEFT JOIN users u ON u.id = r.user_id
             WHERE r.status = 'OPEN' ${orgFilter}
             ORDER BY r.opened_at DESC
             LIMIT 1`,
            params,
        );
    },

    /** Dernière caisse clôturée (pour pré-remplir le solde d’ouverture). */
    async findLastClosed(orgId: number | null): Promise<CashRegisterRow | null> {
        const db = await getDb();
        const orgFilter = orgId ? 'AND r.organization_id = ?' : '';
        const params = orgId ? [orgId] : [];

        return db.getFirstAsync<CashRegisterRow>(
            `SELECT r.*, u.name AS user_name
             FROM cash_registers r
             LEFT JOIN users u ON u.id = r.user_id
             WHERE r.status = 'CLOSED' ${orgFilter}
             ORDER BY r.closed_at DESC
             LIMIT 1`,
            params,
        );
    },

    /** Ouvre une nouvelle caisse pour aujourd’hui. */
    /** Ouvre une nouvelle caisse pour aujourd’hui, ou rouvre celle fermée du jour. */
async open(input: {
    organization_id: number | null;
    user_id: number;
    opening_balance: number;
    notes: string | null;
}): Promise<number> {
    const db = await getDb();

    // 1) Une caisse est déjà ouverte ? → erreur
    const existingOpen = await this.findOpen(input.organization_id);
    if (existingOpen) {
        throw new Error(
            `Une caisse est déjà ouverte (${existingOpen.date}).`,
        );
    }

    // 2) Une caisse FERMÉE existe aujourd'hui pour cet utilisateur ? → rouvrir
    const closedToday = await db.getFirstAsync<{ id: number }>(
        `SELECT id FROM cash_registers
         WHERE user_id = ? AND date = date('now') AND status = 'CLOSED'
         LIMIT 1`,
        [input.user_id],
    );

    if (closedToday) {
        await db.runAsync(
            `UPDATE cash_registers
             SET status = 'OPEN',
                 opening_balance = ?,
                 total_input = 0,
                 total_output = 0,
                 expected_balance = ?,
                 actual_balance = NULL,
                 difference = NULL,
                 opened_at = datetime('now'),
                 closed_at = NULL,
                 opening_notes = ?,
                 closing_notes = NULL,
                 updated_at = datetime('now')
             WHERE id = ?`,
            [
                input.opening_balance,
                input.opening_balance,
                input.notes,
                closedToday.id,
            ],
        );
        return closedToday.id;
    }

    // 3) Sinon, créer une nouvelle caisse
    const r = await db.runAsync(
        `INSERT INTO cash_registers
            (organization_id, user_id, date, opening_balance,
             expected_balance, status, opened_at, opening_notes)
         VALUES (?, ?, date('now'), ?, ?, 'OPEN', datetime('now'), ?)`,
        [
            input.organization_id,
            input.user_id,
            input.opening_balance,
            input.opening_balance,
            input.notes,
        ],
    );
    return r.lastInsertRowId;
},

    /** Clôture la caisse : calcule expected, difference, met à jour le statut. */
    async close(input: {
        registerId: number;
        actual_balance: number;
        notes: string | null;
    }): Promise<void> {
        const db = await getDb();

        const reg = await db.getFirstAsync<{
            opening_balance: number;
            total_input: number;
            total_output: number;
            status: string;
        }>(
            `SELECT opening_balance, total_input, total_output, status
             FROM cash_registers WHERE id = ?`,
            [input.registerId],
        );

        if (!reg) throw new Error('Caisse introuvable.');
        if (reg.status === 'CLOSED') throw new Error('Cette caisse est déjà clôturée.');

        const expected =
            Number(reg.opening_balance) +
            Number(reg.total_input) -
            Number(reg.total_output);
        const difference = Number(input.actual_balance) - expected;

        await db.runAsync(
            `UPDATE cash_registers
             SET status = 'CLOSED',
                 expected_balance = ?,
                 actual_balance = ?,
                 difference = ?,
                 closed_at = datetime('now'),
                 closing_notes = ?,
                 updated_at = datetime('now')
             WHERE id = ?`,
            [expected, input.actual_balance, difference, input.notes, input.registerId],
        );
    },

    /** Ajoute une entrée de caisse + met à jour le total d’entrées. */
    async addInput(input: {
        registerId: number;
        organization_id: number | null;
        user_id: number;
        amount: number;
        source: CashInputSource;
        reference: string | null;
        notes: string | null;
    }): Promise<number> {
        const db = await getDb();

        let inputId = 0;

        await db.withTransactionAsync(async () => {
            const r = await db.runAsync(
                `INSERT INTO cash_inputs
                    (organization_id, cash_register_id, user_id, amount,
                     source, reference, notes)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    input.organization_id,
                    input.registerId,
                    input.user_id,
                    input.amount,
                    input.source,
                    input.reference,
                    input.notes,
                ],
            );
            inputId = r.lastInsertRowId;

            await db.runAsync(
                `UPDATE cash_registers
                 SET total_input = total_input + ?,
                     updated_at = datetime('now')
                 WHERE id = ?`,
                [input.amount, input.registerId],
            );
        });

        return inputId;
    },

    /** Ajoute une sortie de caisse + met à jour le total de sorties. */
    async addOutput(input: {
        registerId: number;
        organization_id: number | null;
        user_id: number;
        amount: number;
        reason: string;
        beneficiary: string | null;
        reference: string | null;
        notes: string | null;
    }): Promise<number> {
        const db = await getDb();

        let outputId = 0;

        await db.withTransactionAsync(async () => {
            const r = await db.runAsync(
                `INSERT INTO cash_outputs
                    (organization_id, cash_register_id, user_id, amount,
                     reason, beneficiary, reference, notes)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    input.organization_id,
                    input.registerId,
                    input.user_id,
                    input.amount,
                    input.reason,
                    input.beneficiary,
                    input.reference,
                    input.notes,
                ],
            );
            outputId = r.lastInsertRowId;

            await db.runAsync(
                `UPDATE cash_registers
                 SET total_output = total_output + ?,
                     updated_at = datetime('now')
                 WHERE id = ?`,
                [input.amount, input.registerId],
            );
        });

        return outputId;
    },

    /** Retourne les derniers mouvements (entrées + sorties) d’une caisse. */
    async movements(registerId: number, limit = 10): Promise<CashMovement[]> {
    const db = await getDb();

    const inputs = await db.getAllAsync<CashInput>(
        `SELECT * FROM cash_inputs
         WHERE cash_register_id = ?
         ORDER BY created_at DESC
         LIMIT ?`,
        [registerId, limit],
    );

    const outputs = await db.getAllAsync<CashOutput>(
        `SELECT * FROM cash_outputs
         WHERE cash_register_id = ?
         ORDER BY created_at DESC
         LIMIT ?`,
        [registerId, limit],
    );

    const all: CashMovement[] = [
        ...inputs.map(
            (i): CashMovement => ({
                kind: 'input',
                id: Number(i.id),
                amount: Number(i.amount ?? 0),
                // ⚠️ On force une string non vide, jamais undefined
                label: String(i.source ?? ''),
                reference: i.reference ?? null,
                notes: i.notes ?? null,
                created_at: String(i.created_at ?? ''),
                source: (i.source as CashInputSource) ?? 'OTHER',
            }),
        ),
        ...outputs.map(
            (o): CashMovement => ({
                kind: 'output',
                id: Number(o.id),
                amount: Number(o.amount ?? 0),
                label: String(o.reason ?? ''),
                reference: o.reference ?? null,
                notes: o.notes ?? null,
                created_at: String(o.created_at ?? ''),
                reason: String(o.reason ?? ''),
                beneficiary: o.beneficiary ?? null,
            }),
        ),
    ];

    return all
        .sort((a, b) =>
            String(b.created_at ?? '').localeCompare(String(a.created_at ?? '')),
        )
        .slice(0, limit);
},

    /** Liste paginée pour l’écran d’historique. */
    async list(
        orgId: number | null,
        filters: CashFilters = {},
    ): Promise<{ data: CashRegisterRow[]; total: number }> {
        const db = await getDb();

        const where: string[] = ['1 = 1'];
        const params: (string | number)[] = [];

        if (orgId) {
            where.push('r.organization_id = ?');
            params.push(orgId);
        }

        if (filters.status) {
            where.push('r.status = ?');
            params.push(filters.status);
        }

        if (filters.start_date) {
            where.push('r.date >= ?');
            params.push(filters.start_date);
        }

        if (filters.end_date) {
            where.push('r.date <= ?');
            params.push(filters.end_date);
        }

        const whereSql = `WHERE ${where.join(' AND ')}`;

        const totalRow = await db.getFirstAsync<{ total: number }>(
            `SELECT COUNT(*) AS total FROM cash_registers r ${whereSql}`,
            params,
        );

        const rows = await db.getAllAsync<CashRegisterRow>(
            `SELECT r.*, u.name AS user_name
             FROM cash_registers r
             LEFT JOIN users u ON u.id = r.user_id
             ${whereSql}
             ORDER BY r.date DESC, r.id DESC
             LIMIT 50`,
            params,
        );

        return { data: rows, total: totalRow?.total ?? 0 };
    },

    /** Détail complet : register + inputs + outputs. */
    async findWithMovements(registerId: number): Promise<{
        register: CashRegisterRow | null;
        inputs: CashInput[];
        outputs: CashOutput[];
    }> {
        const db = await getDb();

        const register = await db.getFirstAsync<CashRegisterRow>(
            `SELECT r.*, u.name AS user_name
             FROM cash_registers r
             LEFT JOIN users u ON u.id = r.user_id
             WHERE r.id = ?`,
            [registerId],
        );

        const inputs = await db.getAllAsync<CashInput>(
            `SELECT * FROM cash_inputs WHERE cash_register_id = ?
             ORDER BY created_at DESC`,
            [registerId],
        );

        const outputs = await db.getAllAsync<CashOutput>(
            `SELECT * FROM cash_outputs WHERE cash_register_id = ?
             ORDER BY created_at DESC`,
            [registerId],
        );

        return { register, inputs, outputs };
    },
};