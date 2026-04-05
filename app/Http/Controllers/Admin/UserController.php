<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:users.view')->only(['index', 'show']);
        $this->middleware('permission:users.create')->only(['create', 'store']);
        $this->middleware('permission:users.edit')->only(['edit', 'update']);
        $this->middleware('permission:users.delete')->only('destroy');
    }

    public function index(Request $request)
    {
        $organizationId = auth()->user()->organization_id;

        $users = User::query()
            ->where('organization_id', $organizationId)
            ->with('roles')
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($request->role, function ($query, $role) {
                $query->whereHas('roles', function ($q) use ($role) {
                    $q->where('name', $role);
                });
            })
            ->when($request->has('active'), function ($query) use ($request) {
                $query->where('is_active', $request->active);
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'roles' => Role::all(),
            'filters' => $request->only(['search', 'role', 'active']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Users/Create', [
            'roles' => Role::all(),
        ]);
    }

    public function store(Request $request)
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
            'organization_id' => auth()->user()->organization_id,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'password' => Hash::make($validated['password']),
            'is_active' => $validated['is_active'] ?? true,
        ]);

        $user->assignRole($validated['role']);

        return redirect()->route('admin.users.index')
            ->with('success', 'Utilisateur cree avec succes.');
    }

    public function show(User $user)
    {
        $this->authorizeOrganizationAccess($user);

        return Inertia::render('Admin/Users/Show', [
            'user' => $user->load('roles'),
            'stats' => [
                'total_sales' => $user->sales()->count(),
                'total_sales_amount' => $user->sales()->paid()->sum('total_amount'),
                'stock_movements' => $user->stockMovements()->count(),
            ],
        ]);
    }

    public function edit(User $user)
    {
        $this->authorizeOrganizationAccess($user);

        return Inertia::render('Admin/Users/Edit', [
            'user' => $user->load('roles'),
            'roles' => Role::all(),
        ]);
    }

    public function update(Request $request, User $user)
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
            'phone' => $validated['phone'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        if (! empty($validated['password'])) {
            $user->update(['password' => Hash::make($validated['password'])]);
        }

        $user->syncRoles([$validated['role']]);

        return redirect()->route('admin.users.index')
            ->with('success', 'Utilisateur mis a jour avec succes.');
    }

    public function destroy(User $user)
    {
        $this->authorizeOrganizationAccess($user);

        if ($user->id === auth()->id()) {
            return back()->with('error', 'Vous ne pouvez pas supprimer votre propre compte.');
        }

        $user->delete();

        return redirect()->route('admin.users.index')
            ->with('success', 'Utilisateur supprime avec succes.');
    }

    public function toggleActive(User $user)
    {
        $this->authorizeOrganizationAccess($user);

        if ($user->id === auth()->id()) {
            return back()->with('error', 'Vous ne pouvez pas desactiver votre propre compte.');
        }

        $user->update(['is_active' => ! $user->is_active]);

        return back()->with('success', "Statut de l'utilisateur modifie.");
    }

    private function authorizeOrganizationAccess(User $user): void
    {
        abort_unless(
            $user->organization_id === auth()->user()->organization_id,
            404,
        );
    }
}
