<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

#[Fillable(['name', 'no_karyawan', 'email', 'password', 'role', 'no_hp', 'status', 'is_active', 'otp_failed_attempts'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at'         => 'datetime',
            'password'                  => 'hashed',
            'two_factor_confirmed_at'   => 'datetime',
        ];
    }

    /**
     * Semua peminjaman oleh user ini.
     */
    public function peminjaman(): HasMany
    {
        return $this->hasMany(Peminjaman::class);
    }

    
    /**
     * Riwayat aktivitas user.
     */
    public function riwayatArsip(): HasMany
    {
        return $this->hasMany(RiwayatArsip::class);
    }

    /**
     * Apakah user adalah admin.
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Apakah user adalah customer services.
     */
    public function isCustomerServices(): bool
    {
        return $this->role === 'customer_services';
    }

    /**
     * Label role yang mudah dibaca.
     */
    public function getRoleLabelAttribute(): string
    {
        return match ($this->role) {
            'admin'              => 'Admin',
            'customer_services'  => 'Customer Services',
            default              => ucfirst($this->role),
        };
    }
}
