// src/data/repositories/stockMovements.repo.ts
import { getDb } from '../db/client';
import type {
    StockMovementFilters,
    StockMovementRow,
    StockMovementType,
    StockQuantityType,
} from '../types/stock';

export const StockMovementsRepo = {
    async list(
        filters: StockMovementFilters = {},
    ): Promise<{ data: StockMovementRow[]; total: number }> {
        const db = await getDb();

        const where: string[] = ['1 = 1'];
        const params: (string | number)[] = [];

        if (filters.search) {
            where.push('(a.name LIKE ? OR a.sku LIKE ? OR a.barcode LIKE ?)');
            const s = `%${filters.search}%`;
            params.push(s, s, s);
        }

        if (filters.article_id) {
            where.push('m.article_id = ?');
            params.push(filters.article_id);
        }

        if (filters.movement_type) {
            where.push('m.movement_type = ?');
            params.push(filters.movement_type);
        }

        const whereSql = `WHERE ${where.join(' AND ')}`;

        const totalRow = await db.getFirstAsync<{ total: number }>(
            `SELECT COUNT(*) AS total
             FROM stock_movements m
             LEFT JOIN articles a ON a.id = m.article_id
             ${whereSql}`,
            params,
        );

        const page = filters.page ?? 1;
        const perPage = filters.per_page ?? 20;
        const offset = (page - 1) * perPage;

        const rows = await db.getAllAsync<StockMovementRow>(
            `SELECT m.*,
                    a.name AS article_name,
                    a.sku  AS article_sku,
                    a.units_per_pack AS article_units_per_pack,
                    u.name AS user_name
             FROM stock_movements m
             LEFT JOIN articles a ON a.id = m.article_id
             LEFT JOIN users    u ON u.id = m.user_id
             ${whereSql}
             ORDER BY m.created_at DESC, m.id DESC
             LIMIT ? OFFSET ?`,
            [...params, perPage, offset],
        );

        return { data: rows, total: totalRow?.total ?? 0 };
    },

    /**
     * Crée un mouvement, met à jour le stock de l'article,
     * le tout dans une transaction.
     */
    async create(input: {
        organization_id: number | null;
        article_id: number;
        user_id: number;
        movement_type: StockMovementType;
        quantity: number;
        quantity_type: StockQuantityType;
        reason: string | null;
        reference: string | null;
        notes: string | null;
    }): Promise<number> {
        const db = await getDb();

        // Charge l'article pour connaître le stock actuel et units_per_pack
        const article = await db.getFirstAsync<{
            id: number;
            current_stock: number;
            units_per_pack: number | null;
        }>(
            `SELECT id, current_stock, units_per_pack
             FROM articles WHERE id = ? AND deleted_at IS NULL`,
            [input.article_id],
        );

        if (!article) throw new Error('Article introuvable.');

        // Quantité réelle (unité de base)
        const unitsPerPack = article.units_per_pack ?? 1;
        const effectiveQty =
            input.quantity_type === 'PACK'
                ? input.quantity * unitsPerPack
                : input.quantity;

        const stockBefore = article.current_stock;

        // Calcul du stock après selon le type
        let stockAfter = stockBefore;
        if (input.movement_type === 'IN' || input.movement_type === 'RETURN') {
            stockAfter = stockBefore + effectiveQty;
        } else if (input.movement_type === 'OUT' || input.movement_type === 'SALE') {
            stockAfter = stockBefore - effectiveQty;
        } else if (input.movement_type === 'ADJUSTMENT') {
            // Ajustement : la quantité représente le nouveau stock total
            stockAfter = effectiveQty;
        }

        if (stockAfter < 0) {
            throw new Error(
                `Stock insuffisant. Stock actuel : ${stockBefore}, demandé : ${effectiveQty}.`,
            );
        }

        let movementId = 0;

        await db.withTransactionAsync(async () => {
            const r = await db.runAsync(
                `INSERT INTO stock_movements
                    (organization_id, article_id, user_id, movement_type,
                     quantity, quantity_type, stock_before, stock_after,
                     reason, reference, notes)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    input.organization_id,
                    input.article_id,
                    input.user_id,
                    input.movement_type,
                    input.quantity,
                    input.quantity_type,
                    stockBefore,
                    stockAfter,
                    input.reason,
                    input.reference,
                    input.notes,
                ],
            );
            movementId = r.lastInsertRowId;

            await db.runAsync(
                `UPDATE articles
                 SET current_stock = ?, updated_at = datetime('now')
                 WHERE id = ?`,
                [stockAfter, input.article_id],
            );
        });

        return movementId;
    },
};