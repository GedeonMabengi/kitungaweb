<?php

use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

return new class extends Migration
{
    public function up(): void
    {
        if (! app()->bound('cache')) {
            return;
        }

        $seller = Role::query()->where('name', 'vendeur')->where('guard_name', 'web')->first();

        if (! $seller) {
            return;
        }

        $permissions = Permission::query()
            ->whereIn('name', ['cash.open', 'cash.close'])
            ->where('guard_name', 'web')
            ->get();

        if ($permissions->isNotEmpty()) {
            $seller->givePermissionTo($permissions);
        }
    }

    public function down(): void
    {
        $seller = Role::query()->where('name', 'vendeur')->where('guard_name', 'web')->first();

        if (! $seller) {
            return;
        }

        $permissions = Permission::query()
            ->whereIn('name', ['cash.open', 'cash.close'])
            ->where('guard_name', 'web')
            ->get();

        if ($permissions->isNotEmpty()) {
            $seller->revokePermissionTo($permissions);
        }
    }
};
