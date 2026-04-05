<?php
// database/seeders/RolesAndPermissionsSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permissions = [
            'users.view',
            'users.create',
            'users.edit',
            'users.delete',
            'categories.view',
            'categories.create',
            'categories.edit',
            'categories.delete',
            'articles.view',
            'articles.create',
            'articles.edit',
            'articles.delete',
            'stock.view',
            'stock.create',
            'stock.edit',
            'stock.adjust',
            'stock.movements.view',
            'stock.movements.create',
            'sales.view',
            'sales.create',
            'sales.edit',
            'sales.delete',
            'sales.view_all',
            'sales.reports',
            'cash.view',
            'cash.open',
            'cash.close',
            'cash.input',
            'cash.output',
            'cash.view_all',
            'cash.reports',
            'reports.export',
            'stock.reports',
            'settings.view',
            'settings.edit',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $admin = Role::findOrCreate('admin', 'web');
        $admin->syncPermissions(Permission::all());

        $stockManager = Role::findOrCreate('gestionnaire_stock', 'web');
        $stockManager->syncPermissions([
            'categories.view',
            'categories.create',
            'categories.edit',
            'articles.view',
            'articles.create',
            'articles.edit',
            'articles.delete',
            'stock.view',
            'stock.create',
            'stock.edit',
            'stock.adjust',
            'stock.movements.view',
            'stock.movements.create',
            'stock.reports',
        ]);

        $seller = Role::findOrCreate('vendeur', 'web');
        $seller->syncPermissions([
            'articles.view',
            'stock.view',
            'sales.view',
            'sales.create',
            'sales.reports',
            'cash.view',
            'cash.open',
            'cash.close',
            'cash.input',
        ]);

        $cashier = Role::findOrCreate('caissier', 'web');
        $cashier->syncPermissions([
            'articles.view',
            'sales.view',
            'cash.view',
            'cash.open',
            'cash.close',
            'cash.input',
            'cash.output',
            'cash.reports',
        ]);

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
