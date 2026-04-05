<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubscriptionPayment extends Model
{
    /** @use HasFactory<\Database\Factories\SubscriptionPaymentFactory> */
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'organization_subscription_id',
        'transaction_id',
        'provider_transaction_id',
        'provider_payment_url',
        'amount',
        'currency',
        'customer_name',
        'customer_email',
        'status',
        'raw_payload',
        'verified_payload',
        'paid_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'raw_payload' => 'array',
        'verified_payload' => 'array',
        'paid_at' => 'datetime',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function subscription()
    {
        return $this->belongsTo(
            OrganizationSubscription::class,
            'organization_subscription_id',
        );
    }
}
