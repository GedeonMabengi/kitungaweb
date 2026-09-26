// src/types/navigation.ts
import type { LucideIcon } from 'lucide-react-native';

export type BreadcrumbItem = {
    title: string;
    href: string;
};

export type NavItem = {
    title: string;
    /** Nom de l'écran React Navigation (ex: 'Dashboard', 'Articles.List') */
    route: string;
    /** Paramètres optionnels à passer à l'écran */
    params?: Record<string, unknown>;
    icon?: LucideIcon | null;
    isActive?: boolean;
};