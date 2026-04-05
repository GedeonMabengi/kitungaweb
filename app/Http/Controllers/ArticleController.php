<?php
// app/Http/Controllers/ArticleController.php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Category;
use App\Models\StockMovement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ArticleController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:articles.view')->only(['index', 'show']);
        $this->middleware('permission:articles.create')->only(['create', 'store']);
        $this->middleware('permission:articles.edit')->only(['edit', 'update']);
        $this->middleware('permission:articles.delete')->only('destroy');
    }

    public function index(Request $request): Response
    {
        $articles = Article::query()
            ->with('category')
            ->when($request->search, function ($query, $search) {
                $query->search($search);
            })
            ->when($request->category_id, function ($query, $categoryId) {
                $query->where('category_id', $categoryId);
            })
            ->when($request->stock_status, function ($query, $status) {
                match ($status) {
                    'low' => $query->lowStock(),
                    'out' => $query->where('current_stock', '<=', 0),
                    'ok' => $query->whereColumn('current_stock', '>', 'alert_threshold'),
                    default => $query,
                };
            })
            ->when($request->unit_type, function ($query, $type) {
                $query->where('unit_type', $type);
            })
            ->when($request->has('active'), function ($query) use ($request) {
                $query->where('is_active', $request->active);
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Articles/Index', [
            'articles' => $articles,
            'categories' => Category::active()->orderBy('name')->get(['id', 'name']),
            'filters' => $request->only(['search', 'category_id', 'stock_status', 'unit_type', 'active']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Articles/Create', [
            'categories' => Category::active()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $organizationId = (int) $request->user()->organization_id;

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => [
                'nullable',
                Rule::exists('categories', 'id')->where('organization_id', $organizationId),
            ],
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'unit_type' => 'required|in:PACK,UNIT',
            'units_per_pack' => 'required_if:unit_type,PACK|nullable|integer|min:1',
            'unit_price' => 'nullable|numeric|min:0',
            'initial_quantity' => 'required|integer|min:0',
            'alert_threshold' => 'required|integer|min:0',
            'expiration_date' => 'nullable|date|after:today',
            'image' => 'nullable|image|max:2048',
            'is_active' => 'boolean',
            'allow_unit_sale' => 'boolean',
            'barcode' => 'nullable|string|unique:articles',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('articles', 'public');
        }

        $validated['current_stock'] = $validated['initial_quantity'];

        DB::transaction(function () use ($validated): void {
            $article = Article::create($validated);

            if ($validated['initial_quantity'] > 0) {
                StockMovement::create([
                    'article_id' => $article->id,
                    'user_id' => auth()->id(),
                    'movement_type' => StockMovement::TYPE_IN,
                    'quantity' => $validated['initial_quantity'],
                    'quantity_type' => $validated['unit_type'],
                    'stock_before' => 0,
                    'stock_after' => $validated['initial_quantity'],
                    'reason' => 'Stock initial',
                ]);
            }
        });

        return redirect()->route('articles.index')
            ->with('success', 'Article cree avec succes.');
    }

    public function show(Article $article): Response
    {
        return Inertia::render('Articles/Show', [
            'article' => $article->load('category'),
            'movements' => $article->stockMovements()
                ->with('user')
                ->latest()
                ->take(20)
                ->get(),
            'salesStats' => [
                'total_sold' => $article->saleItems()->sum('quantity'),
                'total_revenue' => $article->saleItems()->sum('subtotal'),
            ],
        ]);
    }

    public function edit(Article $article): Response
    {
        return Inertia::render('Articles/Edit', [
            'article' => $article,
            'categories' => Category::active()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, Article $article): RedirectResponse
    {
        $organizationId = (int) $request->user()->organization_id;

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => [
                'nullable',
                Rule::exists('categories', 'id')->where('organization_id', $organizationId),
            ],
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'unit_type' => 'required|in:PACK,UNIT',
            'units_per_pack' => 'required_if:unit_type,PACK|nullable|integer|min:1',
            'unit_price' => 'nullable|numeric|min:0',
            'alert_threshold' => 'required|integer|min:0',
            'expiration_date' => 'nullable|date',
            'image' => 'nullable|image|max:2048',
            'is_active' => 'boolean',
            'allow_unit_sale' => 'boolean',
            'barcode' => 'nullable|string|unique:articles,barcode,' . $article->id,
        ]);

        if ($request->hasFile('image')) {
            if ($article->image) {
                Storage::disk('public')->delete($article->image);
            }

            $validated['image'] = $request->file('image')->store('articles', 'public');
        }

        $article->update($validated);

        return redirect()->route('articles.index')
            ->with('success', 'Article mis a jour avec succes.');
    }

    public function destroy(Article $article): RedirectResponse
    {
        if ($article->saleItems()->exists()) {
            return back()->with('error', 'Impossible de supprimer un article avec un historique de ventes.');
        }

        if ($article->image) {
            Storage::disk('public')->delete($article->image);
        }

        $article->delete();

        return redirect()->route('articles.index')
            ->with('success', 'Article supprime avec succes.');
    }

    public function adjustStock(Request $request, Article $article): RedirectResponse
    {
        abort_unless(auth()->user()?->can('stock.adjust'), 403);

        $validated = $request->validate([
            'quantity' => 'required|integer',
            'quantity_type' => 'required|in:PACK,UNIT',
            'movement_type' => 'required|in:IN,OUT,ADJUSTMENT',
            'reason' => 'required|string|max:255',
            'reference' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $stockBefore = $article->current_stock;

        if ($validated['movement_type'] === 'IN') {
            $article->adjustStock($validated['quantity'], $validated['quantity_type']);
        } elseif ($validated['movement_type'] === 'OUT') {
            $article->adjustStock(-$validated['quantity'], $validated['quantity_type']);
        } else {
            $article->update(['current_stock' => $validated['quantity']]);
        }

        StockMovement::create([
            'article_id' => $article->id,
            'user_id' => auth()->id(),
            'movement_type' => $validated['movement_type'],
            'quantity' => $validated['quantity'],
            'quantity_type' => $validated['quantity_type'],
            'stock_before' => $stockBefore,
            'stock_after' => $article->fresh()->current_stock,
            'reason' => $validated['reason'],
            'reference' => $validated['reference'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        return back()->with('success', 'Stock ajuste avec succes.');
    }
}
