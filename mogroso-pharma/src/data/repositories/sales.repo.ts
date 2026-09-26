// src/data/repositories/sales.repo.ts
import { getDb } from '../db/client';
import type {
    NewSaleInput,
    SaleFilters,
    SaleItemRow,
    SaleRow,
} from '../types/sale';

export const SalesRepo = {
    // ---------------------------------------------------------
    // LISTE
    // ---------------------------------------------------------
    async list(
        orgId: number | null,
        filters: SaleFilters = {},
    ): Promise<{ data: SaleRow[]; total: number }> {
        const db = await getDb();

        const where: string[] = ['s.deleted_at IS NULL'];
        const params: (string | number)[] = [];

        if (orgId) {
            where.push('s.organization_id = ?');
            params.push(orgId);
        }
        if (filters.search) {
            where.push('(s.reference LIKE ? OR s.customer_name LIKE ?)');
            const q = `%${filters.search}%`;
            params.push(q, q);
        }
        if (filters.status) {
            where.push('s.payment_status = ?');
            params.push(filters.status);
        }
        if (filters.payment_method) {
            where.push('s.payment_method = ?');
            params.push(filters.payment_method);
        }

        const whereSql = `WHERE ${where.join(' AND ')}`;

        const totalRow = await db.getFirstAsync<{ total: number }>(
            `SELECT COUNT(*) AS total FROM sales s ${whereSql}`,
            params,
        );

        const rows = await db.getAllAsync<SaleRow>(
            `SELECT s.*, u.name AS user_name
             FROM sales s
             LEFT JOIN users u ON u.id = s.user_id
             ${whereSql}
             ORDER BY s.created_at DESC, s.id DESC
             LIMIT 100`,
            params,
        );

        return { data: rows, total: totalRow?.total ?? 0 };
    },

    // ---------------------------------------------------------
    // DÉTAIL
    // ---------------------------------------------------------
    async find(saleId: number): Promise<{
        sale: SaleRow | null;
        items: SaleItemRow[];
    }> {
        const db = await getDb();

        const sale = await db.getFirstAsync<SaleRow>(
            `SELECT s.*, u.name AS user_name
             FROM sales s
             LEFT JOIN users u ON u.id = s.user_id
             WHERE s.id = ?`,
            [saleId],
        );

        const items = await db.getAllAsync<SaleItemRow>(
            `SELECT si.*,
                    a.name AS article_name,
                    a.sku  AS article_sku,
                    a.units_per_pack AS article_units_per_pack
             FROM sale_items si
             LEFT JOIN articles a ON a.id = si.article_id
             WHERE si.sale_id = ?
             ORDER BY si.id ASC`,
            [saleId],
        );

        return { sale, items };
    },

    // ---------------------------------------------------------
    // CRÉATION (transactionnelle)
    // ---------------------------------------------------------
    async create(
        input: NewSaleInput,
    ): Promise<{ sale_id: number; reference: string }> {
        const db = await getDb();

        let saleId = 0;
        let reference = '';

        await db.withTransactionAsync(async () => {
            // ---- 1) Générer la référence unique
            await db.runAsync(
                `INSERT OR IGNORE INTO sequences (key, last_value) VALUES ('sale', 0)`,
            );
            await db.runAsync(
                `UPDATE sequences SET last_value = last_value + 1, updated_at = datetime('now')
                 WHERE key = 'sale'`,
            );
            const seqRow = await db.getFirstAsync<{ last_value: number }>(
                `SELECT last_value FROM sequences WHERE key = 'sale'`,
            );
            const seq = seqRow?.last_value ?? 1;

            const now = new Date();
            const y = now.getFullYear();
            const mo = String(now.getMonth() + 1).padStart(2, '0');
            const d = String(now.getDate()).padStart(2, '0');
            reference = `FAC-${y}${mo}${d}-${String(seq).padStart(4, '0')}`;

            // ---- 2) Vérifier stocks + calculer subtotal
            let subtotal = 0;
            const lines: Array<{
                article_id: number;
                quantity: number;
                quantity_type: 'PACK' | 'UNIT';
                unit_price: number;
                subtotal: number;
                effective_qty: number;
                stock_before: number;
                stock_after: number;
            }> = [];

            for (const item of input.items) {
                const art = await db.getFirstAsync<{
                    current_stock: number;
                    units_per_pack: number | null;
                    name: string;
                }>(
                    `SELECT current_stock, units_per_pack, name
                     FROM articles WHERE id = ? AND deleted_at IS NULL`,
                    [item.article_id],
                );
                if (!art) {
                    throw new Error(`Article #${item.article_id} introuvable.`);
                }

                const upp = art.units_per_pack ?? 1;
                const effectiveQty =
                    item.quantity_type === 'PACK'
                        ? item.quantity * upp
                        : item.quantity;

                if (art.current_stock < effectiveQty) {
                    throw new Error(
                        `Stock insuffisant pour « ${art.name} » : ${art.current_stock} dispo, ${effectiveQty} demandé.`,
                    );
                }

                const lineSubtotal = item.quantity * item.unit_price;
                subtotal += lineSubtotal;

                lines.push({
                    article_id: item.article_id,
                    quantity: item.quantity,
                    quantity_type: item.quantity_type,
                    unit_price: item.unit_price,
                    subtotal: lineSubtotal,
                    effective_qty: effectiveQty,
                    stock_before: art.current_stock,
                    stock_after: art.current_stock - effectiveQty,
                });
            }

            const totalAmount = Math.max(0, subtotal - input.discount);
            const changeAmount = Math.max(0, input.amount_paid - totalAmount);

            // ---- 3) Insérer la vente
            const saleRes = await db.runAsync(
                `INSERT INTO sales
                    (organization_id, user_id, cash_register_id, reference,
                     subtotal, discount, tax, total_amount, payment_method,
                     payment_status, amount_paid, change_amount,
                     customer_name, customer_phone, notes)
                 VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, 'PAID', ?, ?, ?, ?, ?)`,
                [
                    input.organization_id,
                    input.user_id,
                    input.cash_register_id,
                    reference,
                    subtotal,
                    input.discount,
                    totalAmount,
                    input.payment_method,
                    input.amount_paid,
                    changeAmount,
                    input.customer_name,
                    input.customer_phone,
                    input.notes,
                ],
            );
            saleId = saleRes.lastInsertRowId;

            // ---- 4) Insérer les items + mouvements + màj stock
            for (const line of lines) {
                await db.runAsync(
                    `INSERT INTO sale_items
                        (organization_id, sale_id, article_id, quantity,
                         quantity_type, unit_price, discount, subtotal)
                     VALUES (?, ?, ?, ?, ?, ?, 0, ?)`,
                    [
                        input.organization_id,
                        saleId,
                        line.article_id,
                        line.quantity,
                        line.quantity_type,
                        line.unit_price,
                        line.subtotal,
                    ],
                );

                await db.runAsync(
                    `INSERT INTO stock_movements
                        (organization_id, article_id, user_id, movement_type,
                         quantity, quantity_type, stock_before, stock_after,
                         reason, reference)
                     VALUES (?, ?, ?, 'SALE', ?, ?, ?, ?, 'Vente', ?)`,
                    [
                        input.organization_id,
                        line.article_id,
                        input.user_id,
                        line.quantity,
                        line.quantity_type,
                        line.stock_before,
                        line.stock_after,
                        reference,
                    ],
                );

                await db.runAsync(
                    `UPDATE articles
                     SET current_stock = ?, updated_at = datetime('now')
                     WHERE id = ?`,
                    [line.stock_after, line.article_id],
                );
            }

            // ---- 5) Cash input + maj caisse
            if (input.cash_register_id) {
                await db.runAsync(
                    `INSERT INTO cash_inputs
                        (organization_id, cash_register_id, sale_id, user_id,
                         amount, source, reference)
                     VALUES (?, ?, ?, ?, ?, 'SALE', ?)`,
                    [
                        input.organization_id,
                        input.cash_register_id,
                        saleId,
                        input.user_id,
                        totalAmount,
                        reference,
                    ],
                );

                await db.runAsync(
                    `UPDATE cash_registers
                     SET total_input = total_input + ?, updated_at = datetime('now')
                     WHERE id = ?`,
                    [totalAmount, input.cash_register_id],
                );
            }
        });

        return { sale_id: saleId, reference };
    },

    // ---------------------------------------------------------
    // ANNULATION
    // ---------------------------------------------------------
    async cancel(saleId: number): Promise<void> {
        const db = await getDb();

        await db.withTransactionAsync(async () => {
            const sale = await db.getFirstAsync<{
                reference: string;
                payment_status: string;
                cash_register_id: number | null;
                total_amount: number;
                user_id: number;
                organization_id: number | null;
            }>(
                `SELECT reference, payment_status, cash_register_id,
                        total_amount, user_id, organization_id
                 FROM sales WHERE id = ?`,
                [saleId],
            );

            if (!sale) throw new Error('Vente introuvable.');
            if (sale.payment_status === 'CANCELLED') {
                throw new Error('Cette vente est déjà annulée.');
            }

            const items = await db.getAllAsync<{
                article_id: number;
                quantity: number;
                quantity_type: 'PACK' | 'UNIT';
            }>(
                `SELECT article_id, quantity, quantity_type
                 FROM sale_items WHERE sale_id = ?`,
                [saleId],
            );

            // Restaure le stock
            for (const item of items) {
                const art = await db.getFirstAsync<{
                    current_stock: number;
                    units_per_pack: number | null;
                }>(
                    `SELECT current_stock, units_per_pack FROM articles WHERE id = ?`,
                    [item.article_id],
                );
                if (!art) continue;

                const upp = art.units_per_pack ?? 1;
                const effectiveQty =
                    item.quantity_type === 'PACK'
                        ? item.quantity * upp
                        : item.quantity;

                const stockBefore = art.current_stock;
                const stockAfter = stockBefore + effectiveQty;

                await db.runAsync(
                    `INSERT INTO stock_movements
                        (organization_id, article_id, user_id, movement_type,
                         quantity, quantity_type, stock_before, stock_after,
                         reason, reference)
                     VALUES (?, ?, ?, 'RETURN', ?, ?, ?, ?, 'Annulation vente', ?)`,
                    [
                        sale.organization_id,
                        item.article_id,
                        sale.user_id,
                        item.quantity,
                        item.quantity_type,
                        stockBefore,
                        stockAfter,
                        sale.reference,
                    ],
                );

                await db.runAsync(
                    `UPDATE articles
                     SET current_stock = ?, updated_at = datetime('now')
                     WHERE id = ?`,
                    [stockAfter, item.article_id],
                );
            }

            // Retire le cash_input associé
            if (sale.cash_register_id) {
                const cashInput = await db.getFirstAsync<{
                    id: number;
                    amount: number;
                }>(
                    `SELECT id, amount FROM cash_inputs WHERE sale_id = ?`,
                    [saleId],
                );

                if (cashInput) {
                    await db.runAsync(
                        `DELETE FROM cash_inputs WHERE id = ?`,
                        [cashInput.id],
                    );
                    await db.runAsync(
                        `UPDATE cash_registers
                         SET total_input = MAX(0, total_input - ?),
                             updated_at = datetime('now')
                         WHERE id = ?`,
                        [cashInput.amount, sale.cash_register_id],
                    );
                }
            }

            await db.runAsync(
                `UPDATE sales
                 SET payment_status = 'CANCELLED', updated_at = datetime('now')
                 WHERE id = ?`,
                [saleId],
            );
        });
    },
};