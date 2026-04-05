import { usePage } from '@inertiajs/react';

type AuthRole = {
    name: string;
};

type AuthUser = {
    roles?: AuthRole[];
    permissions?: string[];
} | null;

export function useAuthorization() {
    const { auth } = usePage().props as {
        auth?: { user?: AuthUser };
    };

    const user = auth?.user ?? null;
    const roles = user?.roles?.map((role) => role.name) ?? [];
    const permissions = user?.permissions ?? [];
    const isAdmin = roles.includes('admin');

    const hasRole = (role: string): boolean => roles.includes(role);

    const hasPermission = (permission: string | string[]): boolean => {
        if (isAdmin) {
            return true;
        }

        if (Array.isArray(permission)) {
            return permission.some((item) => permissions.includes(item));
        }

        return permissions.includes(permission);
    };

    return {
        roles,
        permissions,
        isAdmin,
        hasRole,
        hasPermission,
    };
}
