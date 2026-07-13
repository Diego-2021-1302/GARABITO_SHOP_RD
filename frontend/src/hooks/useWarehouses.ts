import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import WarehouseService from '../api/WarehouseService';
import type { Warehouse } from '../types';

export const useWarehouses = (params?: any) => {
  return useQuery({
    queryKey: ['warehouses', params],
    queryFn: () => WarehouseService.getAll(params),
  });
};

export const useCreateWarehouse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Warehouse>) => WarehouseService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
    },
  });
};

export const useUpdateWarehouse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Warehouse> }) => WarehouseService.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      queryClient.invalidateQueries({ queryKey: ['warehouse', data.id] });
    },
  });
};

export const useDeleteWarehouse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => WarehouseService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
    },
  });
};
