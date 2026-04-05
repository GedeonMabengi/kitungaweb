<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Organization extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'owner_user_id',
        'billing_email',
        'phone',
        'country_code',
        'currency',
        'base_currency',
        'status',
        'trial_ends_at',
    ];

    protected $casts = [
        'trial_ends_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (Organization $organization): void {
            if (empty($organization->slug)) {
                $organization->slug = Str::slug($organization->name) . '-' . Str::lower(Str::random(5));
            }

            if (empty($organization->base_currency)) {
                $organization->base_currency = $organization->currency ?: config('currencies.default', 'CDF');
            }

            if (empty($organization->currency)) {
                $organization->currency = $organization->base_currency;
            }
        });
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_user_id');
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function invitations()
    {
        return $this->hasMany(OrganizationInvitation::class);
    }

    public function subscriptions()
    {
        return $this->hasMany(OrganizationSubscription::class);
    }

    public function payments()
    {
        return $this->hasMany(SubscriptionPayment::class);
    }

    public function currentSubscription()
    {
        return $this->hasOne(OrganizationSubscription::class)
            ->whereIn('status', ['trialing', 'active', 'pending'])
            ->latestOfMany();
    }

    public function pendingInvitationsCount(): int
    {
        return $this->invitations()
            ->where('status', 'pending')
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->count();
    }

    public function hasActiveSubscription(): bool
    {
        $subscription = $this->currentSubscription;

        if (! $subscription) {
            return false;
        }

        return in_array($subscription->status, ['trialing', 'active'], true)
            && (! $subscription->ends_at || $subscription->ends_at->isFuture());
    }
}
