import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo_url?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useBrands = (filters?: { all?: boolean; page?: number }) => {
  return useQuery({
    queryKey: ['brands', filters],
    queryFn: async () => {
      const { data } = await api.get('/brands', { params: filters });
      return data.data || data;
    },
  });
};

export const useBrand = (id: string | number) => {
  return useQuery({
    queryKey: ['brand', id],
    queryFn: async () => {
      const { data } = await api.get(`/brands/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: FormData) => {
      const { data: response } = await api.post('/admin/brands', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
  });
};

export const useUpdateBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: FormData }) => {
      // Usamos POST con _method=PUT para compatibilidad con archivos en Laravel
      data.append('_method', 'PUT');
      const { data: response } = await api.post(`/admin/brands/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      queryClient.invalidateQueries({ queryKey: ['brand', variables.id] });
    },
  });
};

export const useDeleteBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/brands/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
  });
};
