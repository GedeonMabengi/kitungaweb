<?php
// app/Models/Sale.php

namespace App\Models;

use App\Models\Concerns\BelongsToOrganization;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Sale extends Model
{
    use BelongsToOrganization, HasFactory, SoftDeletes;

    protected $fillable = [
        'organization_id',
        'user_id',
        'cash_register_id',
        'reference',
        'subtotal',
        'discount',
        'tax',
        'total_amount',
        'payment_method',
        'payment_status',
        'amount_paid',
        'change_amount',
        'customer_name',
        'customer_phone',
        'notes',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'discount' => 'decimal:2',
        'tax' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'change_amount' => 'decimal:2',
    ];

    const STATUS_PENDING = 'PENDING';
    const STATUS_PARTIAL = 'PARTIAL';
    const STATUS_PAID = 'PAID';
    const STATUS_CANCELLED = 'CANCELLED';

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($sale) {
            if (empty($sale->reference)) {
                $sale->reference = 'VNT-' . date('Ymd') . '-' . strtoupper(Str::random(6));
            }
        });
    }

    // Relations
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function cashRegister()
    {
        return $this->belongsTo(CashRegister::class);
    }

    public function items()
    {
        return $this->hasMany(SaleItem::class);
    }

    public function cashInputs()
    {
        return $this->hasMany(CashInput::class);
    }

    // Scopes
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('payment_status', $status);
    }

    public function scopeToday($query)
    {
        return $query->whereDate('created_at', today());
    }

    public function scopeBetweenDates($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    public function scopePaid($query)
    {
        return $query->where('payment_status', self::STATUS_PAID);
    }

    // Accessors
    public function getIsPaidAttribute()
    {
        return $this->payment_status === self::STATUS_PAID;
    }

    public function getIsCancelledAttribute()
    {
        return $this->payment_status === self::STATUS_CANCELLED;
    }

    public function getItemsCountAttribute()
    {
        return $this->items->sum('quantity');
    }

    public function getStatusColorAttribute()
    {
        return match($this->payment_status) {
            self::STATUS_PAID => 'success',
            self::STATUS_PENDING => 'warning',
            self::STATUS_PARTIAL => 'info',
            self::STATUS_CANCELLED => 'danger',
            default => 'secondary',
        };
    }

    public function getStatusLabelAttribute()
    {
        return match($this->payment_status) {
            self::STATUS_PAID => 'Payé',
            self::STATUS_PENDING => 'En attente',
            self::STATUS_PARTIAL => 'Partiel',
            self::STATUS_CANCELLED => 'Annulé',
            default => $this->payment_status,
        };
    }

    // Methods
    public function calculateTotals(): void
    {
        $this->subtotal = $this->items->sum('subtotal');
        $this->total_amount = $this->subtotal - $this->discount + $this->tax;
        $this->save();
    }

    public function cancel(): void
    {
        // Restore stock for each item
        foreach ($this->items as $item) {
            $item->article->increment('current_stock', $item->getStockQuantity());
            
            StockMovement::create([
                'article_id' => $item->article_id,
                'user_id' => auth()->id(),
                'movement_type' => StockMovement::TYPE_RETURN,
                'quantity' => $item->quantity,
                'quantity_type' => $item->quantity_type,
                'stock_before' => $item->article->current_stock - $item->getStockQuantity(),
                'stock_after' => $item->article->current_stock,
                'reason' => 'Annulation vente',
                'reference' => $this->reference,
            ]);
        }

        $this->payment_status = self::STATUS_CANCELLED;
        $this->save();
    }
}
