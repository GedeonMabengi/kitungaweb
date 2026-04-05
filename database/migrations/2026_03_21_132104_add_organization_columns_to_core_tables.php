<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('organization_id')
                ->nullable()
                ->after('id')
                ->constrained()
                ->nullOnDelete();
        });

        foreach ([
            'categories',
            'articles',
            'stock_movements',
            'sales',
            'sale_items',
            'cash_registers',
            'cash_inputs',
            'cash_outputs',
        ] as $tableName) {
            Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                $table->foreignId('organization_id')
                    ->nullable()
                    ->after('id')
                    ->constrained()
                    ->nullOnDelete();
            });
        }

        $defaultOrganizationId = DB::table('organizations')->value('id');

        if (! $defaultOrganizationId) {
            $defaultOrganizationId = DB::table('organizations')->insertGetId([
                'name' => 'Organization par defaut',
                'slug' => 'organization-par-defaut-' . Str::lower(Str::random(5)),
                'status' => 'active',
                'currency' => 'XAF',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        DB::table('users')
            ->whereNull('organization_id')
            ->update(['organization_id' => $defaultOrganizationId]);

        foreach ([
            'categories',
            'articles',
            'stock_movements',
            'sales',
            'sale_items',
            'cash_registers',
            'cash_inputs',
            'cash_outputs',
        ] as $tableName) {
            DB::table($tableName)
                ->whereNull('organization_id')
                ->update(['organization_id' => $defaultOrganizationId]);
        }

        $ownerId = DB::table('users')
            ->orderBy('id')
            ->value('id');

        if ($ownerId) {
            DB::table('organizations')
                ->where('id', $defaultOrganizationId)
                ->update(['owner_user_id' => $ownerId]);
        }
    }

    public function down(): void
    {
        foreach ([
            'cash_outputs',
            'cash_inputs',
            'cash_registers',
            'sale_items',
            'sales',
            'stock_movements',
            'articles',
            'categories',
        ] as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->dropConstrainedForeignId('organization_id');
            });
        }

        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('organization_id');
        });
    }
};
