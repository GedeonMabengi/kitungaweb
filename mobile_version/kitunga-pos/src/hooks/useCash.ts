// src/hooks/useCash.ts
import { useCallback, useEffect, useState } from 'react';
import { CashRepo } from '../data/repositories/cash.repo';
import type {
    CashFilters,
    CashInput,
    CashMovement,
    CashOutput,
    CashRegisterRow,
} from '../data/types/cash';
import { useOrganizationStore } from '../store/organization.store';

// -------------------------------------------------------------
// Hook 1 : Dashboard (caisse ouverte + mouvements)
// -------------------------------------------------------------
export type CashDashboardData = {
    openRegister: CashRegisterRow | null;
    lastClosed: CashRegisterRow | null;
    movements: CashMovement[];
};

const EMPTY_DASHBOARD: CashDashboardData = {
    openRegister: null,
    lastClosed: null,
    movements: [],
};

export function useCashDashboard() {
    const orgId = useOrganizationStore((s) => s.organization?.id ?? null);
    const [data, setData] = useState<CashDashboardData>(EMPTY_DASHBOARD);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(
        async (mode: 'initial' | 'refresh' = 'initial') => {
            try {
                if (mode === 'refresh') setRefreshing(true);
                else setLoading(true);
                setError(null);

                const [openRegister, lastClosed] = await Promise.all([
                    CashRepo.findOpen(orgId),
                    CashRepo.findLastClosed(orgId),
                ]);

                const movements = openRegister
                    ? await CashRepo.movements(openRegister.id, 10)
                    : [];

                setData({ openRegister, lastClosed, movements });
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

// -------------------------------------------------------------
// Hook 2 : Liste des caisses (historique)
// -------------------------------------------------------------
export function useCashList(initialFilters: CashFilters = {}) {
    const orgId = useOrganizationStore((s) => s.organization?.id ?? null);
    const [filters, setFilters] = useState<CashFilters>(initialFilters);
    const [data, setData] = useState<CashRegisterRow[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(
        async (mode: 'initial' | 'refresh' = 'initial') => {
            try {
                if (mode === 'refresh') setRefreshing(true);
                else setLoading(true);

                const res = await CashRepo.list(orgId, filters);
                setData(res.data);
                setTotal(res.total);
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
        total,
        loading,
        refreshing,
        filters,
        setFilters,
        refresh,
    };
}

// -------------------------------------------------------------
// Hook 3 : Détail d’une caisse
// -------------------------------------------------------------
export type CashDetailData = {
    register: CashRegisterRow | null;
    inputs: CashInput[];
    outputs: CashOutput[];
};

export function useCashDetail(registerId: number) {
    const [data, setData] = useState<CashDetailData>({
        register: null,
        inputs: [],
        outputs: [],
    });
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const res = await CashRepo.findWithMovements(registerId);
            setData(res);
        } finally {
            setLoading(false);
        }
    }, [registerId]);

    useEffect(() => {
        load();
    }, [load]);

    return { ...data, loading, refresh: load };
}