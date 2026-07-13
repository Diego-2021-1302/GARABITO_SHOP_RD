<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\AddressController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\WishlistController;
use App\Http\Controllers\CouponController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\ShipmentController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\InventoryDocumentController;
use App\Http\Controllers\InventoryMovementController;
use App\Http\Controllers\ProviderController;
use App\Http\Controllers\PurchaseInvoiceController;
use App\Http\Controllers\PurchasePaymentController;
use App\Http\Controllers\WarehouseController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\CustomerController;
use App\Models\User;

// --- RUTAS PÚBLICAS (Con Rate Limiting) ---
Route::middleware('throttle:api')->group(function () {
    Route::middleware('throttle:auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
    });

    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/settings', [SettingsController::class, 'index']);

    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/brands', [ProductController::class, 'brands']);
    Route::get('/products/featured', [ProductController::class, 'featured']);
    Route::get('/products/{id}', [ProductController::class, 'show']);

    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{id}', [CategoryController::class, 'show']);

    Route::get('/brands', [BrandController::class, 'index']);
    Route::get('/brands/{id}', [BrandController::class, 'show']);

    Route::post('/coupons/validate', [CouponController::class, 'validateCoupon']);
    Route::get('/products/{productId}/reviews', [ReviewController::class, 'index']);
});

// --- RUTAS PROTEGIDAS ---
Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // --- MESSAGING ROUTES (CLIENT) ---
    Route::get('/messages', [MessageController::class, 'getUserMessages']);
    Route::post('/messages', [MessageController::class, 'sendMessageAsUser']);

    Route::get('/cart', [CartController::class, 'getCart']);
    Route::post('/cart/add', [CartController::class, 'addItem']);
    Route::put('/cart/update', [CartController::class, 'updateItem']);
    Route::delete('/cart/remove', [CartController::class, 'removeItem']);
    Route::delete('/cart/clear', [CartController::class, 'clearCart']);

    Route::get('/addresses', [AddressController::class, 'index']);
    Route::post('/addresses', [AddressController::class, 'store']);
    Route::put('/addresses/{id}', [AddressController::class, 'update']);
    Route::delete('/addresses/{id}', [AddressController::class, 'destroy']);
    Route::patch('/addresses/{id}/set-default', [AddressController::class, 'setDefault']);

    // --- ORDERS (CLIENT) ---
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::post('/orders/{id}/upload-proof', [OrderController::class, 'uploadPaymentProof']);
    Route::patch('/orders/{id}/delivered', [OrderController::class, 'markAsDelivered']);
    Route::put('/orders/{id}/cancel', [OrderController::class, 'cancel']);

    Route::get('/reviews/my', [ReviewController::class, 'userReviews']);
    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::put('/reviews/{id}', [ReviewController::class, 'update']);
    Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']);
    Route::post('/reviews/{id}/helpful', [ReviewController::class, 'helpful']);

    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist/add/{productId}', [WishlistController::class, 'addProduct']);
    Route::delete('/wishlist/remove/{productId}', [WishlistController::class, 'removeProduct']);
    Route::get('/wishlist/check/{productId}', [WishlistController::class, 'isInWishlist']);

    Route::get('/payments/methods', [PaymentController::class, 'getMethods']);
    Route::post('/payments/{orderId}/process', [PaymentController::class, 'process']);
    Route::post('/payments/{orderId}/verify', [PaymentController::class, 'verify']);
    Route::post('/payments/{orderId}/refund', [PaymentController::class, 'refund']);
    Route::get('/payments/history', [PaymentController::class, 'history']);

    // --- TRACKING (DRIVER) ---
    Route::get('/shipments/active', [ShipmentController::class, 'activeShipments']);
    Route::patch('/shipments/{id}/location', [ShipmentController::class, 'updateLocation']);

    Route::middleware('can:admin-access')->group(function () {
        // --- MESSAGING ROUTES (ADMIN) ---
        Route::get('/admin/messages/conversations', [MessageController::class, 'getAdminConversations']);
        Route::get('/admin/messages/user/{userId}', [MessageController::class, 'getAdminMessagesWithUser']);
        Route::post('/admin/messages/user/{userId}', [MessageController::class, 'sendMessageAsAdmin']);

        Route::post('/admin/settings', [SettingsController::class, 'update']);

        Route::post('/admin/products', [ProductController::class, 'store']);
        Route::put('/admin/products/{id}', [ProductController::class, 'update']);
        Route::delete('/admin/products/{id}', [ProductController::class, 'destroy']);

        Route::post('/admin/categories', [CategoryController::class, 'store']);
        Route::put('/admin/categories/{id}', [CategoryController::class, 'update']);
        Route::delete('/admin/categories/{id}', [CategoryController::class, 'destroy']);

        Route::post('/admin/brands', [BrandController::class, 'store']);
        Route::put('/admin/brands/{brand}', [BrandController::class, 'update']);
        Route::delete('/admin/brands/{brand}', [BrandController::class, 'destroy']);

        Route::get('/admin/coupons', [CouponController::class, 'index']);
        Route::post('/admin/coupons', [CouponController::class, 'store']);
        Route::put('/admin/coupons/{id}', [CouponController::class, 'update']);
        Route::delete('/admin/coupons/{id}', [CouponController::class, 'destroy']);

        Route::get('/admin/orders', [OrderController::class, 'adminIndex']);
        Route::patch('/admin/orders/{id}/status', [OrderController::class, 'updateStatus']);

        Route::get('/admin/customers', [CustomerController::class, 'index']);
        Route::get('/admin/customers/{id}', [CustomerController::class, 'show']);

        Route::get('/admin/shipments', [ShipmentController::class, 'index']);
        Route::get('/admin/shipments/stats', [ShipmentController::class, 'stats']);
        Route::get('/admin/shipments/drivers', [ShipmentController::class, 'getDrivers']);
        Route::post('/admin/shipments', [ShipmentController::class, 'store']);
        Route::patch('/admin/shipments/{id}', [ShipmentController::class, 'update']);

        Route::get('/admin/invoices', [InvoiceController::class, 'index']);
        Route::get('/admin/invoices/stats', [InvoiceController::class, 'stats']);
        Route::get('/admin/invoices/{id}/pdf', [InvoiceController::class, 'download']);
        Route::post('/admin/invoices/{id}/send-email', [InvoiceController::class, 'sendEmail']);
        Route::post('/admin/invoices/{id}/send-whatsapp', [InvoiceController::class, 'sendWhatsApp']);

        Route::get('/admin/inventory', [InventoryController::class, 'index']);
        Route::get('/admin/inventory/stats', [InventoryController::class, 'stats']);
        Route::post('/admin/inventory', [InventoryController::class, 'store']);

        Route::apiResource('admin/warehouses', WarehouseController::class);
        Route::get('admin/inventory-documents', [InventoryDocumentController::class, 'index']);
        Route::get('admin/inventory-documents/{id}', [InventoryDocumentController::class, 'show']);
        Route::get('admin/inventory-movements', [InventoryMovementController::class, 'index']);
        Route::get('admin/inventory-movements/{id}', [InventoryMovementController::class, 'show']);
        Route::get('admin/inventory-movements/kardex', [InventoryMovementController::class, 'kardex']);

        // Providers Routes
        Route::apiResource('admin/providers', ProviderController::class);

        // Purchase Invoices Routes
        Route::get('admin/purchase-invoices', [PurchaseInvoiceController::class, 'index']);
        Route::post('admin/purchase-invoices', [PurchaseInvoiceController::class, 'store']);
        Route::get('admin/purchase-invoices/{id}', [PurchaseInvoiceController::class, 'show']);
        Route::patch('admin/purchase-invoices/{id}', [PurchaseInvoiceController::class, 'update']);
        Route::patch('admin/purchase-invoices/{id}/status', [PurchaseInvoiceController::class, 'updateStatus']);
        Route::delete('admin/purchase-invoices/{id}', [PurchaseInvoiceController::class, 'destroy']);

        // Purchase Payments Routes
        Route::apiResource('admin/purchase-payments', PurchasePaymentController::class);

        Route::get('/admin/reports/revenue', [DashboardController::class, 'revenueChart']);
        Route::get('/admin/reports/top-products', [DashboardController::class, 'topProducts']);
        Route::get('/admin/dashboard-stats', [DashboardController::class, 'stats']);

        Route::prefix('admin')->group(function () {
            Route::get('/users', [\App\Http\Controllers\UserController::class, 'index']);
            Route::post('/users', [\App\Http\Controllers\UserController::class, 'store']);
            Route::put('/users/{id}', [\App\Http\Controllers\UserController::class, 'update']);
            Route::delete('/users/{id}', [\App\Http\Controllers\UserController::class, 'destroy']);
        });

        Route::prefix('admin/dashboard')->group(function () {
            Route::get('/stats', [DashboardController::class, 'stats']);
            Route::get('/revenue', [DashboardController::class, 'revenueChart']);
            Route::get('/top-products', [DashboardController::class, 'topProducts']);
            Route::get('/low-stock', [DashboardController::class, 'lowStockProducts']);
            Route::get('/top-customers', [DashboardController::class, 'topCustomers']);
            Route::get('/order-status', [DashboardController::class, 'orderStatusBreakdown']);
            Route::get('/recent-orders', [DashboardController::class, 'recentOrders']);
            Route::get('/payment-methods', [DashboardController::class, 'paymentMethodBreakdown']);
        });
    });
});
