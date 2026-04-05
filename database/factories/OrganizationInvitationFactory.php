<?php

namespace Database\Factories;

use App\Models\Organization;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\OrganizationInvitation>
 */
class OrganizationInvitationFactory extends Factory
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
            'invited_by_user_id' => User::factory(),
            'accepted_user_id' => null,
            'email' => fake()->unique()->safeEmail(),
            'role' => fake()->randomElement(['admin', 'gestionnaire_stock', 'vendeur', 'caissier']),
            'token' => (string) Str::uuid(),
            'status' => 'pending',
            'expires_at' => now()->addDays(7),
            'accepted_at' => null,
        ];
    }
}
