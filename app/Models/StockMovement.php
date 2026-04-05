<?php
// app/Models/StockMovement.php

namespace App\Models;

use App\Models\Concerns\BelongsToOrganization;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockMovement extends Model
{
    use BelongsToOrganization, HasFactory;

    protected $fillable = [
        'organization_id',
        'article_id',
        'user_id',
        'movement_type',
        'quantity',
        'quantity_type',
        'stock_before',
        'stock_after',
        'reason',
        'reference',
        'notes',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'stock_before' => 'integer',
        'stock_after' => 'integer',
    ];

    const TYPE_IN = 'IN';
    const TYPE_OUT = 'OUT';
    const TYPE_ADJUSTMENT = 'ADJUSTMENT';
    const TYPE_SALE = 'SALE';
    const TYPE_RETURN = 'RETURN';

    // Relations
    public function article()
    {
        return $this->belongsTo(Article::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeOfType($query, $type)
    {
        return $query->where('movement_type', $type);
    }

    public function scopeForArticle($query, $articleId)
    {
        return $query->where('article_id', $articleId);
    }

    public function scopeBetweenDates($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    // Accessors
    public function getIsEntryAttribute()
    {
        return in_array($this->movement_type, [self::TYPE_IN, self::TYPE_RETURN]);
    }

    public function getIsExitAttribute()
    {
        return in_array($this->movement_type, [self::TYPE_OUT, self::TYPE_SALE]);
    }

    public function getTypeColorAttribute()
    {
        return match($this->movement_type) {
            self::TYPE_IN => 'success',
            self::TYPE_OUT => 'danger',
            self::TYPE_SALE => 'info',
            self::TYPE_RETURN => 'warning',
            self::TYPE_ADJUSTMENT => 'secondary',
            default => 'secondary',
        };
    }

    public function getTypeLabelAttribute()
    {
        return match($this->movement_type) {
            self::TYPE_IN => 'Entrée',
            self::TYPE_OUT => 'Sortie',
            self::TYPE_SALE => 'Vente',
            self::TYPE_RETURN => 'Retour',
            self::TYPE_ADJUSTMENT => 'Ajustement',
            default => $this->movement_type,
        };
    }
}
