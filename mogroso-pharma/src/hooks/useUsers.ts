// src/hooks/useUsers.ts
import { useCallback, useEffect, useState } from 'react';
import { UsersRepo } from '../data/repositories/users.repo';
import type {
    UserFilters,
    UserStats,
    UserWithRoles,
} from '../data/types/user';
import { useOrganizationStore } from '../store/organization.store';

// -------------------------------------------------------------
// Liste
// -------------------------------------------------------------
export function useUsers(initialFilters: UserFilters = {}) {
    const orgId = useOrganizationStore((s) => s.organization?.id ?? null);
    const [filters, setFilters] = useState<UserFilters>(initialFilters);
    const [data, setData] = useState<UserWithRoles[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(
        async (mode: 'initial' | 'refresh' = 'initial') => {
            try {
                if (mode === 'refresh') setRefreshing(true);
                else setLoading(true);
                const rows = await UsersRepo.list(orgId, filters);
                setData(rows);
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [orgId, filters],
    );

    useEffect(() => {
        load('initial');
    }, [load]);

    const refresh = useCallback(() => load('refresh'), [load]);

    return {
        data,
        loading,
        refreshing,
        filters,
        setFilters,
        refresh,
    };
}

// -------------------------------------------------------------
// Détail + stats
// -------------------------------------------------------------
export function useUserDetail(userId: number) {
    const [user, setUser] = useState<UserWithRoles | null>(null);
    const [stats, setStats] = useState<UserStats>({
        total_sales: 0,
        total_sales_amount: 0,
        stock_movements: 0,
    });
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const [u, s] = await Promise.all([
                UsersRepo.find(userId),
                UsersRepo.stats(userId),
            ]);
            setUser(u);
            setStats(s);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        load();
    }, [load]);

    return { user, stats, loading, refresh: load };
}