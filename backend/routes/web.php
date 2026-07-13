<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\SitemapController;

Route::get('/', function () {
    return view('welcome');
});

/**
 * Sitemap dinámico para Google
 */
Route::get('/sitemap.xml', [SitemapController::class, 'index']);

/**
 * Health Check para monitoreo de producción
 */
Route::get('/health', function () {
    try {
        DB::connection()->getPdo();
        return response()->json([
            'status' => 'up',
            'database' => 'connected',
            'timestamp' => now()->toIso8601String(),
            'environment' => config('app.env')
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'down',
            'error' => 'Database connection failed'
        ], 500);
    }
});
