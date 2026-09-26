// src/hooks/useStockMovements.ts
import { useCallback, useEffect, useState } from 'react';
import { StockMovementsRepo } from '../data/repositories/stockMovements.repo';
import type {
    StockMovementFilters,
    StockMovementRow,
} from '../data/types/stock';

export function useStockMovements(initial: StockMovementFilters = {}) {
    const [filters, setFilters] = useState<StockMovementFilters>(initial);
    const [data, setData] = useState<StockMovementRow[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(
        async (mode: 'initial' | 'refresh' = 'initial') => {
            try {
                if (mode === 'refresh') setRefreshing(true);
                else setLoading(true);
                setError(null);

                const res = await StockMovementsRepo.list(filters);
                setData(res.data);
                setTotal(res.total);
            } catch (e) {
                setError(e instanceof Error ? e.message : String(e));
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [filters],
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
        error,
        filters,
        setFilters,
        refresh,
    };
}