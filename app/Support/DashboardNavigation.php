<?php

namespace App\Support;

use App\Models\User;

class DashboardNavigation
{
    /**
     * @return array<int, array{name: string, href: string, icon: string, permission: string|array<int, string>|null, hidden_for_roles: array<int, string>}>
     */
    protected function items(): array
    {
        return [
            [
                'name' => 'Tableau de bord',
                'href' => route('dashboard'),
                'icon' => 'home',
                'permission' => null,
                'hidden_for_roles' => [],
            ],
            [
                'name' => 'Categories',
                'href' => route('categories.index'),
                'icon' => 'box',
                'permission' => 'categories.view',
                'hidden_for_roles' => [],
            ],
            [
                'name' => 'Articles',
                'href' => route('articles.index'),
                'icon' => 'box',
                'permission' => 'articles.view',
                'hidden_for_roles' => [],
            ],
            [
                'name' => 'Mouvements Stock',
                'href' => route('stock.movements.index'),
                'icon' => 'box',
                'permission' => 'stock.movements.view',
                'hidden_for_roles' => [],
            ],
            [
                'name' => 'Point de Vente',
                'href' => route('sales.pos'),
                'icon' => 'shopping-cart',
                'permission' => 'sales.create',
                'hidden_for_roles' => [],
            ],
            [
                'name' => 'Ventes',
                'href' => route('sales.index'),
                'icon' => 'shopping-cart',
                'permission' => 'sales.view',
                'hidden_for_roles' => [],
            ],
            [
                'name' => 'Caisse',
                'href' => route('cash.dashboard'),
                'icon' => 'banknote',
                'permission' => 'cash.view',
                'hidden_for_roles' => ['vendeur'],
            ],
            [
                'name' => 'Rapports',
                'href' => route('reports.index'),
                'icon' => 'chart-bar',
                'permission' => ['sales.reports', 'stock.reports', 'cash.reports'],
                'hidden_for_roles' => [],
            ],
            [
                'name' => 'Utilisateurs',
                'href' => route('admin.users.index'),
                'icon' => 'users',
                'permission' => 'users.view',
                'hidden_for_roles' => [],
            ],
            [
                'name' => 'Organisation',
                'href' => route('organization.show'),
                'icon' => 'users',
                'permission' => 'users.view',
                'hidden_for_roles' => [],
            ],
        ];
    }

    /**
     * @return array<int, array{name: string, href: string, icon: string}>
     */
    public function forUser(?User $user): array
    {
        if (! $user) {
            return [];
        }

        $roleNames = $user->getRoleNames()->values()->all();
        $permissions = $user->getAllPermissions()->pluck('name')->values()->all();
        $isAdmin = in_array('admin', $roleNames, true);

        return array_values(array_map(
            fn (array $item): array => [
                'name' => $item['name'],
                'href' => $item['href'],
                'icon' => $item['icon'],
            ],
            array_filter($this->items(), function (array $item) use ($isAdmin, $permissions, $roleNames): bool {
                $requiredPermissions = $item['permission'];

                $hasPermission = $requiredPermissions === null || $isAdmin;

                if (! $hasPermission && is_array($requiredPermissions)) {
                    $hasPermission = count(array_intersect($requiredPermissions, $permissions)) > 0;
                }

                if (! $hasPermission && is_string($requiredPermissions)) {
                    $hasPermission = in_array($requiredPermissions, $permissions, true);
                }

                $isHiddenForRole = count(array_intersect($item['hidden_for_roles'], $roleNames)) > 0;

                return $hasPermission && ! $isHiddenForRole;
            }),
        ));
    }
}

