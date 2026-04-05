<?php
// database/seeders/CashOutputSeeder.php

namespace Database\Seeders;

use App\Models\CashOutput;
use App\Models\CashRegister;
use App\Models\User;
use Illuminate\Database\Seeder;

class CashOutputSeeder extends Seeder
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

        $outputs = [
            [
                'cash_register_id' => $openRegister->id,
                'user_id' => $cashier->id,
                'amount' => 5000,
                'reason' => 'Achat fournitures bureau',
                'beneficiary' => 'Fournisseur X',
                'reference' => 'FAC-SEED-001',
                'notes' => 'Stylo, papier, enveloppes',
            ],
            [
                'cash_register_id' => $openRegister->id,
                'user_id' => $cashier->id,
                'amount' => 10000,
                'reason' => 'Remboursement client',
                'beneficiary' => 'Client insatisfait',
                'reference' => 'AV-SEED-001',
                'notes' => 'Produit defectueux',
            ],
            [
                'cash_register_id' => $openRegister->id,
                'user_id' => $cashier->id,
                'amount' => 15000,
                'reason' => 'Depot banque',
                'beneficiary' => 'Banque Centrale',
                'reference' => 'BANK-SEED-001',
                'notes' => 'Excedent de caisse',
            ],
            [
                'cash_register_id' => $closedRegister->id,
                'user_id' => $cashier->id,
                'amount' => 8000,
                'reason' => 'Carburant livraison',
                'beneficiary' => 'Chauffeur',
                'reference' => 'NOTE-SEED-001',
                'notes' => null,
            ],
            [
                'cash_register_id' => $closedRegister->id,
                'user_id' => $cashier->id,
                'amount' => 12000,
                'reason' => 'Reparation equipement',
                'beneficiary' => 'Technicien',
                'reference' => 'FAC-SEED-002',
                'notes' => 'Reparation imprimante ticket',
            ],
        ];

        foreach ($outputs as $output) {
            CashOutput::query()->firstOrCreate(
                ['reference' => $output['reference']],
                $output,
            );
        }
    }
}
