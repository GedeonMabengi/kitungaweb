<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateOrganizationSettingsRequest;
use Illuminate\Http\RedirectResponse;
use Spatie\Permission\Models\Role;
use Inertia\Inertia;
use Inertia\Response;

class OrganizationController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'verified']);
        $this->middleware('role:admin')->only('update');
    }

    public function show(): Response
    {
        $organization = auth()->user()->organization->load([
            'owner',
            'currentSubscription',
            'payments' => fn ($query) => $query->latest()->limit(10),
            'invitations' => fn ($query) => $query->latest()->limit(10),
            'users' => fn ($query) => $query->with('roles')->latest()->limit(10),
        ]);

        return Inertia::render('Organization/Show', [
            'organization' => $organization,
            'plans' => config('subscriptions.plans', []),
            'availableRoles' => Role::query()->pluck('name')->all(),
            'supportedCurrencies' => config('currencies.supported', []),
            'seatUsage' => [
                'active_users' => $organization->users()->count(),
                'pending_invitations' => $organization->pendingInvitationsCount(),
                'limit' => $organization->currentSubscription?->seats_limit,
            ],
        ]);
    }

    public function update(UpdateOrganizationSettingsRequest $request): RedirectResponse
    {
        $request->user()->organization()->update($request->validated());

        return redirect()
            ->route('organization.show')
            ->with('success', "Les parametres de l'organisation ont ete mis a jour.");
    }
}
