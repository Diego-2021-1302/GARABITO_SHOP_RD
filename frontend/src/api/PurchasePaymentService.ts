import axiosInstance from './axios';
import type { PurchasePayment } from '../types';

const PurchasePaymentService = {
  getAll: async (params?: any) => {
    const response = await axiosInstance.get('/admin/purchase-payments', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await axiosInstance.get(`/admin/purchase-payments/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await axiosInstance.post('/admin/purchase-payments', data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await axiosInstance.delete(`/admin/purchase-payments/${id}`);
    return response.data;
  }
};

export default PurchasePaymentService;
