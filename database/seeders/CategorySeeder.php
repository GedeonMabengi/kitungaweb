<?php
// database/seeders/CategorySeeder.php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Organization;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Boissons',
                'description' => 'Eaux minerales, jus, sodas et boissons energisantes',
            ],
            [
                'name' => 'Alimentation',
                'description' => 'Produits alimentaires de base : riz, farine, huile, sucre',
            ],
            [
                'name' => 'Produits laitiers',
                'description' => 'Lait, yaourt, fromage et derives',
            ],
            [
                'name' => 'Hygiene & Beaute',
                'description' => "Produits d'hygiene personnelle et cosmetiques",
            ],
            [
                'name' => 'Articles menagers',
                'description' => "Produits d'entretien et articles pour la maison",
            ],
        ];

        Organization::query()->each(function (Organization $organization) use ($categories): void {
            foreach ($categories as $category) {
                Category::withoutGlobalScopes()->updateOrCreate(
                    [
                        'organization_id' => $organization->id,
                        'slug' => Str::slug($category['name']),
                    ],
                    [
                        'organization_id' => $organization->id,
                        'name' => $category['name'],
                        'description' => $category['description'],
                        'image' => null,
                        'is_active' => true,
                    ],
                );
            }
        });
    }
}
