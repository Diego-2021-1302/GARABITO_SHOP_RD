import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import type { StoreSettings } from '../types/settings';

export const useSettings = () => {
  return useQuery<StoreSettings>({
    queryKey: ['settings'],
    queryFn: async () => {
      // Usamos la ruta pública para que el logo cargue siempre
      const { data } = await api.get('/settings');
      return data.data || data;
    },
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newSettings: FormData | Partial<StoreSettings>) => {
      const isFormData = newSettings instanceof FormData;
      // El guardado sí debe ser protegido
      const { data } = await api.post('/admin/settings', newSettings, {
        headers: {
          'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
        },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
};
