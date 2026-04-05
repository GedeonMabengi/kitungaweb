<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\Organization;
use App\Models\OrganizationSubscription;
use App\Models\User;
use Exception;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        if (! Auth::check() && $request->session()->has('login.id')) {
            return redirect()->route('two-factor.login');
        }

        $request->session()->regenerate();

        $user = Auth::user();
        $user->update(['last_login_at' => now()]);

        return redirect()->intended($this->getRedirectRoute($user));
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }

    public function createRegister(): Response
    {
        return Inertia::render('Auth/Register');
    }

    public function storeRegister(RegisterRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        try {
            return DB::transaction(function () use ($validated, $request): RedirectResponse {
                $trialEndsAt = now()->addDays((int) config('subscriptions.trial_days', 14));
                $defaultCurrency = config('currencies.default', 'CDF');

                $organization = Organization::create([
                    'name' => $validated['organization_name'],
                    'billing_email' => $validated['email'],
                    'country_code' => 'CD',
                    'currency' => $defaultCurrency,
                    'base_currency' => $defaultCurrency,
                    'status' => 'active',
                    'trial_ends_at' => $trialEndsAt,
                ]);

                $user = User::create([
                    'organization_id' => $organization->id,
                    'name' => $validated['name'],
                    'email' => $validated['email'],
                    'password' => Hash::make($validated['password']),
                    'is_active' => true,
                ]);

                $organization->update(['owner_user_id' => $user->id]);

                $user->assignRole('admin');

                OrganizationSubscription::create([
                    'organization_id' => $organization->id,
                    'plan_code' => 'trial',
                    'plan_name' => 'Essai',
                    'billing_cycle' => 'monthly',
                    'amount' => 0,
                    'currency' => 'USD',
                    'seats_limit' => 3,
                    'features' => ['dashboard', 'stock', 'sales', 'cash', 'reports'],
                    'provider' => 'cinetpay',
                    'status' => 'trialing',
                    'starts_at' => now(),
                    'trial_ends_at' => $trialEndsAt,
                    'ends_at' => $trialEndsAt,
                ]);

                event(new Registered($user));

                Auth::login($user);

                Log::info("Nouvelle organisation inscrite : {$organization->id}", [
                    'organization' => $organization->name,
                    'owner_email' => $user->email,
                ]);

                return redirect()
                    ->route('dashboard')
                    ->with('success', 'Votre organisation a ete creee avec succes.');
            });
        } catch (Exception $exception) {
            Log::error("Erreur lors de l'inscription SaaS : {$exception->getMessage()}", [
                'input' => $request->except(['password', 'password_confirmation']),
            ]);

            return back()
                ->withInput($request->except('password'))
                ->withErrors([
                    'error' => "Une erreur est survenue lors de la creation de l'organisation.",
                ]);
        }
    }

    private function getRedirectRoute(User $user): string
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
