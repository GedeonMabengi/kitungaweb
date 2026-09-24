// src/hooks/useSales.ts
import { useCallback, useEffect, useState } from 'react';
import { SalesRepo } from '../data/repositories/sales.repo';
import type {
    SaleFilters,
    SaleItemRow,
    SaleRow,
} from '../data/types/sale';
import { useOrganizationStore } from '../store/organization.store';

// -------------------------------------------------------------
// Liste
// -------------------------------------------------------------
export function useSales(initialFilters: SaleFilters = {}) {
    const orgId = useOrganizationStore((s) => s.organization?.id ?? null);
    const [filters, setFilters] = useState<SaleFilters>(initialFilters);
    const [data, setData] = useState<SaleRow[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(
        async (mode: 'initial' | 'refresh' = 'initial') => {
            try {
                if (mode === 'refresh') setRefreshing(true);
                else setLoading(true);
                const res = await SalesRepo.list(orgId, filters);
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
// Détail
// -------------------------------------------------------------
export function useSaleDetail(saleId: number) {
    const [sale, setSale] = useState<SaleRow | null>(null);
    const [items, setItems] = useState<SaleItemRow[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const res = await SalesRepo.find(saleId);
            setSale(res.sale);
            setItems(res.items);
        } finally {
            setLoading(false);
        }
    }, [saleId]);

    useEffect(() => {
        load();
    }, [load]);

    return { sale, items, loading, refresh: load };
}