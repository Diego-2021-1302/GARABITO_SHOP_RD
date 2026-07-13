import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PurchasePaymentService from '../api/PurchasePaymentService';

export const usePurchasePayments = (params?: any) => {
  return useQuery({
    queryKey: ['purchase-payments', params],
    queryFn: () => PurchasePaymentService.getAll(params),
  });
};

export const useCreatePurchasePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => PurchasePaymentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-payments'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-invoices'] });
    },
  });
};

export const useDeletePurchasePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => PurchasePaymentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-payments'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-invoices'] });
    },
  });
};
