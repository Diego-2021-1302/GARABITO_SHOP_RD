import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import type { Product } from '../types/product';

interface ProductFilters {
  category?: string;
  category_id?: string | number;
  search?: string;
  sort?: string;
  brand?: string | string[];
  brand_id?: string | number;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  admin?: boolean; // Permitir el flag de administrador
}

export const useProducts = (filters?: ProductFilters) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const params = { ...filters };
      if (Array.isArray(params.brand)) {
        params.brand = params.brand.join(',');
      }
      
      const { data } = await api.get('/products', { params });
      return data.data || data;
    },
  });
};

export const useProduct = (id: string | number) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await api.get(`/products/${id}`);
      return data.data || data;
    },
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newProduct: Partial<Product>) => {
      if (newProduct instanceof FormData) {
        const { data } = await api.post('/admin/products', newProduct, { headers: { 'Content-Type': undefined } });
        return data;
      }
      const { data } = await api.post('/admin/products', newProduct);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string | number; data: Partial<Product> }) => {
      if (data instanceof FormData) {
        const { data: responseData } = await api.post(`/admin/products/${id}?_method=PUT`, data, { headers: { 'Content-Type': undefined } });
        return responseData;
      }
      const { data: responseData } = await api.put(`/admin/products/${id}`, data);
      return responseData;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.id] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string | number) => {
      await api.delete(`/admin/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] }); // Invalidad categorías para actualizar conteos
    },
  });
};
