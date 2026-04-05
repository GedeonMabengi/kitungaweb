<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class OrganizationInvitation extends Model
{
    /** @use HasFactory<\Database\Factories\OrganizationInvitationFactory> */
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'invited_by_user_id',
        'accepted_user_id',
        'email',
        'role',
        'token',
        'status',
        'expires_at',
        'accepted_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'accepted_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (OrganizationInvitation $invitation): void {
            if (! $invitation->token) {
                $invitation->token = Str::uuid()->toString();
            }

            if (! $invitation->status) {
                $invitation->status = 'pending';
            }
        });
    }

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function invitedBy()
    {
        return $this->belongsTo(User::class, 'invited_by_user_id');
    }

    public function acceptedUser()
    {
        return $this->belongsTo(User::class, 'accepted_user_id');
    }

    public function isPending(): bool
    {
        if ($this->status !== 'pending') {
            return false;
        }

        return ! $this->expires_at || $this->expires_at->isFuture();
    }
}
