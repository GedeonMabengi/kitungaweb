<?php
// app/Models/CashOutput.php

namespace App\Models;

use App\Models\Concerns\BelongsToOrganization;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CashOutput extends Model
{
    use BelongsToOrganization, HasFactory;

    protected $fillable = [
        'organization_id',
        'cash_register_id',
        'user_id',
        'amount',
        'reason',
        'beneficiary',
        'reference',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::created(function ($output) {
            $output->cashRegister->recalculate();
        });

        static::deleted(function ($output) {
            $output->cashRegister->recalculate();
        });
    }

    // Relations
    public function cashRegister()
    {
        return $this->belongsTo(CashRegister::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
