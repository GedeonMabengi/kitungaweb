// src/data/repositories/users.repo.ts
import { getDb } from '../db/client';
import type {
    UserFilters,
    UserRow,
    UserStats,
    UserWithRoles,
} from '../types/user';
import { toUserWithRoles } from '../types/user';

export const UsersRepo = {
    // ---------------------------------------------------------
    // LISTE
    // ---------------------------------------------------------
    async list(
        orgId: number | null,
        filters: UserFilters = {},
    ): Promise<UserWithRoles[]> {
        const db = await getDb();

        const where: string[] = ['1 = 1'];
        const params: (string | number)[] = [];

        if (orgId) {
            where.push('organization_id = ?');
            params.push(orgId);
        }
        if (filters.search) {
            where.push('(name LIKE ? OR email LIKE ?)');
            const q = `%${filters.search}%`;
            params.push(q, q);
        }
        if (filters.active === '1') where.push('is_active = 1');
        if (filters.active === '0') where.push('is_active = 0');
        if (filters.role) {
            // roles est un JSON array stocké en texte — on filtre en LIKE
            where.push('roles LIKE ?');
            params.push(`%"${filters.role}"%`);
        }

        const rows = await db.getAllAsync<UserRow>(
            `SELECT * FROM users
             WHERE ${where.join(' AND ')}
             ORDER BY name ASC`,
            params,
        );

        return rows.map(toUserWithRoles);
    },

    // ---------------------------------------------------------
    // DÉTAIL
    // ---------------------------------------------------------
    async find(id: number): Promise<UserWithRoles | null> {
        const db = await getDb();
        const row = await db.getFirstAsync<UserRow>(
            `SELECT * FROM users WHERE id = ?`,
            [id],
        );
        return row ? toUserWithRoles(row) : null;
    },

    // ---------------------------------------------------------
    // STATS utilisateur
    // ---------------------------------------------------------
    async stats(userId: number): Promise<UserStats> {
        const db = await getDb();

        const sales = await db.getFirstAsync<{
            count: number;
            amount: number;
        }>(
            `SELECT COUNT(*) AS count,
                    COALESCE(SUM(total_amount), 0) AS amount
             FROM sales
             WHERE user_id = ? AND deleted_at IS NULL
               AND payment_status <> 'CANCELLED'`,
            [userId],
        );

        const movements = await db.getFirstAsync<{ count: number }>(
            `SELECT COUNT(*) AS count FROM stock_movements WHERE user_id = ?`,
            [userId],
        );

        return {
            total_sales: sales?.count ?? 0,
            total_sales_amount: sales?.amount ?? 0,
            stock_movements: movements?.count ?? 0,
        };
    },

    // ---------------------------------------------------------
    // CRÉATION
    // ---------------------------------------------------------
    async create(input: {
        organization_id: number | null;
        name: string;
        email: string;
        phone: string | null;
        password: string; // en clair pour l'instant, à hasher plus tard
        role: string;
        is_active: boolean;
    }): Promise<number> {
        const db = await getDb();

        // Vérifie l'unicité de l'email
        const existing = await db.getFirstAsync<{ id: number }>(
            `SELECT id FROM users WHERE email = ?`,
            [input.email.toLowerCase()],
        );
        if (existing) {
            throw new Error('Cet email est déjà utilisé.');
        }

        const r = await db.runAsync(
            `INSERT INTO users
                (organization_id, name, email, phone, password,
                 is_active, roles, permissions)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                input.organization_id,
                input.name.trim(),
                input.email.trim().toLowerCase(),
                input.phone,
                input.password,
                input.is_active ? 1 : 0,
                JSON.stringify([input.role]),
                JSON.stringify([]),
            ],
        );
        return r.lastInsertRowId;
    },

    // ---------------------------------------------------------
    // MISE À JOUR
    // ---------------------------------------------------------
    async update(
        id: number,
        input: {
            name: string;
            email: string;
            phone: string | null;
            password?: string | null;
            role: string;
            is_active: boolean;
        },
    ): Promise<void> {
        const db = await getDb();

        // Unicité email
        const existing = await db.getFirstAsync<{ id: number }>(
            `SELECT id FROM users WHERE email = ? AND id <> ?`,
            [input.email.toLowerCase(), id],
        );
        if (existing) {
            throw new Error('Cet email est déjà utilisé par un autre compte.');
        }

        if (input.password && input.password.length > 0) {
            await db.runAsync(
                `UPDATE users
                 SET name = ?, email = ?, phone = ?, password = ?,
                     is_active = ?, roles = ?,
                     updated_at = datetime('now')
                 WHERE id = ?`,
                [
                    input.name.trim(),
                    input.email.trim().toLowerCase(),
                    input.phone,
                    input.password,
                    input.is_active ? 1 : 0,
                    JSON.stringify([input.role]),
                    id,
                ],
            );
        } else {
            await db.runAsync(
                `UPDATE users
                 SET name = ?, email = ?, phone = ?,
                     is_active = ?, roles = ?,
                     updated_at = datetime('now')
                 WHERE id = ?`,
                [
                    input.name.trim(),
                    input.email.trim().toLowerCase(),
                    input.phone,
                    input.is_active ? 1 : 0,
                    JSON.stringify([input.role]),
                    id,
                ],
            );
        }
    },

    // ---------------------------------------------------------
    // TOGGLE ACTIF / INACTIF
    // ---------------------------------------------------------
    async toggleActive(id: number): Promise<boolean> {
        const db = await getDb();
        const row = await db.getFirstAsync<{ is_active: number }>(
            `SELECT is_active FROM users WHERE id = ?`,
            [id],
        );
        if (!row) throw new Error('Utilisateur introuvable.');
        const next = row.is_active === 1 ? 0 : 1;
        await db.runAsync(
            `UPDATE users SET is_active = ?, updated_at = datetime('now') WHERE id = ?`,
            [next, id],
        );
        return next === 1;
    },

    // ---------------------------------------------------------
    // SUPPRESSION
    // ---------------------------------------------------------
    async remove(id: number): Promise<void> {
        const db = await getDb();
        // Empêche la suppression de soi-même ou du dernier admin — vérification côté écran
        await db.runAsync(`DELETE FROM users WHERE id = ?`, [id]);
    },
};