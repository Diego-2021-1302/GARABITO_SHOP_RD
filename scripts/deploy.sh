#!/bin/bash

# Garabito Shop RD - Production Deployment Script
# Uso: ./scripts/deploy.sh

echo "🚀 Iniciando despliegue de Garabito Shop RD..."

# 1. Pull de los últimos cambios
echo "📥 Trayendo cambios de Git..."
git pull origin main

# 2. Reconstruir contenedores
echo "🏗️  Reconstruyendo contenedores Docker..."
docker-compose up -d --build

# 3. Optimización de Laravel
echo "🧹 Optimizando Backend..."
docker-compose exec backend php artisan down # Entrar en modo mantenimiento
docker-compose exec backend composer install --no-interaction --optimize-autoloader --no-dev
docker-compose exec backend php artisan migrate --force
docker-compose exec backend php artisan config:cache
docker-compose exec backend php artisan route:cache
docker-compose exec backend php artisan view:cache
docker-compose exec backend php artisan storage:link
docker-compose exec backend php artisan up # Salir del modo mantenimiento

# 4. Construcción del Frontend
echo "📦 Compilando Frontend (React)..."
cd frontend
npm install
npm run build
cd ..

echo "✅ Despliegue completado con éxito!"
