// src/hooks/useDashboard.ts
import { useCallback, useEffect, useState } from 'react';
import {
    DashboardRepo,
    type DashboardStats,
    type ExpiringArticle,
    type OpenRegister,
    type RecentMovement,
    type RecentSale,
} from '../data/repositories/dashboard.repo';
import { useOrganizationStore } from '../store/organization.store';

export type DashboardData = {
    stats: DashboardStats;
    recentSales: RecentSale[];
    recentMovements: RecentMovement[];
    expiringArticles: ExpiringArticle[];
    openRegister: OpenRegister;
};

const EMPTY: DashboardData = {
    stats: {
        totalArticles: 0,
        lowStockCount: 0,
        todaySales: 0,
        todaySalesCount: 0,
        monthSales: 0,
    },
    recentSales: [],
    recentMovements: [],
    expiringArticles: [],
    openRegister: null,
};

export function useDashboard() {
    const orgId = useOrganizationStore((s) => s.organization?.id ?? null);
    const [data, setData] = useState<DashboardData>(EMPTY);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(
        async (mode: 'initial' | 'refresh' = 'initial') => {
            try {
                if (mode === 'refresh') setRefreshing(true);
                else setLoading(true);
                setError(null);

                const [
                    stats,
                    recentSales,
                    recentMovements,
                    expiringArticles,
                    openRegister,
                ] = await Promise.all([
                    DashboardRepo.stats(orgId),
                    DashboardRepo.recentSales(orgId, 5),
                    DashboardRepo.recentMovements(orgId, 5),
                    DashboardRepo.expiringArticles(orgId, 30, 5),
                    DashboardRepo.openRegister(orgId),
                ]);

                setData({
                    stats,
                    recentSales,
                    recentMovements,
                    expiringArticles,
                    openRegister,
                });
            } catch (e) {
                setError(e instanceof Error ? e.message : String(e));
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [orgId],
    );

    useEffect(() => {
        load('initial');
    }, [load]);

    const refresh = useCallback(() => load('refresh'), [load]);

    return {
        ...data,
        loading,
        refreshing,
        error,
        refresh,
    };
}