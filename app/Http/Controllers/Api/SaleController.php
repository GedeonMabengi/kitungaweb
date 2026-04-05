<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\CashInput;
use App\Models\Category;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\StockMovement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SaleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $sales = Sale::query()
            ->with(['user:id,name', 'items.article:id,name'])
            ->when(! $user->can('sales.view_all'), function ($query) use ($user) {
                $query->byUser($user->id);
            })
            ->when($request->search, function ($query, $search) {
                $query->where(function ($builder) use ($search) {
                    $builder->where('reference', 'like', "%{$search}%")
                        ->orWhere('customer_name', 'like', "%{$search}%");
                });
            })
            ->when($request->status, function ($query, $status) {
                $query->byStatus($status);
            })
            ->when($request->start_date && $request->end_date, function ($query) use ($request) {
                $query->betweenDates(
                    $request->start_date . ' 00:00:00',
                    $request->end_date . ' 23:59:59',
                );
            })
            ->latest()
            ->paginate($request->integer('per_page', 20));

        return response()->json($sales);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.article_id' => 'required|exists:articles,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.quantity_type' => 'required|in:PACK,UNIT',
            'items.*.unit_price' => 'required|numeric|min:0',
            'payment_method' => 'required|in:CASH,CARD,MOBILE,CREDIT,OTHER',
            'amount_paid' => 'required|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'customer_name' => 'nullable|string|max:255',
            'customer_phone' => 'nullable|string|max:50',
            'notes' => 'nullable|string',
        ]);

        $user = $request->user();
        $cashRegister = $user->getOpenCashRegister();

        if (! $cashRegister) {
            return response()->json([
                'message' => 'Une caisse doit etre ouverte avant de finaliser une vente.',
            ], 422);
        }

        $sale = DB::transaction(function () use ($validated, $user, $cashRegister): Sale {
            $sale = Sale::create([
                'user_id' => $user->id,
                'cash_register_id' => $cashRegister->id,
                'discount' => $validated['discount'] ?? 0,
                'payment_method' => $validated['payment_method'],
                'payment_status' => Sale::STATUS_PAID,
                'amount_paid' => $validated['amount_paid'],
                'customer_name' => $validated['customer_name'] ?? null,
                'customer_phone' => $validated['customer_phone'] ?? null,
                'notes' => $validated['notes'] ?? null,
            ]);

            $subtotal = 0;

            foreach ($validated['items'] as $item) {
                $article = Article::query()->findOrFail($item['article_id']);
                $itemSubtotal = $item['quantity'] * $item['unit_price'];
                $subtotal += $itemSubtotal;

                SaleItem::create([
                    'sale_id' => $sale->id,
                    'article_id' => $item['article_id'],
                    'quantity' => $item['quantity'],
                    'quantity_type' => $item['quantity_type'],
                    'unit_price' => $item['unit_price'],
                    'subtotal' => $itemSubtotal,
                ]);

                $stockBefore = $article->current_stock;
                $stockDeduction = $item['quantity'];

                if ($article->isPack() && $item['quantity_type'] === 'UNIT') {
                    $stockDeduction = $item['quantity'] / $article->units_per_pack;
                }

                $article->decrement('current_stock', $stockDeduction);

                StockMovement::create([
                    'article_id' => $article->id,
                    'user_id' => $user->id,
                    'movement_type' => StockMovement::TYPE_SALE,
                    'quantity' => $item['quantity'],
                    'quantity_type' => $item['quantity_type'],
                    'stock_before' => $stockBefore,
                    'stock_after' => $article->fresh()->current_stock,
                    'reason' => 'Vente',
                    'reference' => $sale->reference,
                ]);
            }

            $netTotal = $subtotal - ($validated['discount'] ?? 0);

            $sale->update([
                'subtotal' => $subtotal,
                'total_amount' => $netTotal,
                'change_amount' => max(0, $validated['amount_paid'] - $netTotal),
            ]);

            CashInput::create([
                'cash_register_id' => $cashRegister->id,
                'sale_id' => $sale->id,
                'user_id' => $user->id,
                'amount' => $sale->total_amount,
                'source' => CashInput::SOURCE_SALE,
                'reference' => $sale->reference,
            ]);

            return $sale;
        });

        return response()->json([
            'message' => 'Vente enregistree avec succes.',
            'sale' => $sale->load(['user:id,name', 'items.article', 'cashRegister']),
        ], 201);
    }

    public function show(Request $request, Sale $sale): JsonResponse
    {
        $user = $request->user();

        if (! $user->can('sales.view_all') && $sale->user_id !== $user->id) {
            return response()->json(['message' => 'Non autorise.'], 403);
        }

        return response()->json([
            'sale' => $sale->load(['user:id,name', 'items.article', 'cashRegister']),
        ]);
    }

    public function cancel(Sale $sale): JsonResponse
    {
        if ($sale->is_cancelled) {
            return response()->json([
                'message' => 'Cette vente est deja annulee.',
            ], 422);
        }

        $sale->cancel();

        return response()->json([
            'message' => 'Vente annulee avec succes.',
            'sale' => $sale->fresh()->load(['items.article']),
        ]);
    }

    public function todayStats(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Sale::query()->today()->paid();

        if (! $user->can('sales.view_all')) {
            $query->byUser($user->id);
        }

        return response()->json([
            'count' => $query->count(),
            'total' => (float) $query->sum('total_amount'),
            'categories' => Category::active()->orderBy('name')->get(['id', 'name']),
        ]);
    }
}
