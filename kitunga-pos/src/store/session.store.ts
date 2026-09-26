// src/store/session.store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AuthRole = {
    name: string;
};

export type AuthUser = {
    id: number | null;
    name: string | null;
    email: string | null;
    roles?: AuthRole[];
    permissions?: string[];
};

type SessionState = {
    user: AuthUser | null;
    setUser: (user: AuthUser | null) => void;
    patchUser: (patch: Partial<AuthUser>) => void;
    clear: () => void;
};

export const useSessionStore = create<SessionState>()(
    persist(
        (set, get) => ({
            user: null,
            setUser: (user) => set({ user }),
            patchUser: (patch) =>
                set({
                    user: get().user ? { ...get().user, ...patch } : null,
                }),
            clear: () => set({ user: null }),
        }),
        {
            name: 'session-storage',
            storage: createJSONStorage(() => AsyncStorage),
        },
    ),
);