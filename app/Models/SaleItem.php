<?php
// app/Models/SaleItem.php

namespace App\Models;

use App\Models\Concerns\BelongsToOrganization;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SaleItem extends Model
{
    use BelongsToOrganization, HasFactory;

    protected $fillable = [
        'organization_id',
        'sale_id',
        'article_id',
        'quantity',
        'quantity_type',
        'unit_price',
        'discount',
        'subtotal',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'unit_price' => 'decimal:2',
        'discount' => 'decimal:2',
        'subtotal' => 'decimal:2',
    ];

    // Relations
    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }

    public function article()
    {
        return $this->belongsTo(Article::class);
    }

    // Methods
    public function calculateSubtotal(): float
    {
        $this->subtotal = ($this->quantity * $this->unit_price) - $this->discount;
        return $this->subtotal;
    }

    public function getStockQuantity(): int
    {
        // If article is sold as pack but sale is in units
        if ($this->article->isPack() && $this->quantity_type === 'UNIT') {
            return $this->quantity / $this->article->units_per_pack;
        }
        return $this->quantity;
    }
}
