import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ProviderService from '../api/ProviderService';
import type { Provider } from '../types';

export const useProviders = (params?: any) => {
  return useQuery({
    queryKey: ['providers', params],
    queryFn: () => ProviderService.getAll(params),
  });
};

export const useProvider = (id: number) => {
  return useQuery({
    queryKey: ['provider', id],
    queryFn: () => ProviderService.getById(id),
    enabled: !!id,
  });
};

export const useCreateProvider = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Provider>) => ProviderService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providers'] });
    },
  });
};

export const useUpdateProvider = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Provider> }) =>
      ProviderService.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['providers'] });
      queryClient.invalidateQueries({ queryKey: ['provider', data.id] });
    },
  });
};

export const useDeleteProvider = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => ProviderService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providers'] });
    },
  });
};
