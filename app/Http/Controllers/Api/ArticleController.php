<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\StockMovement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ArticleController extends Controller
{
    public function index(Request $request): JsonResponse
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
            ->when($request->has('active'), function ($query) use ($request) {
                $query->where('is_active', $request->active);
            })
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return response()->json($articles);
    }

    public function store(Request $request): JsonResponse
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

        $article = DB::transaction(function () use ($validated) {
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

            return $article;
        });

        return response()->json([
            'message' => 'Article cree avec succes.',
            'article' => $article->load('category'),
        ], 201);
    }

    public function show(Article $article): JsonResponse
    {
        return response()->json([
            'article' => $article->load('category'),
            'movements' => $article->stockMovements()->with('user')->latest()->take(20)->get(),
        ]);
    }

    public function update(Request $request, Article $article): JsonResponse
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

        return response()->json([
            'message' => 'Article mis a jour avec succes.',
            'article' => $article->fresh()->load('category'),
        ]);
    }

    public function destroy(Article $article): JsonResponse
    {
        if ($article->saleItems()->exists()) {
            return response()->json([
                'message' => 'Impossible de supprimer un article avec un historique de ventes.',
            ], 422);
        }

        if ($article->image) {
            Storage::disk('public')->delete($article->image);
        }

        $article->delete();

        return response()->json([
            'message' => 'Article supprime avec succes.',
        ]);
    }

    public function adjustStock(Request $request, Article $article): JsonResponse
    {
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

        return response()->json([
            'message' => 'Stock ajuste avec succes.',
            'article' => $article->fresh()->load('category'),
        ]);
    }

    public function lowStock(): JsonResponse
    {
        return response()->json(Article::lowStock()->with('category')->get());
    }

    public function expiring(): JsonResponse
    {
        return response()->json(Article::expiringSoon()->with('category')->get());
    }
}
