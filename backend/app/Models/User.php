<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    const ROLE_CUSTOMER = 'customer';
    const ROLE_ADMIN = 'admin';
    const ROLE_VENDOR = 'vendor';
    const ROLE_DRIVER = 'driver';
    const ROLE_STAFF = 'staff';

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'role',
        'permissions',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_active' => 'boolean',
        'permissions' => 'array',
    ];

    public function isAdmin() {
        return $this->role === self::ROLE_ADMIN;
    }

    public function hasPermission(string $permission) {
        // Los administradores tienen acceso total
        if ($this->isAdmin()) return true;

        // Si no hay permisos definidos, no tiene acceso (seguridad por defecto)
        if (!is_array($this->permissions) || count($this->permissions) === 0) {
            return false;
        }

        return in_array($permission, $this->permissions);
    }

    public function sendEmailVerificationNotification()
    {
        $this->notify(new \App\Notifications\CustomVerifyEmail);
    }

    public function orders() {
        return $this->hasMany(Order::class);
    }

    public function addresses() {
        return $this->hasMany(Address::class);
    }

    public function reviews() {
        return $this->hasMany(Review::class);
    }

    public function messages() {
        return $this->hasMany(Message::class, 'user_id');
    }
}
