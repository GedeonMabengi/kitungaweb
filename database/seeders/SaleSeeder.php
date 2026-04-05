<?php
// database/seeders/SaleSeeder.php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\CashInput;
use App\Models\CashRegister;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SaleSeeder extends Seeder
{
    public function run(): void
    {
        $seller1 = User::query()->where('email', 'vente1@kitunga.com')->firstOrFail();
        $seller2 = User::query()->where('email', 'vente2@kitunga.com')->firstOrFail();
        $openRegister = CashRegister::query()
            ->whereDate('date', now()->toDateString())
            ->where('status', 'OPEN')
            ->firstOrFail();

        $eau = Article::query()->where('sku', 'EAU-50CL-001')->firstOrFail();
        $riz = Article::query()->where('sku', 'RIZ-25KG-001')->firstOrFail();
        $lait = Article::query()->where('sku', 'LAIT-1L-001')->firstOrFail();
        $savon = Article::query()->where('sku', 'SAV-200G-001')->firstOrFail();
        $sucre = Article::query()->where('sku', 'SUC-1KG-001')->firstOrFail();

        $sales = [
            [
                'reference' => 'VNT-SEED-001',
                'user_id' => $seller1->id,
                'cash_register_id' => $openRegister->id,
                'payment_method' => 'CASH',
                'payment_status' => 'PAID',
                'customer_name' => 'Client fidele',
                'customer_phone' => '+243 999 111 111',
                'notes' => null,
                'discount' => 0,
                'amount_paid' => 61000,
                'items' => [
                    ['article' => $eau, 'qty' => 2, 'type' => 'PACK', 'price' => 5000],
                    ['article' => $riz, 'qty' => 1, 'type' => 'UNIT', 'price' => 45000],
                    ['article' => $savon, 'qty' => 1, 'type' => 'PACK', 'price' => 6000],
                ],
            ],
            [
                'reference' => 'VNT-SEED-002',
                'user_id' => $seller1->id,
                'cash_register_id' => $openRegister->id,
                'payment_method' => 'MOBILE',
                'payment_status' => 'PAID',
                'customer_name' => 'Boutique ABC',
                'customer_phone' => '+243 999 222 222',
                'notes' => 'Client revendeur',
                'discount' => 5000,
                'amount_paid' => 90000,
                'items' => [
                    ['article' => $eau, 'qty' => 10, 'type' => 'PACK', 'price' => 4800],
                    ['article' => $lait, 'qty' => 5, 'type' => 'PACK', 'price' => 4200],
                    ['article' => $sucre, 'qty' => 8, 'type' => 'PACK', 'price' => 3200],
                ],
            ],
            [
                'reference' => 'VNT-SEED-003',
                'user_id' => $seller2->id,
                'cash_register_id' => $openRegister->id,
                'payment_method' => 'CASH',
                'payment_status' => 'PAID',
                'customer_name' => null,
                'customer_phone' => null,
                'notes' => 'Passant',
                'discount' => 0,
                'amount_paid' => 5000,
                'items' => [
                    ['article' => $eau, 'qty' => 1, 'type' => 'PACK', 'price' => 5000],
                ],
            ],
            [
                'reference' => 'VNT-SEED-004',
                'user_id' => $seller2->id,
                'cash_register_id' => $openRegister->id,
                'payment_method' => 'CARD',
                'payment_status' => 'PAID',
                'customer_name' => 'Societe XYZ',
                'customer_phone' => '+243 999 333 333',
                'notes' => 'Facture demandee',
                'discount' => 10000,
                'amount_paid' => 224000,
                'items' => [
                    ['article' => $riz, 'qty' => 5, 'type' => 'UNIT', 'price' => 45000],
                    ['article' => $lait, 'qty' => 2, 'type' => 'PACK', 'price' => 4500],
                ],
            ],
            [
                'reference' => 'VNT-SEED-005',
                'user_id' => $seller1->id,
                'cash_register_id' => $openRegister->id,
                'payment_method' => 'CREDIT',
                'payment_status' => 'PENDING',
                'customer_name' => 'Client regulier',
                'customer_phone' => '+243 999 444 444',
                'notes' => 'Paiement sous 7 jours',
                'discount' => 0,
                'amount_paid' => 0,
                'items' => [
                    ['article' => $savon, 'qty' => 10, 'type' => 'PACK', 'price' => 5500],
                    ['article' => $sucre, 'qty' => 3, 'type' => 'PACK', 'price' => 3300],
                ],
            ],
        ];

        foreach ($sales as $saleData) {
            if (Sale::query()->where('reference', $saleData['reference'])->exists()) {
                continue;
            }

            DB::transaction(function () use ($saleData): void {
                $items = $saleData['items'];
                unset($saleData['items']);

                $subtotal = 0;
                foreach ($items as $item) {
                    $subtotal += $item['qty'] * $item['price'];
                }

                $total = $subtotal - $saleData['discount'];
                $change = max(0, $saleData['amount_paid'] - $total);

                $sale = Sale::query()->create(array_merge($saleData, [
                    'subtotal' => $subtotal,
                    'total_amount' => $total,
                    'change_amount' => $change,
                ]));

                foreach ($items as $item) {
                    $article = $item['article'];
                    $itemSubtotal = $item['qty'] * $item['price'];

                    SaleItem::query()->create([
                        'sale_id' => $sale->id,
                        'article_id' => $article->id,
                        'quantity' => $item['qty'],
                        'quantity_type' => $item['type'],
                        'unit_price' => $item['price'],
                        'subtotal' => $itemSubtotal,
                    ]);

                    $stockBefore = $article->current_stock;
                    $stockDeduction = $item['qty'];

                    if ($article->unit_type === 'PACK' && $item['type'] === 'UNIT') {
                        $stockDeduction = $item['qty'] / $article->units_per_pack;
                    }

                    $article->decrement('current_stock', $stockDeduction);

                    StockMovement::query()->create([
                        'article_id' => $article->id,
                        'user_id' => $saleData['user_id'],
                        'movement_type' => StockMovement::TYPE_SALE,
                        'quantity' => $item['qty'],
                        'quantity_type' => $item['type'],
                        'stock_before' => $stockBefore,
                        'stock_after' => $article->fresh()->current_stock,
                        'reason' => 'Vente',
                        'reference' => $sale->reference,
                    ]);
                }

                if ($saleData['payment_status'] === Sale::STATUS_PAID && $saleData['cash_register_id']) {
                    CashInput::query()->firstOrCreate(
                        ['reference' => $sale->reference],
                        [
                            'cash_register_id' => $saleData['cash_register_id'],
                            'sale_id' => $sale->id,
                            'user_id' => $saleData['user_id'],
                            'amount' => $sale->total_amount,
                            'source' => CashInput::SOURCE_SALE,
                            'notes' => null,
                        ],
                    );
                }
            });
        }
    }
}
