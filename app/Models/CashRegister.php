<?php
// app/Models/CashRegister.php

namespace App\Models;

use App\Models\Concerns\BelongsToOrganization;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CashRegister extends Model
{
    use BelongsToOrganization, HasFactory;

    public const STATUS_OPEN = 'OPEN';
    public const STATUS_CLOSED = 'CLOSED';

    protected $fillable = [
        'organization_id',
        'user_id',
        'date',
        'opening_balance',
        'total_input',
        'total_output',
        'expected_balance',
        'actual_balance',
        'difference',
        'status',
        'opened_at',
        'closed_at',
        'opening_notes',
        'closing_notes',
    ];

    protected $casts = [
        'date' => 'date',
        'opening_balance' => 'decimal:2',
        'total_input' => 'decimal:2',
        'total_output' => 'decimal:2',
        'expected_balance' => 'decimal:2',
        'actual_balance' => 'decimal:2',
        'difference' => 'decimal:2',
        'opened_at' => 'datetime',
        'closed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function sales()
    {
        return $this->hasMany(Sale::class);
    }

    public function inputs()
    {
        return $this->hasMany(CashInput::class);
    }

    public function outputs()
    {
        return $this->hasMany(CashOutput::class);
    }

    public function scopeOpen($query)
    {
        return $query->where('status', self::STATUS_OPEN);
    }

    public function scopeClosed($query)
    {
        return $query->where('status', self::STATUS_CLOSED);
    }

    public function scopeToday($query)
    {
        return $query->whereDate('date', today());
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeForOrganization($query, int $organizationId)
    {
        return $query->where('organization_id', $organizationId);
    }

    public function getIsOpenAttribute()
    {
        return $this->status === self::STATUS_OPEN;
    }

    public function getCurrentBalanceAttribute()
    {
        return $this->opening_balance + $this->total_input - $this->total_output;
    }

    public function recalculate(): void
    {
        $this->total_input = $this->inputs()->sum('amount');
        $this->total_output = $this->outputs()->sum('amount');
        $this->expected_balance = $this->opening_balance + $this->total_input - $this->total_output;

        if ($this->actual_balance !== null) {
            $this->difference = $this->actual_balance - $this->expected_balance;
        }

        $this->save();
    }

    public function close(float $actualBalance, ?string $notes = null): void
    {
        $this->recalculate();

        $this->actual_balance = $actualBalance;
        $this->difference = $actualBalance - $this->expected_balance;
        $this->status = self::STATUS_CLOSED;
        $this->closed_at = now();
        $this->closing_notes = $notes;

        $this->save();
    }
}
