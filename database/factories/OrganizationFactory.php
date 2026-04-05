<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Organization>
 */
class OrganizationFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->company();
        $baseCurrency = config('currencies.default', 'CDF');

        return [
            'name' => $name,
            'slug' => Str::slug($name) . '-' . Str::lower(Str::random(5)),
            'billing_email' => fake()->companyEmail(),
            'phone' => fake()->phoneNumber(),
            'country_code' => 'CD',
            'currency' => $baseCurrency,
            'base_currency' => $baseCurrency,
            'status' => 'active',
            'trial_ends_at' => now()->addDays(14),
        ];
    }
}
