import axiosInstance from './axios';
import type { PurchaseInvoice } from '../types';

const PurchaseInvoiceService = {
  getAll: async (params?: any) => {
    const response = await axiosInstance.get('/admin/purchase-invoices', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await axiosInstance.get(`/admin/purchase-invoices/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await axiosInstance.post('/admin/purchase-invoices', data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    // Cambiamos a PATCH para mayor compatibilidad con Laravel Resource Routes
    const response = await axiosInstance.patch(`/admin/purchase-invoices/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await axiosInstance.delete(`/admin/purchase-invoices/${id}`);
    return response.data;
  },

  updateStatus: async (id: number, status: string) => {
    const response = await axiosInstance.patch(`/admin/purchase-invoices/${id}/status`, { status });
    return response.data;
  }
};

export default PurchaseInvoiceService;
