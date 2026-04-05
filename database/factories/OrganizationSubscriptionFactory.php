<?php

namespace Database\Factories;

use App\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\OrganizationSubscription>
 */
class OrganizationSubscriptionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'organization_id' => Organization::factory(),
            'plan_code' => 'starter',
            'plan_name' => 'Starter',
            'billing_cycle' => 'monthly',
            'amount' => 29,
            'currency' => 'USD',
            'seats_limit' => 5,
            'features' => ['pos', 'stock', 'cash'],
            'provider' => 'cinetpay',
            'status' => 'trialing',
            'starts_at' => now(),
            'trial_ends_at' => now()->addDays(14),
            'ends_at' => now()->addDays(14),
        ];
    }
}
