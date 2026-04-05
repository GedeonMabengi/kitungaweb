<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrganizationSubscription extends Model
{
    /** @use HasFactory<\Database\Factories\OrganizationSubscriptionFactory> */
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'plan_code',
        'plan_name',
        'billing_cycle',
        'amount',
        'currency',
        'seats_limit',
        'features',
        'provider',
        'provider_reference',
        'status',
        'starts_at',
        'ends_at',
        'trial_ends_at',
        'cancelled_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'features' => 'array',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'trial_ends_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function payments()
    {
        return $this->hasMany(SubscriptionPayment::class);
    }
}
