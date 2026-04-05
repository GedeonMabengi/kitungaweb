<?php
// database/seeders/CashInputSeeder.php

namespace Database\Seeders;

use App\Models\CashInput;
use App\Models\CashRegister;
use App\Models\User;
use Illuminate\Database\Seeder;

class CashInputSeeder extends Seeder
{
    public function run(): void
    {
        $cashier = User::query()->where('email', 'caisse@kitunga.com')->firstOrFail();
        $openRegister = CashRegister::query()
            ->whereDate('date', now()->toDateString())
            ->where('status', 'OPEN')
            ->firstOrFail();
        $closedRegister = CashRegister::query()
            ->whereDate('date', now()->subDay()->toDateString())
            ->where('status', 'CLOSED')
            ->firstOrFail();

        $inputs = [
            [
                'cash_register_id' => $openRegister->id,
                'sale_id' => null,
                'user_id' => $cashier->id,
                'amount' => 100000,
                'source' => 'DEPOSIT',
                'reference' => 'DEP-SEED-001',
                'notes' => 'Apport de fonds complementaires',
            ],
            [
                'cash_register_id' => $openRegister->id,
                'sale_id' => null,
                'user_id' => $cashier->id,
                'amount' => 25000,
                'source' => 'OTHER',
                'reference' => 'AUT-SEED-001',
                'notes' => 'Regularisation de debut de journee',
            ],
            [
                'cash_register_id' => $closedRegister->id,
                'sale_id' => null,
                'user_id' => $cashier->id,
                'amount' => 35000,
                'source' => 'OTHER',
                'reference' => 'AUT-SEED-002',
                'notes' => 'Encaissement divers de cloture',
            ],
        ];

        foreach ($inputs as $input) {
            CashInput::query()->firstOrCreate(
                ['reference' => $input['reference']],
                $input,
            );
        }
    }
}
