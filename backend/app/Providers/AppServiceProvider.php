<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use App\Models\User;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Define Admin Access Gate
        Gate::define('admin-access', function (User $user) {
            return in_array($user->role, [User::ROLE_ADMIN, User::ROLE_DRIVER, User::ROLE_VENDOR]);
        });

        // Dynamic Permission Gates
        $permissions = ['dashboard', 'products', 'orders', 'customers', 'shipments', 'invoices', 'inventory', 'messaging', 'settings'];
        foreach ($permissions as $permission) {
            Gate::define($permission, function (User $user) use ($permission) {
                return $user->hasPermission($permission);
            });
        }

        // Dashboard specific gate used in Controller
        Gate::define('viewDashboard', function (User $user) {
            return $user->hasPermission('dashboard');
        });

        // Rate Limiters
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(5)->by($request->email ?: $request->ip());
        });
    }
}
