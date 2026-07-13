import axiosInstance from './axios';
import type { Provider } from '../types';

const ProviderService = {
  getAll: async (params?: any) => {
    const response = await axiosInstance.get('/admin/providers', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await axiosInstance.get(`/admin/providers/${id}`);
    return response.data;
  },

  create: async (data: Partial<Provider>) => {
    const response = await axiosInstance.post('/admin/providers', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Provider>) => {
    const response = await axiosInstance.put(`/admin/providers/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await axiosInstance.delete(`/admin/providers/${id}`);
    return response.data;
  }
};

export default ProviderService;
