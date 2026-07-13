import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import CouponService from '../api/CouponService';

export const useCoupons = (params?: any) => {
  return useQuery({
    queryKey: ['admin', 'coupons', params],
    queryFn: async () => {
      const { data } = await CouponService.getAll(params);
      return data;
    },
  });
};

export const useCreateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (couponData: any) => {
      const { data } = await CouponService.create(couponData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
    },
  });
};

export const useUpdateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number | string; data: any }) => {
      const response = await CouponService.update(id, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
    },
  });
};

export const useDeleteCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number | string) => {
      await CouponService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
    },
  });
};
