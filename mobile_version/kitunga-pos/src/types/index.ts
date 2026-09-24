// src/types/index.ts

export type * from './auth';
export type * from './navigation';
export type * from './ui';

import type { Auth } from './auth';

/**
 * Équivalent RN de l'ancien SharedData d'Inertia.
 * En web, Laravel injecte ces données à chaque requête.
 * En RN offline, elles viennent de Zustand + AsyncStorage.
 */
export type SharedData = {
    name: string;
    auth: Auth | null;      // null car pas d'auth au démarrage
    sidebarOpen: boolean;   // gardé pour compat, mais non utilisé en RN
    [key: string]: unknown;
};