// src/hooks/useCategories.ts
import { useCallback, useEffect, useState } from 'react';
import {
    CategoriesRepo,
    type CategoryFilters,
    type CategoryWithCount,
} from '../data/repositories/categories.repo';
import type { Category } from '../data/types/category';

/**
 * Hook liste simple — utilisé par les Select (ex: ArticleForm).
 */
export function useCategories() {
    const [data, setData] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const rows = await CategoriesRepo.list();
            setData(rows);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const refresh = useCallback(() => load(), [load]);

    return { data, loading, refresh };
}

/**
 * Hook liste filtrée avec compteur d’articles — utilisé par CategoriesListScreen.
 */
export function useCategoriesList(initialFilters: CategoryFilters = {}) {
    const [filters, setFilters] = useState<CategoryFilters>(initialFilters);
    const [data, setData] = useState<CategoryWithCount[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(
        async (mode: 'initial' | 'refresh' = 'initial') => {
            try {
                if (mode === 'refresh') setRefreshing(true);
                else setLoading(true);
                const rows = await CategoriesRepo.listWithCount(filters);
                setData(rows);
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
        loading,
        refreshing,
        filters,
        setFilters,
        refresh,
    };
}