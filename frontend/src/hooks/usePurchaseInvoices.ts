import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PurchaseInvoiceService from '../api/PurchaseInvoiceService';

export const usePurchaseInvoices = (params?: any) => {
  return useQuery({
    queryKey: ['purchase-invoices', params],
    queryFn: () => PurchaseInvoiceService.getAll(params),
  });
};

export const usePurchaseInvoice = (id: number) => {
  return useQuery({
    queryKey: ['purchase-invoice', id],
    queryFn: () => PurchaseInvoiceService.getById(id),
    enabled: !!id,
  });
};

export const useCreatePurchaseInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => PurchaseInvoiceService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUpdatePurchaseInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      PurchaseInvoiceService.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-invoice', data.id] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useDeletePurchaseInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => PurchaseInvoiceService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUpdatePurchaseInvoiceStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      PurchaseInvoiceService.updateStatus(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-invoice', data.id] });
    },
  });
};
