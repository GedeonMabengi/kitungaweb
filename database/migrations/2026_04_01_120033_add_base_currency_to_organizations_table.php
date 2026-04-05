<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('organizations', function (Blueprint $table) {
            $table->string('base_currency', 10)->nullable()->after('currency');
        });

        DB::table('organizations')->update([
            'base_currency' => DB::raw('currency'),
        ]);

        Schema::table('organizations', function (Blueprint $table) {
            $table->string('base_currency', 10)->default('CDF')->nullable(false)->change();
        });
    }

    public function down(): void
    {
        Schema::table('organizations', function (Blueprint $table) {
            $table->dropColumn('base_currency');
        });
    }
};
