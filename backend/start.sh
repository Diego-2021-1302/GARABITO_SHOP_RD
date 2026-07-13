#!/usr/bin/env bash

# Optimización de Laravel
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan storage:link

# Iniciar Apache en primer plano
echo "🚀 Iniciando Apache..."
apache2-foreground
