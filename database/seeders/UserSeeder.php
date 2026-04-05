<?php
// database/seeders/UserSeeder.php

namespace Database\Seeders;

use App\Models\Organization;
use App\Models\OrganizationSubscription;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $organization = Organization::query()->firstOrCreate(
            ['slug' => 'kitunga-demo'],
            [
                'name' => 'Kitunga Demo',
                'billing_email' => 'admin@kitunga.com',
                'country_code' => 'CD',
                'currency' => 'CDF',
                'base_currency' => 'CDF',
                'status' => 'active',
                'trial_ends_at' => now()->addDays(14),
            ],
        );

        $sandboxOrganization = Organization::query()->firstOrCreate(
            ['slug' => 'kitunga-sandbox'],
            [
                'name' => 'Kitunga Sandbox',
                'billing_email' => 'sandbox.admin@kitunga.com',
                'country_code' => 'CD',
                'currency' => 'USD',
                'base_currency' => 'USD',
                'status' => 'active',
                'trial_ends_at' => now()->addDays(14),
            ],
        );

        $users = [
            [
                'name' => 'Administrateur Systeme',
                'email' => 'admin@kitunga.com',
                'phone' => '+243 999 999 999',
                'role' => 'admin',
                'last_login_at' => now(),
            ],
            [
                'name' => 'Jean Stock',
                'email' => 'stock@kitunga.com',
                'phone' => '+243 888 888 888',
                'role' => 'gestionnaire_stock',
                'last_login_at' => now()->subDays(2),
            ],
            [
                'name' => 'Marie Vente',
                'email' => 'vente1@kitunga.com',
                'phone' => '+243 777 777 777',
                'role' => 'vendeur',
                'last_login_at' => now()->subHours(5),
            ],
            [
                'name' => 'Pierre Vente',
                'email' => 'vente2@kitunga.com',
                'phone' => '+243 777 777 778',
                'role' => 'vendeur',
                'last_login_at' => now()->subDay(),
            ],
            [
                'name' => 'Sophie Caisse',
                'email' => 'caisse@kitunga.com',
                'phone' => '+243 666 666 666',
                'role' => 'caissier',
                'last_login_at' => now()->subHours(2),
            ],
        ];

        foreach ($users as $userData) {
            $role = $userData['role'];
            unset($userData['role']);

            $user = User::query()->updateOrCreate(
                ['email' => $userData['email']],
                array_merge($userData, [
                    'organization_id' => $organization->id,
                    'password' => Hash::make('password'),
                    'is_active' => true,
                ]),
            );

            $user->syncRoles([$role]);

            if ($role === 'admin' && ! $organization->owner_user_id) {
                $organization->update(['owner_user_id' => $user->id]);
            }
        }

        $sandboxAdmin = User::query()->updateOrCreate(
            ['email' => 'sandbox.admin@kitunga.com'],
            [
                'organization_id' => $sandboxOrganization->id,
                'name' => 'Administrateur Sandbox',
                'phone' => '+243 555 555 555',
                'password' => Hash::make('password'),
                'is_active' => true,
                'last_login_at' => now()->subDay(),
            ],
        );
        $sandboxAdmin->syncRoles(['admin']);

        if (! $sandboxOrganization->owner_user_id) {
            $sandboxOrganization->update(['owner_user_id' => $sandboxAdmin->id]);
        }

        OrganizationSubscription::query()->firstOrCreate(
            [
                'organization_id' => $organization->id,
                'plan_code' => 'trial',
            ],
            [
                'plan_name' => 'Essai',
                'billing_cycle' => 'monthly',
                'amount' => 0,
                'currency' => 'USD',
                'seats_limit' => 3,
                'features' => ['dashboard', 'stock', 'sales', 'cash', 'reports'],
                'provider' => 'cinetpay',
                'status' => 'trialing',
                'starts_at' => now(),
                'trial_ends_at' => now()->addDays(14),
                'ends_at' => now()->addDays(14),
            ],
        );

        OrganizationSubscription::query()->firstOrCreate(
            [
                'organization_id' => $sandboxOrganization->id,
                'plan_code' => 'trial',
            ],
            [
                'plan_name' => 'Essai',
                'billing_cycle' => 'monthly',
                'amount' => 0,
                'currency' => 'USD',
                'seats_limit' => 3,
                'features' => ['dashboard', 'stock', 'sales', 'cash', 'reports'],
                'provider' => 'cinetpay',
                'status' => 'trialing',
                'starts_at' => now(),
                'trial_ends_at' => now()->addDays(14),
                'ends_at' => now()->addDays(14),
            ],
        );
    }
}
