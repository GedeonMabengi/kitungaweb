<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $organizationId = $request->user()->organization_id;

        $users = User::query()
            ->where('organization_id', $organizationId)
            ->with('roles')
            ->when($request->search, function ($query, $search) {
                $query->where(function ($builder) use ($search) {
                    $builder->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($request->role, function ($query, $role) {
                $query->whereHas('roles', function ($builder) use ($role) {
                    $builder->where('name', $role);
                });
            })
            ->when($request->has('active'), function ($query) use ($request) {
                $query->where('is_active', $request->active);
            })
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return response()->json([
            'users' => $users,
            'roles' => Role::query()->pluck('name')->values()->all(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'phone' => 'nullable|string|max:50',
            'password' => ['required', 'confirmed', Password::defaults()],
            'role' => 'required|exists:roles,name',
            'is_active' => 'boolean',
        ]);

        $user = User::create([
            'organization_id' => $request->user()->organization_id,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => Hash::make($validated['password']),
            'is_active' => $validated['is_active'] ?? true,
        ]);

        $user->assignRole($validated['role']);

        return response()->json([
            'message' => 'Utilisateur cree avec succes.',
            'user' => $user->load('roles'),
        ], 201);
    }

    public function show(User $user): JsonResponse
    {
        $this->authorizeOrganizationAccess($user);

        return response()->json([
            'user' => $user->load('roles'),
            'stats' => [
                'total_sales' => $user->sales()->count(),
                'total_sales_amount' => (float) $user->sales()->paid()->sum('total_amount'),
                'stock_movements' => $user->stockMovements()->count(),
            ],
        ]);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $this->authorizeOrganizationAccess($user);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:50',
            'password' => ['nullable', 'confirmed', Password::defaults()],
            'role' => 'required|exists:roles,name',
            'is_active' => 'boolean',
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        if (! empty($validated['password'])) {
            $user->update(['password' => Hash::make($validated['password'])]);
        }

        $user->syncRoles([$validated['role']]);

        return response()->json([
            'message' => 'Utilisateur mis a jour avec succes.',
            'user' => $user->fresh()->load('roles'),
        ]);
    }

    public function destroy(User $user): JsonResponse
    {
        $this->authorizeOrganizationAccess($user);

        if ($user->id === auth()->id()) {
            return response()->json([
                'message' => 'Vous ne pouvez pas supprimer votre propre compte.',
            ], 422);
        }

        $user->delete();

        return response()->json([
            'message' => 'Utilisateur supprime avec succes.',
        ]);
    }

    public function toggleActive(User $user): JsonResponse
    {
        $this->authorizeOrganizationAccess($user);

        if ($user->id === auth()->id()) {
            return response()->json([
                'message' => 'Vous ne pouvez pas desactiver votre propre compte.',
            ], 422);
        }

        $user->update(['is_active' => ! $user->is_active]);

        return response()->json([
            'message' => 'Statut de l utilisateur modifie.',
            'user' => $user->fresh()->load('roles'),
        ]);
    }

    private function authorizeOrganizationAccess(User $user): void
    {
        abort_unless(
            (int) $user->organization_id === (int) auth()->user()->organization_id,
            404,
        );
    }
}
