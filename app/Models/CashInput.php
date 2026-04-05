<?php
// app/Models/CashInput.php

namespace App\Models;

use App\Models\Concerns\BelongsToOrganization;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CashInput extends Model
{
    use BelongsToOrganization, HasFactory;

    protected $fillable = [
        'organization_id',
        'cash_register_id',
        'sale_id',
        'user_id',
        'amount',
        'source',
        'reference',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    const SOURCE_SALE = 'SALE';
    const SOURCE_DEPOSIT = 'DEPOSIT';
    const SOURCE_REFUND = 'REFUND';
    const SOURCE_OTHER = 'OTHER';

    protected static function boot()
    {
        parent::boot();
        
        static::created(function ($input) {
            $input->cashRegister->recalculate();
        });

        static::deleted(function ($input) {
            $input->cashRegister->recalculate();
        });
    }

    // Relations
    public function cashRegister()
    {
        return $this->belongsTo(CashRegister::class);
    }

    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Accessors
    public function getSourceLabelAttribute()
    {
        return match($this->source) {
            self::SOURCE_SALE => 'Vente',
            self::SOURCE_DEPOSIT => 'Dépôt',
            self::SOURCE_REFUND => 'Remboursement',
            self::SOURCE_OTHER => 'Autre',
            default => $this->source,
        };
    }
}
