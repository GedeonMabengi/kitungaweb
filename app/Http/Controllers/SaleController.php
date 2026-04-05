<?php
// app/Http/Controllers/SaleController.php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\CashInput;
use App\Models\Category;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\StockMovement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SaleController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:sales.view')->only(['index', 'show']);
        $this->middleware('permission:sales.create')->only(['create', 'store', 'pos']);
        $this->middleware('permission:sales.edit')->only(['edit', 'update']);
        $this->middleware('permission:sales.delete')->only('destroy');
    }

    public function index(Request $request): Response
    {
        $user = auth()->user();

        $salesQuery = Sale::query()
            ->with(['user', 'items.article']);

        if (! $user->can('sales.view_all')) {
            $salesQuery->byUser($user->id);
        }

        $sales = $salesQuery
            ->when($request->search, function ($query, $search) {
                $query->where(function ($builder) use ($search) {
                    $builder->where('reference', 'like', "%{$search}%")
                        ->orWhere('customer_name', 'like', "%{$search}%");
                });
            })
            ->when($request->status, function ($query, $status) {
                $query->byStatus($status);
            })
            ->when($request->user_id, function ($query, $userId) {
                $query->byUser($userId);
            })
            ->when($request->start_date && $request->end_date, function ($query) use ($request) {
                $query->betweenDates(
                    $request->start_date . ' 00:00:00',
                    $request->end_date . ' 23:59:59',
                );
            })
            ->when($request->payment_method, function ($query, $method) {
                $query->where('payment_method', $method);
            })
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Sales/Index', [
            'sales' => $sales,
            'filters' => $request->only(['search', 'status', 'user_id', 'start_date', 'end_date', 'payment_method']),
            'canViewAll' => $user->can('sales.view_all'),
        ]);
    }

    public function pos(): Response
    {
        $user = auth()->user();
        $cashRegister = $user->getOpenCashRegister();

        return Inertia::render('Sales/POS', [
            'articles' => Article::active()
                ->where('current_stock', '>', 0)
                ->with('category')
                ->get(),
            'categories' => Category::active()->get(['id', 'name']),
            'cashRegister' => $cashRegister,
            'hasCashRegister' => $cashRegister !== null,
        ]);
    }

    public function store(Request $request): RedirectResponse
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

        $user = auth()->user();
        $cashRegister = $user->getOpenCashRegister();

        if (! $cashRegister) {
            return back()->with('error', 'Une caisse doit etre ouverte avant de finaliser une vente.');
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
                $article = Article::findOrFail($item['article_id']);
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

        return redirect()->route('sales.show', $sale)
            ->with('success', 'Vente enregistree avec succes.');
    }

    public function show(Sale $sale): Response
    {
        $this->authorizeView($sale);

        return Inertia::render('Sales/Show', [
            'sale' => $sale->load(['user', 'items.article', 'cashRegister']),
        ]);
    }

    public function cancel(Sale $sale): RedirectResponse
    {
        abort_unless(auth()->user()?->can('sales.edit'), 403);

        if ($sale->is_cancelled) {
            return back()->with('error', 'Cette vente est deja annulee.');
        }

        $sale->cancel();

        return back()->with('success', 'Vente annulee avec succes.');
    }

    private function authorizeView(Sale $sale): void
    {
        $user = auth()->user();

        if (! $user->can('sales.view_all') && $sale->user_id !== $user->id) {
            abort(403, 'Vous n etes pas autorise a voir cette vente.');
        }
    }
}
