FROM php:8.3-apache

# 1. Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libpq-dev \
    libzip-dev

# 2. Limpiar cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# 3. Instalar extensiones de PHP
RUN docker-php-ext-install pdo_pgsql mbstring exif pcntl bcmath gd zip

# 4. Habilitar mod_rewrite de Apache (Vital para Laravel)
RUN a2enmod rewrite

# 5. Configurar el DocumentRoot de Apache a la carpeta /public de Laravel
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# 6. Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 7. Configurar directorio de trabajo
WORKDIR /var/www/html

# 8. Copiar archivos del proyecto
COPY . .

# 9. Instalar dependencias de PHP
RUN composer install --no-interaction --optimize-autoloader --no-dev

# 10. Permisos correctos para Laravel
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# 11. Script de inicio para ejecutar migraciones en cada despliegue
RUN chmod +x render-build.sh

# Render usa la variable $PORT automáticamente
EXPOSE 80
