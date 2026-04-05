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
        $defaultOrganizationId = DB::table('organizations')->value('id');

        if (! $defaultOrganizationId) {
            $defaultOrganizationId = DB::table('organizations')->insertGetId([
                'name' => 'Kitunga Default',
                'slug' => 'kitunga-default-' . Str::lower(Str::random(5)),
                'status' => 'active',
                'currency' => 'XAF',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        foreach ([
            'users',
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

        if (Schema::hasTable('organization_invitations')) {
            Schema::table('organization_invitations', function (Blueprint $table) {
                if (! Schema::hasColumn('organization_invitations', 'accepted_user_id')) {
                    $table->foreignId('accepted_user_id')
                        ->nullable()
                        ->after('invited_by_user_id')
                        ->constrained('users')
                        ->nullOnDelete();
                }

                $table->index(
                    ['organization_id', 'email'],
                    'organization_invitations_organization_email_index',
                );
                $table->index(
                    ['organization_id', 'status', 'expires_at'],
                    'organization_invitations_status_expires_index',
                );
            });
        }
    }

    public function down(): void
    {
        if (! Schema::hasTable('organization_invitations')) {
            return;
        }

        Schema::table('organization_invitations', function (Blueprint $table) {
            $table->dropIndex('organization_invitations_organization_email_index');
            $table->dropIndex('organization_invitations_status_expires_index');

            if (Schema::hasColumn('organization_invitations', 'accepted_user_id')) {
                $table->dropConstrainedForeignId('accepted_user_id');
            }
        });
    }
};
