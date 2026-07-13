import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import OrderService from '../api/OrderService';
import AddressService from '../api/AddressService';
import CouponService from '../api/CouponService';

export const useUserOrders = (params?: any) => {
  return useQuery({
    queryKey: ['user', 'orders', params],
    queryFn: async () => {
      const { data } = await OrderService.getAll(params);
      return data;
    },
  });
};

export const useUserAddresses = () => {
  return useQuery({
    queryKey: ['user', 'addresses'],
    queryFn: async () => {
      const response = await AddressService.getAll();
      return response.data;
    },
  });
};

export const useCreateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => AddressService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'addresses'] });
    },
  });
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: any }) => AddressService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'addresses'] });
    },
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => AddressService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'addresses'] });
    },
  });
};

export const useSetDefaultAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => AddressService.setDefault(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'addresses'] });
    },
  });
};

export const useUserStats = () => {
  return useQuery({
    queryKey: ['user', 'stats'],
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
  });
};
