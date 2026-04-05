<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $categories = Category::query()
            ->withCount('articles')
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->when($request->filled('status'), function ($query) use ($request) {
                $query->where('is_active', filter_var($request->status, FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE) ?? $request->status);
            })
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return response()->json($categories);
    }

    public function store(Request $request): JsonResponse
    {
        $organizationId = (int) $request->user()->organization_id;

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('categories', 'name')->where('organization_id', $organizationId),
            ],
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
            'is_active' => 'boolean',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('categories', 'public');
        }

        $validated['slug'] = Str::slug($validated['name']);

        $category = Category::create($validated);

        return response()->json([
            'message' => 'Categorie creee avec succes.',
            'category' => $category->fresh()->loadCount('articles'),
        ], 201);
    }

    public function show(Category $category): JsonResponse
    {
        return response()->json([
            'category' => $category->load(['articles']),
        ]);
    }

    public function update(Request $request, Category $category): JsonResponse
    {
        $organizationId = (int) $request->user()->organization_id;

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('categories', 'name')
                    ->where('organization_id', $organizationId)
                    ->ignore($category->id),
            ],
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
            'is_active' => 'boolean',
        ]);

        if ($request->hasFile('image')) {
            if ($category->image) {
                Storage::disk('public')->delete($category->image);
            }

            $validated['image'] = $request->file('image')->store('categories', 'public');
        }

        $validated['slug'] = Str::slug($validated['name']);

        $category->update($validated);

        return response()->json([
            'message' => 'Categorie mise a jour avec succes.',
            'category' => $category->fresh()->loadCount('articles'),
        ]);
    }

    public function destroy(Category $category): JsonResponse
    {
        if ($category->articles()->exists()) {
            return response()->json([
                'message' => 'Impossible de supprimer une categorie contenant des articles.',
            ], 422);
        }

        if ($category->image) {
            Storage::disk('public')->delete($category->image);
        }

        $category->delete();

        return response()->json([
            'message' => 'Categorie supprimee avec succes.',
        ]);
    }
}
