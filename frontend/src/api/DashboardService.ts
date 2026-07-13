import api from './axios';

const DashboardService = {
  getStats: () =>
    api.get('/admin/dashboard/stats'),

  getRevenueChart: (period: 'day' | 'month' | 'year' = 'month') =>
    api.get('/admin/dashboard/revenue', { params: { period } }),

  getTopProducts: (limit: number = 10) =>
    api.get('/admin/dashboard/top-products', { params: { limit } }),

  getLowStockProducts: (threshold: number = 10) =>
    api.get('/admin/dashboard/low-stock', { params: { threshold } }),

  getTopCustomers: (limit: number = 10) =>
    api.get('/admin/dashboard/top-customers', { params: { limit } }),

  getOrderStatusBreakdown: () =>
    api.get('/admin/dashboard/order-status'),

  getPaymentMethodBreakdown: () =>
    api.get('/admin/dashboard/payment-methods'),
};

export default DashboardService;
