import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

/**
 * HOOKS PARA REPARTIDORES (DRIVER)
 */
export const useActiveShipments = () => {
  return useQuery({
    queryKey: ['driver', 'shipments', 'active'],
    queryFn: async () => {
      const { data } = await api.get('/shipments/active');
      return data;
    },
  });
};

export const useUpdateShipmentLocation = () => {
  return useMutation({
    mutationFn: async ({ id, lat, lng }: { id: string | number; lat: number; lng: number }) => {
      const { data } = await api.patch(`/shipments/${id}/location`, { lat, lng });
      return data;
    },
  });
};

/**
 * HOOKS PARA ADMINISTRADOR
 */
export const useShipments = (params?: any) => {
  return useQuery({
    queryKey: ['admin', 'shipments', params],
    queryFn: async () => {
      const { data } = await api.get('/admin/shipments', { params });
      return data;
    },
  });
};

export const useShipmentStats = () => {
  return useQuery({
    queryKey: ['admin', 'shipments', 'stats'],
    queryFn: async () => {
      const { data } = await api.get('/admin/shipments/stats');
      return data;
    },
  });
};

export const useDrivers = () => {
  return useQuery({
    queryKey: ['admin', 'drivers'],
    queryFn: async () => {
      const { data } = await api.get('/admin/shipments/drivers');
      return data;
    },
  });
};

export const useUpdateShipment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string | number; data: any }) => {
      const { data: responseData } = await api.patch(`/admin/shipments/${id}`, data);
      return responseData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'shipments'] });
    },
  });
};
