<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('organization_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->string('plan_code');
            $table->string('plan_name');
            $table->string('billing_cycle')->default('monthly');
            $table->decimal('amount', 12, 2);
            $table->string('currency', 10)->default('USD');
            $table->unsignedInteger('seats_limit')->nullable();
            $table->json('features')->nullable();
            $table->string('provider')->default('cinetpay');
            $table->string('provider_reference')->nullable();
            $table->string('status')->default('pending');
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->timestamp('trial_ends_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('organization_subscriptions');
    }
};
