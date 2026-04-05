<?php
// database/migrations/2024_01_01_000003_create_articles_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('articles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('sku')->unique()->nullable(); // Stock Keeping Unit
            $table->string('barcode')->unique()->nullable();
            $table->text('description')->nullable();
            $table->decimal('price', 15, 2); // Prix unitaire ou par paquet selon unit_type
            $table->decimal('cost_price', 15, 2)->nullable(); // Prix d'achat
            $table->enum('unit_type', ['PACK', 'UNIT'])->default('UNIT');
            $table->integer('units_per_pack')->nullable(); // Nombre d'unités par paquet
            $table->decimal('unit_price', 15, 2)->nullable(); // Prix par unité si vendu en pack
            $table->integer('initial_quantity')->default(0);
            $table->integer('current_stock')->default(0);
            $table->integer('alert_threshold')->default(10); // Seuil d'alerte stock bas
            $table->date('expiration_date')->nullable();
            $table->string('image')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('allow_unit_sale')->default(true); // Permettre vente à l'unité si pack
            $table->timestamps();
            $table->softDeletes();

            $table->index(['name', 'sku', 'barcode']);
            $table->index('current_stock');
            $table->index('expiration_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('articles');
    }
};