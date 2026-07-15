import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import OrderService from '../api/OrderService';
import AddressService from '../api/AddressService';
import CouponService from '../api/CouponService';
import { useAuthStore } from '../store/useAuthStore';

export const useUserOrders = (params?: any) => {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ['user', user?.id, 'orders', params],
    queryFn: async () => {
      const { data } = await OrderService.getAll(params);
      return data;
    },
    enabled: !!user,
  });
};

export const useUserAddresses = () => {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ['user', user?.id, 'addresses'],
    queryFn: async () => {
      const response = await AddressService.getAll();
      return response.data;
    },
    enabled: !!user,
  });
};

export const useCreateAddress = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  return useMutation({
    mutationFn: (data: any) => AddressService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', user?.id, 'addresses'] });
    },
  });
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: any }) => AddressService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', user?.id, 'addresses'] });
    },
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  return useMutation({
    mutationFn: (id: number | string) => AddressService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', user?.id, 'addresses'] });
    },
  });
};

export const useSetDefaultAddress = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  return useMutation({
    mutationFn: (id: number | string) => AddressService.setDefault(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', user?.id, 'addresses'] });
    },
  });
};

export const useUserStats = () => {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ['user', user?.id, 'stats'],
    queryFn: async () => {
      const [orders, addresses] = await Promise.all([
        OrderService.getAll({ limit: 1 }),
        AddressService.getAll()
      ]);
      
      return {
        ordersCount: orders.data.total || orders.data.length || 0,
        addressesCount: addresses.data.length || 0,
        couponsCount: 0 
      };
    },
    enabled: !!user,
  });
};
