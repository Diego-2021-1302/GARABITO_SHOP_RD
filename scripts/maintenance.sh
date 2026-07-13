#!/bin/bash

# Garabito Shop RD - Maintenance Script
# Uso: ./scripts/maintenance.sh [up|down|clean|logs]

COMMAND=$1

case $COMMAND in
  down)
    echo "🚧 Entrando en modo mantenimiento..."
    docker-compose exec backend php artisan down --secret="mantenimiento-garabito"
    echo "Web accesible solo con: /mantenimiento-garabito"
    ;;
  up)
    echo "✅ Saliendo del modo mantenimiento..."
    docker-compose exec backend php artisan up
    ;;
  clean)
    echo "🧹 Limpiando archivos temporales y cache..."
    docker-compose exec backend php artisan cache:clear
    docker-compose exec backend php artisan config:clear
    docker-compose exec backend php artisan view:clear
    docker-compose exec backend php artisan route:clear
    echo "✨ Cache limpia."
    ;;
  logs)
    echo "📋 Mostrando logs en tiempo real..."
    docker-compose logs -f backend
    ;;
  *)
    echo "Uso: ./scripts/maintenance.sh {up|down|clean|logs}"
    ;;
esac
