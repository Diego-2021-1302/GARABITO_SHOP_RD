import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import InventoryService from '../api/InventoryService';

export const useInventoryMovements = (params?: any) => {
  return useQuery({
    queryKey: ['admin', 'inventory-movements', params],
    queryFn: async () => {
      const { data } = await InventoryService.getAll(params);
      return data;
    },
  });
};

export const useInventoryStats = () => {
  return useQuery({
    queryKey: ['admin', 'inventory-stats'],
    queryFn: async () => {
      const { data } = await InventoryService.getStats();
      return data;
    },
  });
};

export const useCreateInventoryMovement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { product_id: number | string; quantity: number; type: 'entry' | 'exit' | 'adjustment'; reason?: string }) => 
      InventoryService.createMovement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'inventory-movements'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'inventory-stats'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};
