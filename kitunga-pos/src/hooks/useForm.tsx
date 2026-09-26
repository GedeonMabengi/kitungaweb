// src/hooks/useForm.ts
import { useCallback, useRef, useState } from 'react';

export type FormErrors<T> = Partial<Record<keyof T, string>>;

export function useForm<T extends Record<string, any>>(initial: T) {
    const initialRef = useRef(initial);
    const [data, setDataState] = useState<T>(initial);
    const [errors, setErrors] = useState<FormErrors<T>>({});
    const [processing, setProcessing] = useState(false);

    const setData = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
        setDataState((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => {
            if (!prev[key]) return prev;
            const next = { ...prev };
            delete next[key];
            return next;
        });
    }, []);

    const reset = useCallback(() => {
        setDataState(initialRef.current);
        setErrors({});
    }, []);

    return {
        data,
        setData,
        setDataState,
        errors,
        setErrors,
        processing,
        setProcessing,
        reset,
    };
}