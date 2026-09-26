// src/data/repositories/articles.repo.ts
import { getDb } from '../db/client';
import type { ArticleFilters, ArticleRow } from '../types/article';

export const ArticlesRepo = {

        /** Stats de vente pour un article (CA + quantité vendue). */
    async stats(articleId: number): Promise<{
        total_sold: number;
        total_revenue: number;
    }> {
        const db = await getDb();
        const row = await db.getFirstAsync<{
            total_sold: number;
            total_revenue: number;
        }>(
            `SELECT
                COALESCE(SUM(si.quantity), 0)  AS total_sold,
                COALESCE(SUM(si.subtotal), 0)  AS total_revenue
             FROM sale_items si
             JOIN sales s ON s.id = si.sale_id
             WHERE si.article_id = ?
               AND s.deleted_at IS NULL
               AND s.payment_status <> 'CANCELLED'`,
            [articleId],
        );
        return row ?? { total_sold: 0, total_revenue: 0 };
    },

    /** Derniers mouvements de stock d’un article. */
    async recentMovements(
        articleId: number,
        limit = 10,
    ): Promise<
        Array<{
            id: number;
            movement_type: string;
            quantity: number;
            quantity_type: string;
            stock_before: number;
            stock_after: number;
            reason: string | null;
            created_at: string;
            user_name: string | null;
        }>
    > {
        const db = await getDb();
        return db.getAllAsync(
            `SELECT m.id, m.movement_type, m.quantity, m.quantity_type,
                    m.stock_before, m.stock_after, m.reason, m.created_at,
                    u.name AS user_name
             FROM stock_movements m
             LEFT JOIN users u ON u.id = m.user_id
             WHERE m.article_id = ?
             ORDER BY m.created_at DESC
             LIMIT ?`,
            [articleId, limit],
        );
    },

    // --- Dans src/data/repositories/articles.repo.ts, à ajouter dans ArticlesRepo ---

    async create(input: {
        organization_id: number | null;
        name: string;
        category_id: number | null;
        description: string | null;
        price: number;
        cost_price: number | null;
        unit_type: 'PACK' | 'UNIT';
        units_per_pack: number | null;
        unit_price: number | null;
        initial_quantity: number;
        alert_threshold: number;
        expiration_date: string | null;
        barcode: string | null;
        is_active: boolean;
        allow_unit_sale: boolean;
    }): Promise<number> {
        const db = await getDb();

        const slug = await ensureUniqueSlug(db, input.name, input.organization_id);

        const result = await db.runAsync(
            `INSERT INTO articles
                (organization_id, category_id, name, slug, sku, barcode,
                 description, price, cost_price, unit_type, units_per_pack,
                 unit_price, initial_quantity, current_stock, alert_threshold,
                 expiration_date, is_active, allow_unit_sale)
             VALUES (?, ?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                input.organization_id,
                input.category_id,
                input.name,
                slug,
                input.barcode,
                input.description,
                input.price,
                input.cost_price,
                input.unit_type,
                input.units_per_pack,
                input.unit_price,
                input.initial_quantity,
                input.initial_quantity,
                input.alert_threshold,
                input.expiration_date,
                input.is_active ? 1 : 0,
                input.allow_unit_sale ? 1 : 0,
            ],
        );

        const articleId = result.lastInsertRowId;

        // Si stock initial > 0, on crée un mouvement de stock "IN"
        if (input.initial_quantity > 0) {
            await db.runAsync(
                `INSERT INTO stock_movements
                    (organization_id, article_id, user_id, movement_type,
                     quantity, quantity_type, stock_before, stock_after,
                     reason)
                 VALUES (?, ?, 1, 'IN', ?, 'UNIT', 0, ?, 'Stock initial')`,
                [input.organization_id, articleId, input.initial_quantity, input.initial_quantity],
            );
        }

        return articleId;
    },

    async update(
        id: number,
        input: {
            name: string;
            category_id: number | null;
            description: string | null;
            price: number;
            cost_price: number | null;
            unit_type: 'PACK' | 'UNIT';
            units_per_pack: number | null;
            unit_price: number | null;
            alert_threshold: number;
            expiration_date: string | null;
            barcode: string | null;
            is_active: boolean;
            allow_unit_sale: boolean;
        },
    ): Promise<void> {
        const db = await getDb();
        await db.runAsync(
            `UPDATE articles
             SET category_id = ?, name = ?, barcode = ?, description = ?,
                 price = ?, cost_price = ?, unit_type = ?, units_per_pack = ?,
                 unit_price = ?, alert_threshold = ?, expiration_date = ?,
                 is_active = ?, allow_unit_sale = ?,
                 updated_at = datetime('now')
             WHERE id = ?`,
            [
                input.category_id,
                input.name,
                input.barcode,
                input.description,
                input.price,
                input.cost_price,
                input.unit_type,
                input.units_per_pack,
                input.unit_price,
                input.alert_threshold,
                input.expiration_date,
                input.is_active ? 1 : 0,
                input.allow_unit_sale ? 1 : 0,
                id,
            ],
        );
    },

    async list(
        filters: ArticleFilters = {},
    ): Promise<{ data: ArticleRow[]; total: number }> {
        const db = await getDb();

        const where: string[] = ['a.deleted_at IS NULL'];
        const params: (string | number)[] = [];

        if (filters.search) {
            where.push('(a.name LIKE ? OR a.sku LIKE ? OR a.barcode LIKE ?)');
            const s = `%${filters.search}%`;
            params.push(s, s, s);
        }

        if (filters.category_id) {
            where.push('a.category_id = ?');
            params.push(filters.category_id);
        }

        if (filters.stock_status === 'out') {
            where.push('a.current_stock <= 0');
        } else if (filters.stock_status === 'low') {
            where.push('a.current_stock > 0 AND a.current_stock <= a.alert_threshold');
        } else if (filters.stock_status === 'ok') {
            where.push('a.current_stock > a.alert_threshold');
        }

        const whereSql = `WHERE ${where.join(' AND ')}`;

        const totalRow = await db.getFirstAsync<{ total: number }>(
            `SELECT COUNT(*) AS total FROM articles a ${whereSql}`,
            params,
        );

        const page = filters.page ?? 1;
        const perPage = filters.per_page ?? 20;
        const offset = (page - 1) * perPage;

        const rows = await db.getAllAsync<ArticleRow>(
            `SELECT a.*, c.name AS category_name
             FROM articles a
             LEFT JOIN categories c ON c.id = a.category_id
             ${whereSql}
             ORDER BY a.name ASC
             LIMIT ? OFFSET ?`,
            [...params, perPage, offset],
        );

        return { data: rows, total: totalRow?.total ?? 0 };
    },

    async find(id: number): Promise<ArticleRow | null> {
        const db = await getDb();
        return db.getFirstAsync<ArticleRow>(
            `SELECT a.*, c.name AS category_name
             FROM articles a
             LEFT JOIN categories c ON c.id = a.category_id
             WHERE a.id = ? AND a.deleted_at IS NULL`,
            [id],
        );
    },

    async softDelete(id: number): Promise<void> {
        const db = await getDb();
        await db.runAsync(
            `UPDATE articles
             SET deleted_at = datetime('now'), updated_at = datetime('now')
             WHERE id = ?`,
            [id],
        );
    },
};

// --- Helpers ---
function slugify(s: string): string {
    return s
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

async function ensureUniqueSlug(
    db: any,
    name: string,
    organizationId: number | null,
): Promise<string> {
    const base = slugify(name) || 'article';
    let slug = base;
    let i = 1;
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const row = await db.getFirstAsync<{ id: number }>(
            `SELECT id FROM articles WHERE slug = ? AND organization_id = ? AND deleted_at IS NULL`,
            [slug, organizationId],
        );
        if (!row) return slug;
        i++;
        slug = `${base}-${i}`;
    }
}