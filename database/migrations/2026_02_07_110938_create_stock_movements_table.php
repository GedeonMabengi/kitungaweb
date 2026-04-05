<?php
// database/migrations/2024_01_01_000004_create_stock_movements_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('article_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('movement_type', ['IN', 'OUT', 'ADJUSTMENT', 'SALE', 'RETURN']);
            $table->integer('quantity');
            $table->enum('quantity_type', ['PACK', 'UNIT'])->default('UNIT');
            $table->integer('stock_before');
            $table->integer('stock_after');
            $table->string('reason')->nullable();
            $table->string('reference')->nullable(); // Numéro de bon, facture, etc.
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['article_id', 'created_at']);
            $table->index('movement_type');
            $table->index('reference');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};