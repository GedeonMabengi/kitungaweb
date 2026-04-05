<?php

use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

return new class extends Migration
{
    public function up(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach (['sales.reports', 'cash.reports', 'stock.reports'] as $permissionName) {
            Permission::findOrCreate($permissionName, 'web');
        }

        Role::findOrCreate('admin', 'web')->givePermissionTo(['sales.reports', 'cash.reports', 'stock.reports']);
        Role::findOrCreate('gestionnaire_stock', 'web')->givePermissionTo(['stock.reports']);
        Role::findOrCreate('vendeur', 'web')->givePermissionTo(['sales.reports']);
        Role::findOrCreate('caissier', 'web')->givePermissionTo(['cash.reports']);

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function down(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach ([
            'admin' => ['sales.reports', 'cash.reports', 'stock.reports'],
            'gestionnaire_stock' => ['stock.reports'],
            'vendeur' => ['sales.reports'],
            'caissier' => ['cash.reports'],
        ] as $roleName => $permissionNames) {
            $role = Role::where('name', $roleName)->where('guard_name', 'web')->first();

            if (! $role) {
                continue;
            }

            foreach ($permissionNames as $permissionName) {
                $permission = Permission::where('name', $permissionName)->where('guard_name', 'web')->first();

                if ($permission) {
                    $role->revokePermissionTo($permission);
                }
            }
        }

        foreach (['sales.reports', 'cash.reports', 'stock.reports'] as $permissionName) {
            $permission = Permission::where('name', $permissionName)->where('guard_name', 'web')->first();

            if ($permission && ! in_array($permissionName, ['sales.reports', 'cash.reports'], true)) {
                $permission->delete();
            }
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
};
