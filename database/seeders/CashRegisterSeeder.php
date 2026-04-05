<?php
// database/seeders/CashRegisterSeeder.php

namespace Database\Seeders;

use App\Models\CashRegister;
use App\Models\User;
use Illuminate\Database\Seeder;

class CashRegisterSeeder extends Seeder
{
    public function run(): void
    {
        $cashier = User::query()->where('email', 'caisse@kitunga.com')->firstOrFail();

        $registers = [
            [
                'user_id' => $cashier->id,
                'date' => now()->toDateString(),
                'opening_balance' => 50000,
                'total_input' => 0,
                'total_output' => 0,
                'expected_balance' => 50000,
                'actual_balance' => null,
                'difference' => null,
                'status' => 'OPEN',
                'opened_at' => now()->setTime(8, 0),
                'closed_at' => null,
                'opening_notes' => 'Fond de caisse standard',
                'closing_notes' => null,
            ],
            [
                'user_id' => $cashier->id,
                'date' => now()->subDay()->toDateString(),
                'opening_balance' => 50000,
                'total_input' => 0,
                'total_output' => 0,
                'expected_balance' => 50000,
                'actual_balance' => 65000,
                'difference' => 0,
                'status' => 'CLOSED',
                'opened_at' => now()->subDay()->setTime(8, 0),
                'closed_at' => now()->subDay()->setTime(18, 30),
                'opening_notes' => null,
                'closing_notes' => 'Caisse equilibree',
            ],
            [
                'user_id' => $cashier->id,
                'date' => now()->subDays(2)->toDateString(),
                'opening_balance' => 50000,
                'total_input' => 0,
                'total_output' => 0,
                'expected_balance' => 50000,
                'actual_balance' => 47000,
                'difference' => -3000,
                'status' => 'CLOSED',
                'opened_at' => now()->subDays(2)->setTime(8, 0),
                'closed_at' => now()->subDays(2)->setTime(18, 0),
                'opening_notes' => null,
                'closing_notes' => 'Manque constate lors de la cloture',
            ],
            [
                'user_id' => $cashier->id,
                'date' => now()->subDays(3)->toDateString(),
                'opening_balance' => 30000,
                'total_input' => 0,
                'total_output' => 0,
                'expected_balance' => 30000,
                'actual_balance' => 31000,
                'difference' => 1000,
                'status' => 'CLOSED',
                'opened_at' => now()->subDays(3)->setTime(9, 0),
                'closed_at' => now()->subDays(3)->setTime(17, 0),
                'opening_notes' => 'Remplacement ponctuel',
                'closing_notes' => 'Excedent non explique',
            ],
            [
                'user_id' => $cashier->id,
                'date' => now()->subDays(5)->toDateString(),
                'opening_balance' => 50000,
                'total_input' => 0,
                'total_output' => 0,
                'expected_balance' => 50000,
                'actual_balance' => 50000,
                'difference' => 0,
                'status' => 'CLOSED',
                'opened_at' => now()->subDays(5)->setTime(8, 0),
                'closed_at' => now()->subDays(5)->setTime(19, 0),
                'opening_notes' => null,
                'closing_notes' => 'Journee reguliere',
            ],
        ];

        foreach ($registers as $register) {
            $existingRegister = CashRegister::query()
                ->where('user_id', $register['user_id'])
                ->whereDate('date', $register['date'])
                ->first();

            if ($existingRegister) {
                continue;
            }

            CashRegister::query()->create($register);
        }
    }
}
