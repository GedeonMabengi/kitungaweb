// src/hooks/useReports.ts
import { useCallback, useEffect, useState } from 'react';
import {
    defaultRange,
    type CashTotals,
    type DailyCashSummary,
    type ExpiringArticle,
    type LowStockArticle,
    type MovementSummary,
    type RecentMovementRow,
    type RecentSaleRow,
    type ReportsFilters,
    type SalesByDay,
    type SalesByUser,
    type SalesTotals,
    type StockTotals,
    type TopArticle,
} from '../data/types/reports';
import { ReportsRepo } from '../data/repositories/reports.repo';
import { useOrganizationStore } from '../store/organization.store';

const DEF = defaultRange();

// -------------------------------------------------------------
// SALES
// -------------------------------------------------------------
export function useSalesReport(initial: ReportsFilters = {}) {
    const orgId = useOrganizationStore((s) => s.organization?.id ?? null);
    const [filters, setFilters] = useState<ReportsFilters>(initial);
    const [totals, setTotals] = useState<SalesTotals>({ count: 0, amount: 0 });
    const [byDay, setByDay] = useState<SalesByDay[]>([]);
    const [byUser, setByUser] = useState<SalesByUser[]>([]);
    const [topArticles, setTopArticles] = useState<TopArticle[]>([]);
    const [recent, setRecent] = useState<RecentSaleRow[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const [t, d, u, ta, r] = await Promise.all([
                ReportsRepo.salesTotals(orgId, filters, DEF),
                ReportsRepo.salesByDay(orgId, filters, DEF),
                ReportsRepo.salesByUser(orgId, filters, DEF),
                ReportsRepo.topArticles(orgId, filters, DEF, 10),
                ReportsRepo.recentSales(orgId, filters, DEF, 10),
            ]);
            setTotals(t);
            setByDay(d);
            setByUser(u);
            setTopArticles(ta);
            setRecent(r);
        } finally {
            setLoading(false);
        }
    }, [orgId, filters]);

    useEffect(() => {
        load();
    }, [load]);

    return {
        totals,
        byDay,
        byUser,
        topArticles,
        recent,
        loading,
        filters,
        setFilters,
        refresh: load,
    };
}

// -------------------------------------------------------------
// CASH
// -------------------------------------------------------------
export function useCashReport(initial: ReportsFilters = {}) {
    const orgId = useOrganizationStore((s) => s.organization?.id ?? null);
    const [filters, setFilters] = useState<ReportsFilters>(initial);
    const [totals, setTotals] = useState<CashTotals>({
        opening: 0,
        inputs: 0,
        outputs: 0,
        difference: 0,
    });
    const [daily, setDaily] = useState<DailyCashSummary[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const [t, d] = await Promise.all([
                ReportsRepo.cashTotals(orgId, filters, DEF),
                ReportsRepo.cashDailySummary(orgId, filters, DEF),
            ]);
            setTotals(t);
            setDaily(d);
        } finally {
            setLoading(false);
        }
    }, [orgId, filters]);

    useEffect(() => {
        load();
    }, [load]);

    return {
        totals,
        daily,
        loading,
        filters,
        setFilters,
        refresh: load,
    };
}

// -------------------------------------------------------------
// STOCK
// -------------------------------------------------------------
export function useStockReport(initial: ReportsFilters = {}) {
    const orgId = useOrganizationStore((s) => s.organization?.id ?? null);
    const [filters, setFilters] = useState<ReportsFilters>(initial);
    const [totals, setTotals] = useState<StockTotals>({
        stockValue: 0,
        lowStockCount: 0,
        expiringSoonCount: 0,
        expiredCount: 0,
    });
    const [lowStock, setLowStock] = useState<LowStockArticle[]>([]);
    const [expiring, setExpiring] = useState<ExpiringArticle[]>([]);
    const [expired, setExpired] = useState<ExpiringArticle[]>([]);
    const [summary, setSummary] = useState<MovementSummary[]>([]);
    const [recent, setRecent] = useState<RecentMovementRow[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const [t, l, e, ex, s, r] = await Promise.all([
                ReportsRepo.stockTotals(orgId),
                ReportsRepo.lowStockArticles(orgId, 20),
                ReportsRepo.expiringSoon(orgId, 30, 20),
                ReportsRepo.expiredArticles(orgId, 20),
                ReportsRepo.movementsSummary(orgId, filters, DEF),
                ReportsRepo.recentMovements(orgId, filters, DEF, 10),
            ]);
            setTotals(t);
            setLowStock(l);
            setExpiring(e);
            setExpired(ex);
            setSummary(s);
            setRecent(r);
        } finally {
            setLoading(false);
        }
    }, [orgId, filters]);

    useEffect(() => {
        load();
    }, [load]);

    return {
        totals,
        lowStock,
        expiring,
        expired,
        summary,
        recent,
        loading,
        filters,
        setFilters,
        refresh: load,
    };
}