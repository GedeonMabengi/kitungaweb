<?php

namespace App\Http\Middleware;

use App\Support\DashboardNavigation;
use App\Support\CurrencyConverter;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();
        $organization = $user?->organization;
        $displayCurrency = $organization?->currency;
        $baseCurrency = $organization?->base_currency ?: $displayCurrency;
        $exchangeRate = 1.0;

        if ($organization && $displayCurrency && $baseCurrency) {
            try {
                $exchangeRate = app(CurrencyConverter::class)->rate($baseCurrency, $displayCurrency);
            } catch (\Throwable) {
                $exchangeRate = 1.0;
            }
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'flash' => [
                'success' => fn (): ?string => $request->session()->get('success'),
                'error' => fn (): ?string => $request->session()->get('error'),
                'invitation_link' => fn (): ?string => $request->session()->get('invitation_link'),
            ],
            'auth' => [
                'user' => $user
                    ? [
                        'id' => $user->id,
                        'organization_id' => $user->organization_id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'roles' => $user->getRoleNames()
                            ->map(fn (string $roleName): array => ['name' => $roleName])
                            ->values()
                            ->all(),
                        'permissions' => $user->getAllPermissions()
                            ->pluck('name')
                            ->values()
                            ->all(),
                    ]
                    : null,
            ],
            'organization' => $organization
                ? [
                    'id' => $organization->id,
                    'name' => $organization->name,
                    'slug' => $organization->slug,
                    'status' => $organization->status,
                    'currency' => $displayCurrency,
                    'base_currency' => $baseCurrency,
                    'exchange_rate' => $exchangeRate,
                    'subscription' => $organization->currentSubscription
                        ? [
                            'plan_name' => $organization->currentSubscription->plan_name,
                            'plan_code' => $organization->currentSubscription->plan_code,
                            'status' => $organization->currentSubscription->status,
                            'ends_at' => $organization->currentSubscription->ends_at?->toIso8601String(),
                        ]
                        : null,
                ]
                : null,
            'navigation' => fn (): array => app(DashboardNavigation::class)->forUser($user),
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
