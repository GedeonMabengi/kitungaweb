<?php
// database/seeders/StockMovementSeeder.php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Database\Seeder;

class StockMovementSeeder extends Seeder
{
    public function run(): void
    {
        $stockManager = User::query()->where('email', 'stock@kitunga.com')->firstOrFail();

        $articles = [
            'EAU-50CL-001' => Article::query()->where('sku', 'EAU-50CL-001')->firstOrFail(),
            'JUS-ORA-001' => Article::query()->where('sku', 'JUS-ORA-001')->firstOrFail(),
            'RIZ-25KG-001' => Article::query()->where('sku', 'RIZ-25KG-001')->firstOrFail(),
            'HUI-5L-001' => Article::query()->where('sku', 'HUI-5L-001')->firstOrFail(),
            'SUC-1KG-001' => Article::query()->where('sku', 'SUC-1KG-001')->firstOrFail(),
        ];

        $movements = [
            [
                'article_id' => $articles['EAU-50CL-001']->id,
                'user_id' => $stockManager->id,
                'movement_type' => 'IN',
                'quantity' => 20,
                'quantity_type' => 'PACK',
                'stock_before' => 30,
                'stock_after' => 50,
                'reason' => 'Reapprovisionnement hebdomadaire',
                'reference' => 'BON-SEED-001',
                'notes' => 'Livraison fournisseur Eau Vive',
            ],
            [
                'article_id' => $articles['JUS-ORA-001']->id,
                'user_id' => $stockManager->id,
                'movement_type' => 'IN',
                'quantity' => 15,
                'quantity_type' => 'PACK',
                'stock_before' => 15,
                'stock_after' => 30,
                'reason' => 'Commande mensuelle',
                'reference' => 'BON-SEED-002',
                'notes' => null,
            ],
            [
                'article_id' => $articles['RIZ-25KG-001']->id,
                'user_id' => $stockManager->id,
                'movement_type' => 'OUT',
                'quantity' => 5,
                'quantity_type' => 'UNIT',
                'stock_before' => 105,
                'stock_after' => 100,
                'reason' => 'Produits endommages',
                'reference' => 'INV-SEED-001',
                'notes' => 'Sacs dechires lors du transport',
            ],
            [
                'article_id' => $articles['HUI-5L-001']->id,
                'user_id' => $stockManager->id,
                'movement_type' => 'ADJUSTMENT',
                'quantity' => 60,
                'quantity_type' => 'UNIT',
                'stock_before' => 58,
                'stock_after' => 60,
                'reason' => 'Inventaire physique',
                'reference' => 'INV-SEED-002',
                'notes' => "Ecart corrige lors de l'inventaire",
            ],
            [
                'article_id' => $articles['SUC-1KG-001']->id,
                'user_id' => $stockManager->id,
                'movement_type' => 'IN',
                'quantity' => 50,
                'quantity_type' => 'PACK',
                'stock_before' => 30,
                'stock_after' => 80,
                'reason' => 'Stock initial complementaire',
                'reference' => 'BON-SEED-003',
                'notes' => 'Promotion de rentree',
            ],
        ];

        foreach ($movements as $movement) {
            StockMovement::query()->firstOrCreate(
                [
                    'article_id' => $movement['article_id'],
                    'reference' => $movement['reference'],
                ],
                $movement,
            );
        }
    }
}
