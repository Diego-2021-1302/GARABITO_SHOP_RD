import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  products_count?: number;
  is_active?: boolean;
}

export const useCategories = (options?: { all?: boolean }) => {
  return useQuery<Category[]>({
    queryKey: ['categories', options],
    queryFn: async () => {
      try {
        const { data } = await api.get('/categories', {
          params: { all: options?.all }
        });
        return data.data || data || [];
      } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
      }
    },
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newCategory: any) => {
      const { data } = await api.post('/admin/categories', newCategory);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number | string; data: any }) => {
      const { data: responseData } = await api.put(`/admin/categories/${id}`, data);
      return responseData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number | string) => {
      await api.delete(`/admin/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};
