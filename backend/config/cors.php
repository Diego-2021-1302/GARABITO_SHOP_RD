<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        env('FRONTEND_URL', 'http://localhost:5173'),
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:5178',
        'http://127.0.0.1:5178',
        'http://localhost',
        'http://127.0.0.1',
    ],

    'allowed_origins_patterns' => [
        // Permitir cualquier IP de red local con el puerto de Vite
        '#^http://192\.168\.\d+\.\d+:5178$#',
        '#^http://10\.\d+\.\d+\.\d+:5178$#',
        '#^http://25\.\d+\.\d+\.\d+:5178$#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
