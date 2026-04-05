<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateOrganizationSettingsRequest;
use Illuminate\Http\JsonResponse;

class OrganizationController extends Controller
{
    public function show(): JsonResponse
    {
        $organization = auth()->user()->organization->load([
            'owner:id,name,email',
            'currentSubscription',
            'users.roles',
        ]);

        return response()->json([
            'organization' => [
                'id' => $organization->id,
                'name' => $organization->name,
                'slug' => $organization->slug,
                'billing_email' => $organization->billing_email,
                'phone' => $organization->phone,
                'country_code' => $organization->country_code,
                'currency' => $organization->currency,
                'base_currency' => $organization->base_currency,
                'status' => $organization->status,
                'owner' => $organization->owner,
                'current_subscription' => $organization->currentSubscription,
                'users' => $organization->users->map(function ($user): array {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'roles' => $user->roles->pluck('name')->values()->all(),
                    ];
                })->values(),
            ],
            'supported_currencies' => config('currencies.supported', []),
        ]);
    }

    public function update(UpdateOrganizationSettingsRequest $request): JsonResponse
    {
        abort_unless($request->user()->hasRole('admin'), 403);

        $request->user()->organization()->update($request->validated());

        return response()->json([
            'message' => 'Parametres de l organisation mis a jour.',
            'organization' => $request->user()->organization()->first(),
        ]);
    }
}
