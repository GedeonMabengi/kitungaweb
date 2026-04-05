<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\StockMovement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class StockMovementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        abort_unless($request->user()->can('stock.movements.view'), 403);

        $movements = StockMovement::query()
            ->with(['article:id,name,unit_type,units_per_pack', 'user:id,name'])
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
                $query->betweenDates(
                    $request->start_date . ' 00:00:00',
                    $request->end_date . ' 23:59:59',
                );
            })
            ->when($request->search, function ($query, $search) {
                $query->whereHas('article', function ($builder) use ($search) {
                    $builder->search($search);
                });
            })
            ->latest()
            ->paginate($request->integer('per_page', 20));

        return response()->json($movements);
    }

    public function store(Request $request): JsonResponse
    {
        abort_unless($request->user()->can('stock.movements.create'), 403);

        $organizationId = (int) $request->user()->organization_id;

        $validated = $request->validate([
            'article_id' => [
                'required',
                Rule::exists('articles', 'id')->where('organization_id', $organizationId),
            ],
            'movement_type' => 'required|in:IN,OUT,ADJUSTMENT',
            'quantity' => 'required|integer|min:1',
            'quantity_type' => 'required|in:PACK,UNIT',
            'reason' => 'required|string|max:255',
            'reference' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $movement = DB::transaction(function () use ($validated, $request): StockMovement {
            $article = Article::query()->findOrFail($validated['article_id']);
            $stockBefore = (int) $article->current_stock;
            $quantityChange = $validated['quantity'];

            if ($article->isPack() && $validated['quantity_type'] === 'UNIT' && $article->units_per_pack) {
                $quantityChange = $validated['quantity'] / $article->units_per_pack;
            }

            if ($validated['movement_type'] === StockMovement::TYPE_OUT && $quantityChange > $article->current_stock) {
                abort(422, 'Le stock disponible est insuffisant pour cette sortie.');
            }

            if ($validated['movement_type'] === StockMovement::TYPE_ADJUSTMENT) {
                $article->update(['current_stock' => $validated['quantity']]);
            } elseif ($validated['movement_type'] === StockMovement::TYPE_OUT) {
                $article->update(['current_stock' => $article->current_stock - $quantityChange]);
            } else {
                $article->update(['current_stock' => $article->current_stock + $quantityChange]);
            }

            return StockMovement::create([
                'article_id' => $article->id,
                'user_id' => $request->user()->id,
                'movement_type' => $validated['movement_type'],
                'quantity' => $validated['quantity'],
                'quantity_type' => $validated['quantity_type'],
                'stock_before' => $stockBefore,
                'stock_after' => (int) $article->fresh()->current_stock,
                'reason' => $validated['reason'],
                'reference' => $validated['reference'] ?? null,
                'notes' => $validated['notes'] ?? null,
            ]);
        });

        return response()->json([
            'message' => 'Mouvement de stock enregistre avec succes.',
            'movement' => $movement->load(['article:id,name,unit_type,units_per_pack', 'user:id,name']),
        ], 201);
    }

    public function show(Request $request, StockMovement $stockMovement): JsonResponse
    {
        abort_unless($request->user()->can('stock.movements.view'), 403);

        return response()->json([
            'movement' => $stockMovement->load(['article:id,name,unit_type,units_per_pack', 'user:id,name']),
        ]);
    }
}
