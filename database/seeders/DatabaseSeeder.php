<?php
// database/seeders/DatabaseSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolesAndPermissionsSeeder::class,
            UserSeeder::class,
            CategorySeeder::class,
            ArticleSeeder::class,
            StockMovementSeeder::class,
            CashRegisterSeeder::class,
            CashInputSeeder::class,
            CashOutputSeeder::class,
            SaleSeeder::class,
        ]);
    }
}