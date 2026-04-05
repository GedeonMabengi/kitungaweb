<?php
// app/Models/Article.php

namespace App\Models;

use App\Models\Concerns\BelongsToOrganization;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Article extends Model
{
    use BelongsToOrganization, HasFactory, SoftDeletes;

    protected $fillable = [
        'organization_id',
        'category_id',
        'name',
        'slug',
        'sku',
        'barcode',
        'description',
        'price',
        'cost_price',
        'unit_type',
        'units_per_pack',
        'unit_price',
        'initial_quantity',
        'current_stock',
        'alert_threshold',
        'expiration_date',
        'image',
        'is_active',
        'allow_unit_sale',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'cost_price' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'expiration_date' => 'date',
        'is_active' => 'boolean',
        'allow_unit_sale' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($article) {
            if (empty($article->slug)) {
                $article->slug = Str::slug($article->name) . '-' . Str::random(5);
            }
            if (empty($article->sku)) {
                $article->sku = 'ART-' . strtoupper(Str::random(8));
            }
        });
    }

    // Relations
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class);
    }

    public function saleItems()
    {
        return $this->hasMany(SaleItem::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeLowStock($query)
    {
        return $query->whereColumn('current_stock', '<=', 'alert_threshold');
    }

    public function scopeExpiringSoon($query, $days = 30)
    {
        return $query->whereNotNull('expiration_date')
            ->where('expiration_date', '<=', now()->addDays($days));
    }

    public function scopeExpired($query)
    {
        return $query->whereNotNull('expiration_date')
            ->where('expiration_date', '<', now());
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
                ->orWhere('sku', 'like', "%{$search}%")
                ->orWhere('barcode', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%");
        });
    }

    // Accessors
    public function getIsLowStockAttribute()
    {
        return $this->current_stock <= $this->alert_threshold;
    }

    public function getIsExpiredAttribute()
    {
        return $this->expiration_date && $this->expiration_date < now();
    }

    public function getIsExpiringSoonAttribute()
    {
        return $this->expiration_date && 
            $this->expiration_date <= now()->addDays(30) && 
            !$this->is_expired;
    }

    public function getFormattedPriceAttribute()
    {
        return number_format($this->price, 2) . ' FC';
    }

    public function getStockStatusAttribute()
    {
        if ($this->current_stock <= 0) {
            return 'out_of_stock';
        }
        if ($this->is_low_stock) {
            return 'low_stock';
        }
        return 'in_stock';
    }

    // Methods
    public function isPack(): bool
    {
        return $this->unit_type === 'PACK';
    }

    public function isUnit(): bool
    {
        return $this->unit_type === 'UNIT';
    }

    public function getTotalUnits(): int
    {
        if ($this->isPack() && $this->units_per_pack) {
            return $this->current_stock * $this->units_per_pack;
        }
        return $this->current_stock;
    }

    public function getPriceFor(string $quantityType): float
    {
        if ($quantityType === 'UNIT' && $this->isPack()) {
            return $this->unit_price ?? ($this->price / $this->units_per_pack);
        }
        return $this->price;
    }

    public function adjustStock(int $quantity, string $quantityType = 'UNIT'): int
    {
        $adjustment = $quantity;
        
        if ($this->isPack() && $quantityType === 'UNIT' && $this->units_per_pack) {
            // Convert units to packs for storage
            $adjustment = $quantity / $this->units_per_pack;
        }
        
        $this->current_stock += $adjustment;
        $this->save();
        
        return $this->current_stock;
    }
}
