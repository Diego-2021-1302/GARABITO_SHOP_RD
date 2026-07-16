import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import UserLayout from './layouts/UserLayout';

// Auth
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useAuthStore } from './store/useAuthStore';
import { useCartStore } from './store/useCartStore';

// Public Pages
const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/auth/VerifyEmail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const SellerLanding = lazy(() => import('./pages/SellerLanding'));

// User Pages
const UserDashboard = lazy(() => import('./pages/user/Dashboard'));
const UserOrders = lazy(() => import('./pages/user/Orders'));
const UserOrderDetail = lazy(() => import('./pages/user/OrderDetail'));
const UserPayment = lazy(() => import('./pages/user/Payment'));
const UserWishlist = lazy(() => import('./pages/user/Wishlist'));
const UserAddresses = lazy(() => import('./pages/user/Addresses'));
const UserAddAddress = lazy(() => import('./pages/user/AddAddress'));
const UserMessaging = lazy(() => import('./pages/user/Messaging'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminProducts = lazy(() => import('./pages/admin/Products'));
const AdminProductForm = lazy(() => import('./pages/admin/ProductForm'));
const AdminInventory = lazy(() => import('./pages/admin/Inventory'));
const AdminOrders = lazy(() => import('./pages/admin/Orders'));
const AdminOrderDetail = lazy(() => import('./pages/admin/OrderDetail'));
const AdminInvoices = lazy(() => import('./pages/admin/Invoices'));
const AdminCustomers = lazy(() => import('./pages/admin/Customers'));
const AdminCustomerDetail = lazy(() => import('./pages/admin/CustomerDetail'));
const AdminCategories = lazy(() => import('./pages/admin/Categories'));
const AdminCategoryProducts = lazy(() => import('./pages/admin/CategoryProducts'));
const AdminBrands = lazy(() => import('./pages/admin/Brands'));
const AdminBrandProducts = lazy(() => import('./pages/admin/BrandProducts'));
const AdminShipments = lazy(() => import('./pages/admin/Shipments'));
const AdminReports = lazy(() => import('./pages/admin/Reports'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminMessaging = lazy(() => import('./pages/admin/Messaging'));

// New Admin Pages
const AdminProviders = lazy(() => import('./pages/admin/Providers'));
const AdminPurchaseInvoices = lazy(() => import('./pages/admin/PurchaseInvoices'));
const AdminPurchaseInvoiceForm = lazy(() => import('./pages/admin/PurchaseInvoiceForm'));
const AdminPurchaseInvoiceDetail = lazy(() => import('./pages/admin/PurchaseInvoiceDetail'));
const AdminPayments = lazy(() => import('./pages/admin/Payments'));
const AdminWarehouses = lazy(() => import('./pages/admin/Warehouses'));
const AdminInventoryDocuments = lazy(() => import('./pages/admin/InventoryDocuments'));
const AdminInventoryDocumentDetail = lazy(() => import('./pages/admin/InventoryDocumentDetail'));
const AdminKardex = lazy(() => import('./pages/admin/Kardex'));

// Components
import Toast from './components/common/Toast';
import Analytics from './components/common/Analytics';

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Auth Routes redirected to Home (where the unified card is) */}
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/registro" element={<Navigate to="/" replace />} />
        
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/password-reset/:token" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Public Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="catalogo" element={<Shop />} />
          <Route path="producto/:id" element={<ProductDetails />} />
          <Route path="carrito" element={<Cart />} />
          <Route path="checkout" element={
            <ProtectedRoute allowedRoles={['admin', 'customer']}>
              <Checkout />
            </ProtectedRoute>
          } />
          <Route path="vender" element={<SellerLanding />} />
        </Route>

        {/* User Account Routes */}
        <Route path="/cuenta" element={
          <ProtectedRoute allowedRoles={['admin', 'customer']}>
            <UserLayout />
          </ProtectedRoute>
        }>
          <Route index element={<UserDashboard />} />
          <Route path="pedidos" element={<UserOrders />} />
          <Route path="pedidos/:id" element={<UserOrderDetail />} />
          <Route path="pedidos/:id/pagar" element={<UserPayment />} />
          <Route path="favoritos" element={<UserWishlist />} />
          <Route path="direcciones" element={<UserAddresses />} />
          <Route path="direcciones/nueva" element={<UserAddAddress />} />
          <Route path="chat" element={<UserMessaging />} />
        </Route>

        {/* Admin Panel Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin', 'driver', 'vendor']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="mensajeria" element={<AdminMessaging />} />
          <Route path="productos" element={<AdminProducts />} />
          <Route path="productos/nuevo" element={<AdminProductForm />} />
          <Route path="productos/editar/:id" element={<AdminProductForm />} />
          <Route path="inventario" element={<AdminInventory />} />
          <Route path="almacenes" element={<AdminWarehouses />} />
          <Route path="inventario/documentos" element={<AdminInventoryDocuments />} />
          <Route path="inventario/documentos/:id" element={<AdminInventoryDocumentDetail />} />
          <Route path="inventario/kardex" element={<AdminKardex />} />
          
          <Route path="proveedores" element={<AdminProviders />} />
          <Route path="compras" element={<AdminPurchaseInvoices />} />
          <Route path="compras/nueva" element={<AdminPurchaseInvoiceForm />} />
          <Route path="compras/editar/:id" element={<AdminPurchaseInvoiceForm />} />
          <Route path="compras/:id" element={<AdminPurchaseInvoiceDetail />} />
          <Route path="pagos" element={<AdminPayments />} />

          <Route path="pedidos" element={<AdminOrders />} />
          <Route path="pedidos/:id" element={<AdminOrderDetail />} />
          <Route path="facturacion" element={<AdminInvoices />} />
          <Route path="clientes" element={<AdminCustomers />} />
          <Route path="clientes/:id" element={<AdminCustomerDetail />} />
          <Route path="categorias" element={<AdminCategories />} />
          <Route path="categorias/:categoryId/productos" element={<AdminCategoryProducts />} />
          <Route path="marcas" element={<AdminBrands />} />
          <Route path="marcas/:brandId/productos" element={<AdminBrandProducts />} />
          <Route path="envios" element={<AdminShipments />} />
          <Route path="usuarios" element={<AdminUsers />} />
          <Route path="reportes" element={<AdminReports />} />
          <Route path="configuracion" element={<AdminSettings />} />
        </Route>

        {/* Default Redirection */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  const { _hasHydrated, isAuthenticated } = useAuthStore();
  const { syncWithServer } = useCartStore();

  React.useEffect(() => {
    if (_hasHydrated && isAuthenticated) {
      syncWithServer();

      // Sincronizar automáticamente cuando la ventana recupera el foco
      // Útil para concurrencia entre múltiples dispositivos
      const handleFocus = () => syncWithServer();
      window.addEventListener('focus', handleFocus);

      return () => window.removeEventListener('focus', handleFocus);
    }
  }, [_hasHydrated, isAuthenticated, syncWithServer]);

  if (!_hasHydrated) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-brand-dark">
        <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Analytics />
        <Suspense fallback={
          <div className="h-screen w-screen flex items-center justify-center bg-brand-dark">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
              <p className="font-poppins font-bold text-brand-primary animate-pulse tracking-widest text-xs uppercase">Garabito Shop</p>
            </div>
          </div>
        }>
          <AnimatedRoutes />
        </Suspense>
        <Toast />
      </Router>
    </QueryClientProvider>
  );
};

export default App;
