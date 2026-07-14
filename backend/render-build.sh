#!/usr/bin/env bash
# Script para Render
set -e

echo "--- Installing dependencies ---"
export COMPOSER_MEMORY_LIMIT=-1
composer install --no-interaction --optimize-autoloader --no-dev --prefer-dist --no-progress

echo "--- Running migrations ---"
php artisan migrate --force

echo "--- Caching configuration ---"
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "--- Build finished ---"
