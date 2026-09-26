// src/data/repositories/reports.repo.ts
import { getDb } from '../db/client';
import type {
    CashTotals,
    DailyCashSummary,
    ExpiringArticle,
    LowStockArticle,
    MovementSummary,
    RecentMovementRow,
    RecentSaleRow,
    ReportsFilters,
    SalesByDay,
    SalesByUser,
    SalesTotals,
    StockTotals,
    TopArticle,
} from '../types/reports';

type Range = { start: string; end: string };

function normalizeRange(f: ReportsFilters, def: Range): Range {
    return {
        start: f.start_date || def.start,
        end: f.end_date || def.end,
    };
}

export const ReportsRepo = {
    // ---------------------------------------------------------
    // SALES
    // ---------------------------------------------------------
    async salesTotals(
        orgId: number | null,
        f: ReportsFilters,
        def: Range,
    ): Promise<SalesTotals> {
        const db = await getDb();
        const { start, end } = normalizeRange(f, def);
        const org = orgId ? 'AND organization_id = ?' : '';
        const params = orgId ? [start, end, orgId] : [start, end];

        const row = await db.getFirstAsync<{ count: number; amount: number }>(
            `SELECT COUNT(*) AS count,
                    COALESCE(SUM(total_amount), 0) AS amount
             FROM sales
             WHERE deleted_at IS NULL
               AND payment_status <> 'CANCELLED'
               AND date(created_at) BETWEEN date(?) AND date(?)
               ${org}`,
            params,
        );
        return { count: row?.count ?? 0, amount: row?.amount ?? 0 };
    },

    async salesByDay(
        orgId: number | null,
        f: ReportsFilters,
        def: Range,
    ): Promise<SalesByDay[]> {
        const db = await getDb();
        const { start, end } = normalizeRange(f, def);
        const org = orgId ? 'AND organization_id = ?' : '';
        const params = orgId ? [start, end, orgId] : [start, end];

        return db.getAllAsync<SalesByDay>(
            `SELECT date(created_at) AS date,
                    COUNT(*) AS count,
                    COALESCE(SUM(total_amount), 0) AS total
             FROM sales
             WHERE deleted_at IS NULL
               AND payment_status <> 'CANCELLED'
               AND date(created_at) BETWEEN date(?) AND date(?)
               ${org}
             GROUP BY date(created_at)
             ORDER BY date(created_at) DESC`,
            params,
        );
    },

    async salesByUser(
        orgId: number | null,
        f: ReportsFilters,
        def: Range,
    ): Promise<SalesByUser[]> {
        const db = await getDb();
        const { start, end } = normalizeRange(f, def);
        const org = orgId ? 'AND s.organization_id = ?' : '';
        const params = orgId ? [start, end, orgId] : [start, end];

        return db.getAllAsync<SalesByUser>(
            `SELECT s.user_id AS user_id,
                    u.name AS user_name,
                    COUNT(*) AS count,
                    COALESCE(SUM(s.total_amount), 0) AS total
             FROM sales s
             LEFT JOIN users u ON u.id = s.user_id
             WHERE s.deleted_at IS NULL
               AND s.payment_status <> 'CANCELLED'
               AND date(s.created_at) BETWEEN date(?) AND date(?)
               ${org}
             GROUP BY s.user_id
             ORDER BY total DESC`,
            params,
        );
    },

    async topArticles(
        orgId: number | null,
        f: ReportsFilters,
        def: Range,
        limit = 10,
    ): Promise<TopArticle[]> {
        const db = await getDb();
        const { start, end } = normalizeRange(f, def);
        const org = orgId ? 'AND s.organization_id = ?' : '';
        const params: any[] = orgId
            ? [start, end, orgId, limit]
            : [start, end, limit];

        return db.getAllAsync<TopArticle>(
            `SELECT a.id AS id,
                    a.name AS name,
                    COALESCE(SUM(si.quantity), 0) AS total_quantity,
                    COALESCE(SUM(si.subtotal), 0) AS total_revenue
             FROM sale_items si
             JOIN sales s   ON s.id = si.sale_id
             JOIN articles a ON a.id = si.article_id
             WHERE s.deleted_at IS NULL
               AND s.payment_status <> 'CANCELLED'
               AND date(s.created_at) BETWEEN date(?) AND date(?)
               ${org}
             GROUP BY a.id
             ORDER BY total_quantity DESC
             LIMIT ?`,
            params,
        );
    },

    async recentSales(
        orgId: number | null,
        f: ReportsFilters,
        def: Range,
        limit = 10,
    ): Promise<RecentSaleRow[]> {
        const db = await getDb();
        const { start, end } = normalizeRange(f, def);
        const org = orgId ? 'AND s.organization_id = ?' : '';
        const params: any[] = orgId
            ? [start, end, orgId, limit]
            : [start, end, limit];

        return db.getAllAsync<RecentSaleRow>(
            `SELECT s.id, s.reference, s.customer_name, s.total_amount, s.created_at,
                    u.name AS user_name
             FROM sales s
             LEFT JOIN users u ON u.id = s.user_id
             WHERE s.deleted_at IS NULL
               AND date(s.created_at) BETWEEN date(?) AND date(?)
               ${org}
             ORDER BY s.created_at DESC
             LIMIT ?`,
            params,
        );
    },

    // ---------------------------------------------------------
    // CASH
    // ---------------------------------------------------------
    async cashTotals(
        orgId: number | null,
        f: ReportsFilters,
        def: Range,
    ): Promise<CashTotals> {
        const db = await getDb();
        const { start, end } = normalizeRange(f, def);
        const org = orgId ? 'AND organization_id = ?' : '';
        const params = orgId ? [start, end, orgId] : [start, end];

        const row = await db.getFirstAsync<CashTotals>(
            `SELECT COALESCE(SUM(opening_balance), 0) AS opening,
                    COALESCE(SUM(total_input), 0)     AS inputs,
                    COALESCE(SUM(total_output), 0)    AS outputs,
                    COALESCE(SUM(difference), 0)      AS difference
             FROM cash_registers
             WHERE date(date) BETWEEN date(?) AND date(?)
             ${org}`,
            params,
        );
        return (
            row ?? { opening: 0, inputs: 0, outputs: 0, difference: 0 }
        );
    },

    async cashDailySummary(
        orgId: number | null,
        f: ReportsFilters,
        def: Range,
    ): Promise<DailyCashSummary[]> {
        const db = await getDb();
        const { start, end } = normalizeRange(f, def);
        const org = orgId ? 'AND r.organization_id = ?' : '';
        const params = orgId ? [start, end, orgId] : [start, end];

        return db.getAllAsync<DailyCashSummary>(
            `SELECT r.id, r.date, r.status, r.opening_balance,
                    r.total_input, r.total_output, r.difference,
                    u.name AS user_name
             FROM cash_registers r
             LEFT JOIN users u ON u.id = r.user_id
             WHERE date(r.date) BETWEEN date(?) AND date(?)
             ${org}
             ORDER BY r.date DESC`,
            params,
        );
    },

    // ---------------------------------------------------------
    // STOCK
    // ---------------------------------------------------------
    async stockTotals(orgId: number | null): Promise<StockTotals> {
        const db = await getDb();
        const org = orgId ? 'AND organization_id = ?' : '';
        const params = orgId ? [orgId] : [];

        const value = await db.getFirstAsync<{ v: number }>(
            `SELECT COALESCE(SUM(current_stock * price), 0) AS v
             FROM articles
             WHERE deleted_at IS NULL AND is_active = 1 ${org}`,
            params,
        );
        const low = await db.getFirstAsync<{ c: number }>(
            `SELECT COUNT(*) AS c FROM articles
             WHERE deleted_at IS NULL AND is_active = 1
               AND current_stock <= alert_threshold ${org}`,
            params,
        );
        const soon = await db.getFirstAsync<{ c: number }>(
            `SELECT COUNT(*) AS c FROM articles
             WHERE deleted_at IS NULL AND is_active = 1
               AND expiration_date IS NOT NULL
               AND date(expiration_date) BETWEEN date('now') AND date('now','+30 days')
               ${org}`,
            params,
        );
        const expired = await db.getFirstAsync<{ c: number }>(
            `SELECT COUNT(*) AS c FROM articles
             WHERE deleted_at IS NULL AND is_active = 1
               AND expiration_date IS NOT NULL
               AND date(expiration_date) < date('now')
               ${org}`,
            params,
        );

        return {
            stockValue: value?.v ?? 0,
            lowStockCount: low?.c ?? 0,
            expiringSoonCount: soon?.c ?? 0,
            expiredCount: expired?.c ?? 0,
        };
    },

    async lowStockArticles(
        orgId: number | null,
        limit = 20,
    ): Promise<LowStockArticle[]> {
        const db = await getDb();
        const org = orgId ? 'AND organization_id = ?' : '';
        const params: any[] = orgId ? [orgId, limit] : [limit];
        return db.getAllAsync<LowStockArticle>(
            `SELECT id, name, current_stock, alert_threshold
             FROM articles
             WHERE deleted_at IS NULL AND is_active = 1
               AND current_stock <= alert_threshold
               ${org}
             ORDER BY current_stock ASC
             LIMIT ?`,
            params,
        );
    },

    async expiringSoon(
        orgId: number | null,
        daysAhead = 30,
        limit = 20,
    ): Promise<ExpiringArticle[]> {
        const db = await getDb();
        const org = orgId ? 'AND organization_id = ?' : '';
        const params: any[] = orgId
            ? [daysAhead, orgId, limit]
            : [daysAhead, limit];
        return db.getAllAsync<ExpiringArticle>(
            `SELECT id, name, expiration_date, current_stock
             FROM articles
             WHERE deleted_at IS NULL AND is_active = 1
               AND expiration_date IS NOT NULL
               AND date(expiration_date) BETWEEN date('now') AND date('now','+' || ? || ' days')
               ${org}
             ORDER BY expiration_date ASC
             LIMIT ?`,
            params,
        );
    },

    async expiredArticles(
        orgId: number | null,
        limit = 20,
    ): Promise<ExpiringArticle[]> {
        const db = await getDb();
        const org = orgId ? 'AND organization_id = ?' : '';
        const params: any[] = orgId ? [orgId, limit] : [limit];
        return db.getAllAsync<ExpiringArticle>(
            `SELECT id, name, expiration_date, current_stock
             FROM articles
             WHERE deleted_at IS NULL AND is_active = 1
               AND expiration_date IS NOT NULL
               AND date(expiration_date) < date('now')
               ${org}
             ORDER BY expiration_date DESC
             LIMIT ?`,
            params,
        );
    },

    async movementsSummary(
        orgId: number | null,
        f: ReportsFilters,
        def: Range,
    ): Promise<MovementSummary[]> {
        const db = await getDb();
        const { start, end } = normalizeRange(f, def);
        const org = orgId ? 'AND organization_id = ?' : '';
        const params = orgId ? [start, end, orgId] : [start, end];

        return db.getAllAsync<MovementSummary>(
            `SELECT movement_type,
                    COUNT(*) AS count,
                    COALESCE(SUM(quantity), 0) AS total_quantity
             FROM stock_movements
             WHERE date(created_at) BETWEEN date(?) AND date(?)
             ${org}
             GROUP BY movement_type
             ORDER BY movement_type ASC`,
            params,
        );
    },

    async recentMovements(
        orgId: number | null,
        f: ReportsFilters,
        def: Range,
        limit = 10,
    ): Promise<RecentMovementRow[]> {
        const db = await getDb();
        const { start, end } = normalizeRange(f, def);
        const org = orgId ? 'AND m.organization_id = ?' : '';
        const params: any[] = orgId
            ? [start, end, orgId, limit]
            : [start, end, limit];

        return db.getAllAsync<RecentMovementRow>(
            `SELECT m.id, m.movement_type, m.quantity, m.created_at,
                    a.name AS article_name, u.name AS user_name
             FROM stock_movements m
             LEFT JOIN articles a ON a.id = m.article_id
             LEFT JOIN users    u ON u.id = m.user_id
             WHERE date(m.created_at) BETWEEN date(?) AND date(?)
             ${org}
             ORDER BY m.created_at DESC
             LIMIT ?`,
            params,
        );
    },
};