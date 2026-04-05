<?php

namespace App\Models\Concerns;

use App\Models\Organization;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;

trait BelongsToOrganization
{
    protected static function bootBelongsToOrganization(): void
    {
        static::creating(function ($model): void {
            if (! empty($model->organization_id)) {
                return;
            }

            $organizationId = Auth::user()?->organization_id
                ?? Organization::query()->value('id');

            if ($organizationId) {
                $model->organization_id = $organizationId;
            }
        });

        static::addGlobalScope('organization', function (Builder $builder): void {
            $organizationId = Auth::user()?->organization_id;

            if (! $organizationId) {
                return;
            }

            $builder->where(
                $builder->getModel()->getTable() . '.organization_id',
                $organizationId,
            );
        });
    }

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }
}
