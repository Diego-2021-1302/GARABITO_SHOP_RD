#!/usr/bin/env bash
# Script para Render
composer install --no-interaction --optimize-autoloader --no-dev
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
