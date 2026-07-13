#!/usr/bin/env bash

# Dar permisos de escritura agresivos para evitar el Error 500 por permisos
chmod -R 777 storage bootstrap/cache

# Si la APP_KEY no está configurada, generarla (aunque debería estar en Render)
if [ -z "$APP_KEY" ]; then
  echo "🗝️ Generando APP_KEY..."
  php artisan key:generate --show
fi

# Optimización y limpieza
echo "🧹 Limpiando cache..."
php artisan config:clear
php artisan route:clear
php artisan view:clear

echo "🚀 Iniciando Apache..."
apache2-foreground
