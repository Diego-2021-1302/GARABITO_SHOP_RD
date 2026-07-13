<?php

return [
    'default' => env('PAYMENT_GATEWAY', 'azul'),

    'azul' => [
        'store_id' => env('AZUL_STORE_ID'),
        'merchant_auth_key' => env('AZUL_MERCHANT_AUTH_KEY'),
        'api_key' => env('AZUL_API_KEY'),
    ],

    'cardnet' => [
        'merchant_id' => env('CARDNET_MERCHANT_ID'),
        'merchant_password' => env('CARDNET_MERCHANT_PASSWORD'),
    ],

    'visanet' => [
        'affiliate_code' => env('VISANET_AFFILIATE_CODE'),
        'affiliate_password' => env('VISANET_AFFILIATE_PASSWORD'),
    ],
];
