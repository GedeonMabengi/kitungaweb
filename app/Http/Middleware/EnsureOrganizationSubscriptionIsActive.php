<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureOrganizationSubscriptionIsActive
{
    public function handle(Request $request, Closure $next): Response|RedirectResponse
    {
        $organization = $request->user()?->organization;

        if ($organization && $organization->hasActiveSubscription()) {
            return $next($request);
        }

        return redirect()
            ->route('organization.show')
            ->with('error', "Un abonnement actif est requis pour acceder a ce module.");
    }
}
