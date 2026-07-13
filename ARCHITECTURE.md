# Arquitectura Profesional - Garabito Shop RD

## Resumen de la Implementación

Este proyecto implementa una arquitectura profesional para una tienda e-commerce dominicana con:

### Backend (Laravel)
- ✅ Modelos completos (User, Product, Category, Order, etc.)
- ✅ Migraciones de base de datos
- ✅ Controladores RESTful
- ✅ Rutas API documentadas
- ✅ Autenticación con Sanctum
- ✅ Dashboard administrativo
- ✅ Soporte para ITBIS (18%)
- ✅ Direcciones específicas de RD (provincia, municipio, sector)
- ✅ Múltiples métodos de pago

### Frontend (React)
- ✅ Servicios API tipados
- ✅ Tipos TypeScript completos
- ✅ Estructura de páginas y componentes
- ✅ Gestión de carrito
- ✅ Sistema de direcciones RD

## Fases de Desarrollo

### Fase 1: Base ✅ (Implementada)
- [x] Login
- [x] Roles (customer, admin)
- [x] Categorías
- [x] Productos
- [x] Imágenes
- [x] Inventario

### Fase 2: Compra
- [x] Carrito
- [x] Wishlist
- [x] Checkout básico
- [x] Órdenes

### Fase 3: Pagos y Facturas
- [ ] Integración Azul
- [ ] Integración Cardnet
- [ ] Facturas (NCF) básico implementado
- [ ] Correos automáticos

### Fase 4: Reportes y Análisis
- [x] Reportes básicos
- [ ] Cupones (admin UI pendiente)
- [ ] Carritos abandonados
- [ ] Análisis de ventas

### Fase 5: Integraciones
- [ ] DGII (Dirección General de Impuestos Internos)
- [ ] NCF avanzado
- [ ] Courier
- [ ] Tracking

## Base de Datos

### Tablas Implementadas

```
users                    - Usuarios del sistema
categories              - Categorías de productos
products                - Productos
product_images          - Imágenes de productos
product_variants        - Variantes (color, talla, etc.)
wishlists              - Listas de deseos
wishlist_product       - Relación wishlist-producto
addresses              - Direcciones (RD: provincia, municipio, sector)
orders                 - Órdenes
order_items            - Items de órdenes
reviews                - Reseñas de productos
coupons                - Cupones de descuento
coupon_usages          - Uso de cupones
shipments              - Envíos
payment_transactions   - Transacciones de pago
ncf_records            - Registros de facturas (NCF)
```

## Endpoints API

### Autenticación
```
POST   /register      - Registrar usuario
POST   /login         - Iniciar sesión
POST   /logout        - Cerrar sesión
GET    /user          - Obtener usuario actual
```

### Productos
```
GET    /products           - Listar productos (con filtros)
GET    /products/featured  - Productos destacados
GET    /products/{id}      - Obtener producto
POST   /products           - Crear (admin)
PUT    /products/{id}      - Actualizar (admin)
DELETE /products/{id}      - Eliminar (admin)
```

### Categorías
```
GET    /categories         - Listar categorías
GET    /categories/{id}    - Obtener categoría
POST   /categories         - Crear (admin)
PUT    /categories/{id}    - Actualizar (admin)
DELETE /categories/{id}    - Eliminar (admin)
```

### Carrito
```
GET    /cart              - Obtener carrito
POST   /cart/add          - Agregar item
PUT    /cart/update       - Actualizar item
DELETE /cart/remove       - Eliminar item
DELETE /cart/clear        - Limpiar carrito
```

### Órdenes
```
GET    /orders            - Listar órdenes (usuario)
GET    /orders/{id}       - Obtener orden
POST   /orders            - Crear orden
PUT    /orders/{id}/cancel - Cancelar orden
PUT    /orders/{id}/status - Cambiar estado (admin)
```

### Direcciones
```
GET    /addresses         - Listar direcciones
POST   /addresses         - Crear dirección
PUT    /addresses/{id}    - Actualizar dirección
DELETE /addresses/{id}    - Eliminar dirección
```

### Wishlist
```
GET    /wishlist          - Obtener wishlist
POST   /wishlist/add/{id} - Agregar producto
DELETE /wishlist/remove/{id} - Eliminar producto
GET    /wishlist/check/{id}  - Verificar si existe
```

### Reseñas
```
GET    /products/{id}/reviews - Reseñas del producto
GET    /reviews/my            - Mis reseñas
POST   /reviews               - Crear reseña
PUT    /reviews/{id}          - Actualizar reseña
DELETE /reviews/{id}          - Eliminar reseña
POST   /reviews/{id}/helpful  - Marcar como útil
```

### Cupones
```
POST   /coupons/validate    - Validar cupón
GET    /admin/coupons       - Listar cupones (admin)
POST   /admin/coupons       - Crear cupón (admin)
PUT    /admin/coupons/{id}  - Actualizar cupón (admin)
DELETE /admin/coupons/{id}  - Eliminar cupón (admin)
```

### Dashboard
```
GET    /admin/dashboard/stats          - Estadísticas
GET    /admin/dashboard/revenue        - Gráfica de ingresos
GET    /admin/dashboard/top-products   - Top productos
GET    /admin/dashboard/low-stock      - Productos bajo stock
GET    /admin/dashboard/top-customers  - Top clientes
GET    /admin/dashboard/order-status   - Estado de órdenes
GET    /admin/dashboard/payment-methods - Métodos de pago
GET    /admin/dashboard-stats          - Resumen rápido
GET    /admin/reports/revenue          - Reporte de ingresos
GET    /admin/reports/top-products     - Productos más vendidos
```

## Configuración

### Backend
1. Copiar `.env.example` a `.env`
2. Configurar BD
3. Ejecutar migraciones: `php artisan migrate`
4. Generar key: `php artisan key:generate`
5. Ejecutar: `php artisan serve`

### Frontend
1. Instalar dependencias: `npm install`
2. Configurar URL base en `src/api/axios.ts`
3. Ejecutar: `npm run dev`

## Características Especiales para República Dominicana

### Direcciones
- Provincia
- Municipio
- Sector/Ensanche
- Referencia (descripción)

### Cálculo de ITBIS
```
Subtotal: RD$ 1,000.00
ITBIS (18%): RD$ 180.00
Total: RD$ 1,180.00
```

### Métodos de Pago (Prioridad)
1. Azul Popular
2. Cardnet
3. Visanet
4. Transferencia Bancaria
5. Contra Entrega (COD)

### Facturas (NCF)
- Tipos: Crédito, Débito, Efectivo, Venta Exenta, Exportación
- Integración DGII (pendiente)
- Formato: 01-99999999

## Próximos Pasos

1. **Completar Frontend React**
   - Páginas de productos
   - Carrito de compras
   - Checkout
   - Dashboard admin

2. **Integrar Pasarelas de Pago**
   - Azul Popular
   - Cardnet
   - Visanet

3. **Configurar Correos**
   - Confirmación de registro
   - Confirmación de orden
   - Envío de factura

4. **Integraciones Especiales**
   - DGII (impuestos)
   - NCF (facturas)
   - Courier (envíos)

## Notas de Desarrollo

- Usar `auth:sanctum` para rutas protegidas
- Verificar `role` en rutas admin
- Middleware `CheckAdmin` para verificar permisos
- ITBIS siempre 18%
- Direcciones: Provincia, Municipio, Sector, Referencia

## Soporta

Para más información sobre cada componente, consulta los comentarios en el código.
