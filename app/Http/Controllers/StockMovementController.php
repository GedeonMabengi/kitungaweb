<?php
// app/Http/Controllers/StockMovementController.php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StockMovementController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:stock.movements.view')->only(['index', 'show']);
        $this->middleware('permission:stock.movements.create')->only(['create', 'store']);
    }

    public function index(Request $request)
    {
        $movements = StockMovement::query()
            ->with(['article', 'user'])
            ->when($request->article_id, function ($query, $articleId) {
                $query->forArticle($articleId);
            })
            ->when($request->movement_type, function ($query, $type) {
                $query->ofType($type);
            })
            ->when($request->user_id, function ($query, $userId) {
                $query->where('user_id', $userId);
            })
            ->when($request->start_date && $request->end_date, function ($query) use ($request) {
                $query->betweenDates($request->start_date, $request->end_date);
            })
            ->when($request->search, function ($query, $search) {
                $query->whereHas('article', function ($q) use ($search) {
                    $q->search($search);
                });
            })
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Stock/Movements/Index', [
            'movements' => $movements,
            'articles' => Article::active()->get(['id', 'name']),
            'filters' => $request->only(['article_id', 'movement_type', 'user_id', 'start_date', 'end_date', 'search']),
            'movementTypes' => [
                'IN' => 'Entrée',
                'OUT' => 'Sortie',
                'ADJUSTMENT' => 'Ajustement',
                'SALE' => 'Vente',
                'RETURN' => 'Retour',
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Stock/Movements/Create', [
            'articles' => Article::active()->get(['id', 'name', 'current_stock', 'unit_type', 'units_per_pack']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'article_id' => 'required|exists:articles,id',
            'movement_type' => 'required|in:IN,OUT,ADJUSTMENT',
            'quantity' => 'required|integer|min:1',
            'quantity_type' => 'required|in:PACK,UNIT',
            'reason' => 'required|string|max:255',
            'reference' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $article = Article::findOrFail($validated['article_id']);
        $stockBefore = $article->current_stock;

        // Calculate quantity change
        $quantityChange = $validated['quantity'];
        if ($article->isPack() && $validated['quantity_type'] === 'UNIT') {
            $quantityChange = $validated['quantity'] / $article->units_per_pack;
        }

        if ($validated['movement_type'] === 'OUT') {
            $quantityChange = -$quantityChange;
        }

        // Update stock
        if ($validated['movement_type'] === 'ADJUSTMENT') {
            $article->current_stock = $validated['quantity'];
        } else {
            $article->current_stock += $quantityChange;
        }
        $article->save();

        // Create movement record
        StockMovement::create([
            'article_id' => $article->id,
            'user_id' => auth()->id(),
            'movement_type' => $validated['movement_type'],
            'quantity' => $validated['quantity'],
            'quantity_type' => $validated['quantity_type'],
            'stock_before' => $stockBefore,
            'stock_after' => $article->current_stock,
            'reason' => $validated['reason'],
            'reference' => $validated['reference'],
            'notes' => $validated['notes'],
        ]);

        return redirect()->route('stock.movements.index')
            ->with('success', 'Mouvement de stock enregistré avec succès.');
    }

    public function show(StockMovement $movement)
    {
        return Inertia::render('Stock/Movements/Show', [
            'movement' => $movement->load(['article', 'user']),
        ]);
    }
}