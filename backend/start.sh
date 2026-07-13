#!/usr/bin/env bash

echo "🔧 Configurando entorno de producción..."

# 1. Asegurar permisos de escritura
chmod -R 777 storage bootstrap/cache

# 2. Ejecutar migraciones automáticamente
echo "📂 Ejecutando migraciones..."
php artisan migrate --force

# 3. Limpiar y generar cache de configuración
echo "🧹 Optimizando cache..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 4. Crear enlace simbólico de storage si no existe
php artisan storage:link

# 5. Iniciar Servidor
echo "🚀 Servidor Garabito Shop RD iniciado correctamente."
exec apache2-foreground
