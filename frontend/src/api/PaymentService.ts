import api from './axios';

const PaymentService = {
  getMethods: () =>
    api.get('/payments/methods'),

  processPayment: (orderId: number, data: any) =>
    api.post(`/payments/${orderId}/process`, data),

  verifyPayment: (orderId: number) =>
    api.post(`/payments/${orderId}/verify`, {}),

  refundPayment: (orderId: number, amount: number) =>
    api.post(`/payments/${orderId}/refund`, { amount }),

  getHistory: (params?: any) =>
    api.get('/payments/history', { params }),
};

export default PaymentService;
