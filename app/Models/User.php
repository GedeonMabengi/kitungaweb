<?php
// app/Models/User.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles, TwoFactorAuthenticatable;

    protected $fillable = [
        'organization_id',
        'name',
        'email',
        'email_verified_at',
        'password',
        'phone',
        'avatar',
        'is_active',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_active' => 'boolean',
        'last_login_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (User $user): void {
            if ($user->organization_id) {
                return;
            }

            $organizationId = Organization::query()->value('id');

            if ($organizationId) {
                $user->organization_id = $organizationId;
            }
        });
    }

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class);
    }

    public function sales()
    {
        return $this->hasMany(Sale::class);
    }

    public function cashRegisters()
    {
        return $this->hasMany(CashRegister::class);
    }

    public function cashInputs()
    {
        return $this->hasMany(CashInput::class);
    }

    public function cashOutputs()
    {
        return $this->hasMany(CashOutput::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    public function isStockManager(): bool
    {
        return $this->hasRole('gestionnaire_stock');
    }

    public function isSeller(): bool
    {
        return $this->hasRole('vendeur');
    }

    public function isCashier(): bool
    {
        return $this->hasRole('caissier');
    }

    public function getOpenCashRegister(): ?CashRegister
    {
        return CashRegister::query()
            ->where('organization_id', $this->organization_id)
            ->where('status', CashRegister::STATUS_OPEN)
            ->whereDate('date', today())
            ->first();
    }

    public function getPreviousClosedCashRegister(): ?CashRegister
    {
        return CashRegister::query()
            ->where('organization_id', $this->organization_id)
            ->where('status', CashRegister::STATUS_CLOSED)
            ->whereNotNull('actual_balance')
            ->whereDate('date', '<', today())
            ->latest('date')
            ->latest('closed_at')
            ->first();
    }

    public function isOrganizationOwner(): bool
    {
        return (int) $this->organization?->owner_user_id === (int) $this->id;
    }
}
