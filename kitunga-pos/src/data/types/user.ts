// src/data/types/user.ts
export type UserRole =
    | 'admin'
    | 'gestionnaire_stock'
    | 'vendeur'
    | 'caissier';

export type UserRow = {
    id: number;
    organization_id: number | null;
    name: string;
    email: string;
    phone: string | null;
    avatar: string | null;
    is_active: number; // 0 | 1
    last_login_at: string | null;
    two_factor_enabled: number;
    roles: string | null;      // JSON array string
    permissions: string | null; // JSON array string
    created_at: string;
    updated_at: string;
};

export type UserStats = {
    total_sales: number;
    total_sales_amount: number;
    stock_movements: number;
};

export type UserFilters = {
    search?: string;
    role?: string;
    active?: '' | '1' | '0';
};

export const ROLE_LABELS: Record<string, string> = {
    admin: 'Administrateur',
    gestionnaire_stock: 'Gestionnaire stock',
    vendeur: 'Vendeur',
    caissier: 'Caissier',
};

export const AVAILABLE_ROLES: { name: string; label: string }[] = [
    { name: 'admin', label: 'Administrateur' },
    { name: 'gestionnaire_stock', label: 'Gestionnaire stock' },
    { name: 'vendeur', label: 'Vendeur' },
    { name: 'caissier', label: 'Caissier' },
];

/** Parse le JSON de rôles avec fallback. */
export function parseRoles(raw: string | null | undefined): string[] {
    if (!raw) return [];
    try {
        const v = JSON.parse(raw);
        return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
    } catch {
        return [];
    }
}

/** Parse les permissions JSON. */
export function parsePermissions(raw: string | null | undefined): string[] {
    if (!raw) return [];
    try {
        const v = JSON.parse(raw);
        return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
    } catch {
        return [];
    }
}

/** Retourne un user enrichi avec ses rôles parsés. */
export type UserWithRoles = UserRow & {
    role_names: string[];
};

export function toUserWithRoles(u: UserRow): UserWithRoles {
    return { ...u, role_names: parseRoles(u.roles) };
}