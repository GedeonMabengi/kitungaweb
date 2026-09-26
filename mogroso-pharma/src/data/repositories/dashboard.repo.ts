// src/data/repositories/dashboard.repo.ts
import { getDb } from '../db/client';

export type DashboardStats = {
    totalArticles: number;
    lowStockCount: number;
    todaySales: number;
    todaySalesCount: number;
    monthSales: number;
};

export type RecentSale = {
    id: number;
    reference: string;
    total_amount: number;
    created_at: string;
    customer_name: string | null;
    user_name: string | null;
};

export type RecentMovement = {
    id: number;
    movement_type: string;
    quantity: number;
    created_at: string;
    article_name: string | null;
    user_name: string | null;
};

export type ExpiringArticle = {
    id: number;
    name: string;
    expiration_date: string | null;
    current_stock: number;
};

export type OpenRegister = {
    id: number;
    opening_balance: number;
    total_input: number;
    total_output: number;
    opened_at: string;
} | null;

export const DashboardRepo = {
    async stats(orgId: number | null): Promise<DashboardStats> {
        const db = await getDb();
        const orgFilter = orgId ? 'AND organization_id = ?' : '';
        const orgParams = orgId ? [orgId] : [];

        // Articles actifs
        const articlesRow = await db.getFirstAsync<{ count: number }>(
            `SELECT COUNT(*) AS count FROM articles
             WHERE deleted_at IS NULL AND is_active = 1 ${orgFilter}`,
            orgParams,
        );

        // Stock faible
        const lowStockRow = await db.getFirstAsync<{ count: number }>(
            `SELECT COUNT(*) AS count FROM articles
             WHERE deleted_at IS NULL AND is_active = 1
               AND current_stock <= alert_threshold ${orgFilter}`,
            orgParams,
        );

        // Ventes du jour
        const todayRow = await db.getFirstAsync<{
            total: number;
            count: number;
        }>(
            `SELECT
                COALESCE(SUM(total_amount), 0) AS total,
                COUNT(*) AS count
             FROM sales
             WHERE deleted_at IS NULL
               AND payment_status <> 'CANCELLED'
               AND date(created_at) = date('now') ${orgFilter}`,
            orgParams,
        );

        // Ventes du mois
        const monthRow = await db.getFirstAsync<{ total: number }>(
            `SELECT COALESCE(SUM(total_amount), 0) AS total
             FROM sales
             WHERE deleted_at IS NULL
               AND payment_status <> 'CANCELLED'
               AND strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now') ${orgFilter}`,
            orgParams,
        );

        return {
            totalArticles: articlesRow?.count ?? 0,
            lowStockCount: lowStockRow?.count ?? 0,
            todaySales: todayRow?.total ?? 0,
            todaySalesCount: todayRow?.count ?? 0,
            monthSales: monthRow?.total ?? 0,
        };
    },

    async recentSales(
        orgId: number | null,
        limit = 5,
    ): Promise<RecentSale[]> {
        const db = await getDb();
        const orgFilter = orgId ? 'AND s.organization_id = ?' : '';
        const params = orgId ? [orgId, limit] : [limit];

        return db.getAllAsync<RecentSale>(
            `SELECT s.id, s.reference, s.total_amount, s.created_at,
                    s.customer_name, u.name AS user_name
             FROM sales s
             LEFT JOIN users u ON u.id = s.user_id
             WHERE s.deleted_at IS NULL ${orgFilter}
             ORDER BY s.created_at DESC, s.id DESC
             LIMIT ?`,
            params,
        );
    },

    async recentMovements(
        orgId: number | null,
        limit = 5,
    ): Promise<RecentMovement[]> {
        const db = await getDb();
        const orgFilter = orgId ? 'AND m.organization_id = ?' : '';
        const params = orgId ? [orgId, limit] : [limit];

        return db.getAllAsync<RecentMovement>(
            `SELECT m.id, m.movement_type, m.quantity, m.created_at,
                    a.name AS article_name, u.name AS user_name
             FROM stock_movements m
             LEFT JOIN articles a ON a.id = m.article_id
             LEFT JOIN users    u ON u.id = m.user_id
             WHERE 1 = 1 ${orgFilter}
             ORDER BY m.created_at DESC, m.id DESC
             LIMIT ?`,
            params,
        );
    },

    async expiringArticles(
        orgId: number | null,
        daysAhead = 30,
        limit = 5,
    ): Promise<ExpiringArticle[]> {
        const db = await getDb();
        const orgFilter = orgId ? 'AND organization_id = ?' : '';
        const params = orgId ? [orgId, daysAhead, limit] : [daysAhead, limit];

        return db.getAllAsync<ExpiringArticle>(
            `SELECT id, name, expiration_date, current_stock
             FROM articles
             WHERE deleted_at IS NULL
               AND is_active = 1
               AND expiration_date IS NOT NULL
               AND date(expiration_date) <= date('now', '+' || ? || ' days')
               AND date(expiration_date) >= date('now')
               ${orgFilter}
             ORDER BY expiration_date ASC
             LIMIT ?`,
            params,
        );
    },

    async openRegister(orgId: number | null): Promise<OpenRegister> {
        const db = await getDb();
        const orgFilter = orgId ? 'AND organization_id = ?' : '';
        const params = orgId ? [orgId] : [];

        return (
            (await db.getFirstAsync<OpenRegister>(
                `SELECT id, opening_balance, total_input, total_output, opened_at
                 FROM cash_registers
                 WHERE status = 'OPEN' ${orgFilter}
                 ORDER BY opened_at DESC
                 LIMIT 1`,
                params,
            )) ?? null
        );
    },
};