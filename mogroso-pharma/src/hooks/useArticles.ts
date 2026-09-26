// src/hooks/useArticles.ts
import { useCallback, useEffect, useState } from 'react';
import { ArticlesRepo } from '../data/repositories/articles.repo';
import type {
    ArticleFilters,
    ArticleRow,
} from '../data/types/article';

export function useArticles(initialFilters: ArticleFilters = {}) {
    const [filters, setFilters] = useState<ArticleFilters>(initialFilters);
    const [data, setData] = useState<ArticleRow[]>([]);
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

                const res = await ArticlesRepo.list(filters);
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