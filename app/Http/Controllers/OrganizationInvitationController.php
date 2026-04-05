<?php

namespace App\Http\Controllers;

use App\Http\Requests\AcceptOrganizationInvitationRequest;
use App\Http\Requests\StoreOrganizationInvitationRequest;
use App\Models\OrganizationInvitation;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class OrganizationInvitationController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'verified', 'role:admin'])->only('store');
    }

    public function store(StoreOrganizationInvitationRequest $request): RedirectResponse
    {
        $organization = $request->user()->organization->load('currentSubscription');

        if (! $organization->hasActiveSubscription()) {
            return back()->with('error', "L'abonnement doit etre actif avant d'inviter un collaborateur.");
        }

        $validated = $request->validated();
        $subscription = $organization->currentSubscription;
        $seatLimit = $subscription?->seats_limit;
        $activeUsers = $organization->users()->count();
        $pendingInvitations = $organization->pendingInvitationsCount();
        $pendingInvitation = OrganizationInvitation::query()
            ->where('organization_id', $organization->id)
            ->where('email', $validated['email'])
            ->where('status', 'pending')
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->first();

        $projectedSeats = $activeUsers + $pendingInvitations + ($pendingInvitation ? 0 : 1);

        if ($seatLimit !== null && $projectedSeats > $seatLimit) {
            return back()->with('error', "La limite d'utilisateurs du plan actuel est atteinte.");
        }

        $existingUser = User::query()
            ->where('email', $validated['email'])
            ->first();

        if ($existingUser && (int) $existingUser->organization_id === (int) $organization->id) {
            return back()->with('error', 'Ce collaborateur fait deja partie de votre organisation.');
        }

        if ($existingUser && (int) $existingUser->organization_id !== (int) $organization->id) {
            return back()->with('error', "Cette adresse email est deja rattachee a une autre organisation.");
        }

        $invitation = OrganizationInvitation::query()->updateOrCreate(
            [
                'organization_id' => $organization->id,
                'email' => $validated['email'],
                'status' => 'pending',
            ],
            [
                'invited_by_user_id' => $request->user()->id,
                'accepted_user_id' => null,
                'role' => $validated['role'],
                'token' => (string) Str::uuid(),
                'expires_at' => now()->addDays((int) ($validated['expires_in_days'] ?? 7)),
                'accepted_at' => null,
            ],
        );

        return redirect()
            ->route('organization.show')
            ->with('success', 'Invitation creee avec succes.')
            ->with('invitation_link', route('organization.invitations.show', $invitation->token));
    }

    public function show(string $token): Response
    {
        $invitation = $this->resolvePendingInvitation($token);

        abort_unless($invitation, 404);

        return Inertia::render('Organization/AcceptInvitation', [
            'invitation' => [
                'token' => $invitation->token,
                'email' => $invitation->email,
                'role' => $invitation->role,
                'expires_at' => $invitation->expires_at?->toIso8601String(),
                'organization' => [
                    'name' => $invitation->organization->name,
                    'slug' => $invitation->organization->slug,
                ],
            ],
        ]);
    }

    public function accept(AcceptOrganizationInvitationRequest $request, string $token): RedirectResponse
    {
        $invitation = $this->resolvePendingInvitation($token);

        abort_unless($invitation, 404);

        if (User::query()->where('email', $invitation->email)->exists()) {
            return back()->withErrors([
                'email' => "Un compte existe deja pour cette adresse email. Connectez-vous ou demandez une autre invitation.",
            ]);
        }

        $user = DB::transaction(function () use ($invitation, $request): User {
            $user = User::create([
                'organization_id' => $invitation->organization_id,
                'name' => $request->validated('name'),
                'email' => $invitation->email,
                'email_verified_at' => now(),
                'password' => $request->validated('password'),
                'is_active' => true,
            ]);

            $user->assignRole($invitation->role);

            $invitation->update([
                'accepted_user_id' => $user->id,
                'status' => 'accepted',
                'accepted_at' => now(),
            ]);

            return $user;
        });

        event(new Registered($user));

        Auth::login($user);

        return redirect()
            ->to($this->resolveAuthenticatedRedirect($user))
            ->with('success', "Votre acces a l'organisation a ete active.");
    }

    private function resolvePendingInvitation(string $token): ?OrganizationInvitation
    {
        return OrganizationInvitation::query()
            ->with('organization')
            ->where('token', $token)
            ->where('status', 'pending')
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->first();
    }

    private function resolveAuthenticatedRedirect(User $user): string
    {
        if (! $user->organization?->hasActiveSubscription()) {
            return route('organization.show');
        }

        if ($user->hasRole('admin')) {
            return route('admin.dashboard');
        }

        if ($user->hasRole('gestionnaire_stock')) {
            return route('stock.dashboard');
        }

        if ($user->hasRole('vendeur')) {
            return route('sales.pos');
        }

        if ($user->hasRole('caissier')) {
            return route('cash.dashboard');
        }

        return route('dashboard');
    }
}
