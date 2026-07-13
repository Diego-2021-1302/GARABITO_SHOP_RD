# Garabito Shop RD - E-commerce Dominicano

Una plataforma de e-commerce profesional diseñada específicamente para la República Dominicana.

## 📋 Requisitos

### Backend
- PHP >= 8.2
- Composer
- MySQL/PostgreSQL
- Laravel 11

### Frontend
- Node.js >= 18
- npm o yarn
- React 18+
- TypeScript

## 🚀 Instalación

### Backend

```bash
cd backend

# Instalar dependencias
composer install

# Configurar ambiente
cp .env.example .env

# Generar APP_KEY
php artisan key:generate

# Configurar base de datos en .env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=garabito_shop
DB_USERNAME=root
DB_PASSWORD=

# Ejecutar migraciones
php artisan migrate

# Iniciar servidor
php artisan serve
# El servidor estará en http://localhost:8000
```

### Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local

# Iniciar servidor de desarrollo
npm run dev
# La app estará en http://localhost:5173
```

## 📝 Primeros Pasos

### 1. Crear Admin

```bash
cd backend
php artisan tinker

# En la consola de tinker:
App\Models\User::create([
    'name' => 'Admin',
    'email' => 'admin@example.com',
    'phone' => '+1-809-123-4567',
    'password' => Hash::make('password'),
    'role' => 'admin',
    'is_active' => true,
]);
```

### 2. Registrar Usuario

Usar la API:
```bash
POST http://localhost:8000/api/register
Content-Type: application/json

{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "phone": "+1-809-123-4567",
  "password": "password123",
  "password_confirmation": "password123"
}
```

### 3. Login

```bash
POST http://localhost:8000/api/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password"
}
```

## 🏗️ Estructura del Proyecto

```
Garabito_Shop_RD/
├── backend/
│   ├── app/
│   │   ├── Models/
│   │   │   ├── User.php
│   │   │   ├── Product.php
│   │   │   ├── Category.php
│   │   │   ├── Order.php
│   │   │   └── ...
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── AuthController.php
│   │   │   │   ├── ProductController.php
│   │   │   │   └── ...
│   │   │   └── Middleware/
│   │   │       └── CheckAdmin.php
│   ├── database/
│   │   ├── migrations/
│   │   ├── factories/
│   │   └── seeders/
│   ├── routes/
│   │   └── api.php
│   └── ...
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── AuthService.ts
│   │   │   ├── ProductService.ts
│   │   │   └── ...
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── pages/
│   │   ├── components/
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── ...
└── ARCHITECTURE.md
```

## 📚 Documentación

- [Arquitectura del Proyecto](./ARCHITECTURE.md)
- [API Endpoints](./ARCHITECTURE.md#endpoints-api)
- [Base de Datos](./ARCHITECTURE.md#base-de-datos)

## 🔐 Autenticación

El proyecto usa **Laravel Sanctum** para autenticación API.

### Flow de Autenticación

1. Usuario se registra o inicia sesión
2. Recibe un token
3. Incluye token en header: `Authorization: Bearer {token}`
4. API valida token y procesa request

### Roles

- `customer` - Cliente regular
- `admin` - Administrador del sistema
- `vendor` - Vendedor (futuro)

## 💳 Métodos de Pago

Implementación prevista para:
1. Azul Popular
2. Cardnet
3. Visanet
4. Transferencia Bancaria
5. Contra Entrega (COD)

> Nota: la lógica de checkout actual crea órdenes con `payment_method` y `ncf_type`, pero la pasarela de pago completa todavía requiere integrar los flujos de verificación y reembolso.

## 📍 Características Dominicanas

### Direcciones
- Provincia
- Municipio
- Sector/Ensanche
- Referencia

### Impuestos
- ITBIS: 18%
- Cálculo automático en órdenes

### Facturas (NCF)
- Número de Comprobante Fiscal
- Integración DGII (en desarrollo)

## 🗄️ Base de Datos

### Tabla Principal - Users
```sql
- id: ID único
- name: Nombre completo
- email: Email único
- phone: Teléfono
- role: Rol (customer, admin)
- is_active: Estado activo
- password: Contraseña hasheada
- timestamps: Fechas de creación/actualización
```

### Relaciones Principales

```
Users
├── Orders (1-N)
├── Addresses (1-N)
├── Reviews (1-N)
├── Wishlist (1-1)
└── CouponUsages (1-N)

Products
├── Category (N-1)
├── ProductImages (1-N)
├── ProductVariants (1-N)
├── Reviews (1-N)
├── OrderItems (1-N)
└── Wishlists (N-N)

Orders
├── OrderItems (1-N)
├── Shipment (1-1)
├── PaymentTransaction (1-1)
├── NCFRecord (1-1)
└── ShippingAddress (N-1)
```

## ⚡ Características Principales

✅ Autenticación y autorización  
✅ Gestión de productos y categorías  
✅ Carrito de compras  
✅ Sistema de órdenes  
✅ Reseñas de productos  
✅ Wishlist  
✅ Cupones de descuento  
✅ Direcciones con ubicación RD  
✅ Dashboard administrativo  
✅ Cálculo automático de ITBIS  

## 🔄 Fases de Desarrollo

- [x] Fase 1: Modelos y migraciones
- [x] Fase 2: Controladores y rutas
- [x] Fase 3: Servicios API frontend
- [ ] Fase 4: Componentes React
- [ ] Fase 5: Integración de pagos
- [ ] Fase 6: Reportes y análisis (dashboard básico implementado)

## ✅ Estado actual del ERP de Inventario

- [x] Auditoría de flujos de inventario backend
- [x] Refactor de `OrderController` para flujo de ventas basado en documentos
- [x] Registro de documento de venta (`sales_order`) y reversión (`customer_return`)
- [x] Registro de documento de compra (`purchase_invoice`) y reversión (`supplier_return`)
- [x] Endpoint kardex de movimientos de inventario (`admin/inventory-movements/kardex`)
- [x] Campos ERP para proveedores (`payment_terms_days`, `payment_conditions`, `credit_limit`, `outstanding_balance`, `status`)
- [x] Exposición de campos ERP de inventario de producto en API
- [ ] UI frontend ERP para inventario y ajustes administrativos
- [ ] Integración completa de pagos y conciliación financiera
- [ ] Reportes ERP avanzados y análisis de costos

## 📞 Soporte

Para problemas o consultas sobre la implementación, revisa:
1. La documentación en [ARCHITECTURE.md](./ARCHITECTURE.md)
2. Los comentarios en el código
3. La estructura de tipos en [types/index.ts](./frontend/src/types/index.ts)

## 📄 Licencia

Este proyecto es propiedad de Garabito Shop RD.

---

**Última actualización:** Junio 2026  
**Versión:** 1.0.0

## 🛠️ Producción y Mantenimiento

Para lanzar el proyecto a producción y realizar ajustes de mantenimiento, utiliza los scripts automatizados en la carpeta `/scripts`.

### Despliegue en Producción
Asegúrate de configurar tu archivo `.env` en el servidor basándote en `.env.example`.

```bash
# Ejecutar el script de despliegue (reconstruye contenedores, migra y optimiza)
./scripts/deploy.sh
```

### Comandos de Mantenimiento

```bash
# Entrar en modo mantenimiento (web bloqueada para clientes)
./scripts/maintenance.sh down

# Salir del modo mantenimiento
./scripts/maintenance.sh up

# Limpiar cache de Laravel (útil si haces cambios en configuración)
./scripts/maintenance.sh clean

# Ver logs en tiempo real para detectar errores
./scripts/maintenance.sh logs
```

### Configuración de Servidor (Nginx)
El proyecto incluye un archivo de configuración para Nginx en `nginx/conf.d/production.conf`. Ajusta los nombres de dominio antes de usarlo.
