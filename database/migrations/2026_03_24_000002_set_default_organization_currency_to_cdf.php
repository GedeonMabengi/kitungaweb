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
            $table->string('currency', 10)->default('CDF')->change();
        });

        DB::table('organizations')
            ->whereNull('currency')
            ->update(['currency' => 'CDF']);

        DB::table('organizations')
            ->where('name', 'Organization par defaut')
            ->where('currency', 'XAF')
            ->update(['currency' => 'CDF']);
    }

    public function down(): void
    {
        Schema::table('organizations', function (Blueprint $table) {
            $table->string('currency', 10)->default('XAF')->change();
        });
    }
};
