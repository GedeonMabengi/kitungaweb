// src/data/types/reports.ts
export type ReportsFilters = {
    start_date?: string; // YYYY-MM-DD
    end_date?: string;
};

export type SalesTotals = {
    count: number;
    amount: number;
};

export type SalesByDay = {
    date: string;
    count: number;
    total: number;
};

export type SalesByUser = {
    user_id: number | null;
    user_name: string | null;
    count: number;
    total: number;
};

export type TopArticle = {
    id: number;
    name: string;
    total_quantity: number;
    total_revenue: number;
};

export type RecentSaleRow = {
    id: number;
    reference: string;
    customer_name: string | null;
    user_name: string | null;
    total_amount: number;
    created_at: string;
};

export type CashTotals = {
    opening: number;
    inputs: number;
    outputs: number;
    difference: number;
};

export type DailyCashSummary = {
    id: number;
    date: string;
    user_name: string | null;
    status: 'OPEN' | 'CLOSED';
    opening_balance: number;
    total_input: number;
    total_output: number;
    difference: number | null;
};

export type StockTotals = {
    stockValue: number;
    lowStockCount: number;
    expiringSoonCount: number;
    expiredCount: number;
};

export type LowStockArticle = {
    id: number;
    name: string;
    current_stock: number;
    alert_threshold: number;
};

export type ExpiringArticle = {
    id: number;
    name: string;
    expiration_date: string | null;
    current_stock: number;
};

export type MovementSummary = {
    movement_type: string;
    count: number;
    total_quantity: number;
};

export type RecentMovementRow = {
    id: number;
    article_name: string | null;
    user_name: string | null;
    movement_type: string;
    quantity: number;
    created_at: string;
};

/** Plage par défaut : mois en cours. */
export function defaultRange(): { start_date: string; end_date: string } {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const first = new Date(y, m, 1);
    const last = new Date(y, m + 1, 0);
    const fmt = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
            d.getDate(),
        ).padStart(2, '0')}`;
    return { start_date: fmt(first), end_date: fmt(last) };
}