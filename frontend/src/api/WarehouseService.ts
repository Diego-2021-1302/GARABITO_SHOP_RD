import axiosInstance from './axios';
import type { Warehouse } from '../types';

const WarehouseService = {
  getAll: async (params?: any) => {
    const response = await axiosInstance.get('/admin/warehouses', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await axiosInstance.get(`/admin/warehouses/${id}`);
    return response.data;
  },

  create: async (data: Partial<Warehouse>) => {
    const response = await axiosInstance.post('/admin/warehouses', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Warehouse>) => {
    const response = await axiosInstance.put(`/admin/warehouses/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await axiosInstance.delete(`/admin/warehouses/${id}`);
    return response.data;
  },
};

export default WarehouseService;
