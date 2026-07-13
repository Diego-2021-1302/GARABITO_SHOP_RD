import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { useNotificationStore } from '../store/useNotificationStore';

/**
 * HOOKS PARA CLIENTES
 */
export const useOrders = (params?: any) => {
  return useQuery({
    queryKey: ['user', 'orders', params],
    queryFn: async () => {
      const { data } = await api.get('/orders', { params });
      return data;
    },
  });
};

export const useOrderDetail = (id: string | number | undefined) => {
  return useQuery({
    queryKey: ['user', 'orders', id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await api.get(`/orders/${id}`);
      return data;
    },
    enabled: !!id,
    refetchInterval: (query) => {
      // Refrescar cada 15s si el pedido está en camino para ver GPS
      return query.state.data?.status === 'en_camino' ? 15000 : false;
    }
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string | number) => {
      const { data } = await api.put(`/orders/${id}/cancel`);
      return data;
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['user', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'orders', id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
    },
  });
};

export const useUploadPaymentProof = () => {
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore(state => state.addNotification);

  return useMutation({
    mutationFn: async ({ id, file, amount_paid, issuing_bank, transaction_reference, confirm_owner }: any) => {
      const formData = new FormData();
      formData.append('proof', file);
      formData.append('amount_paid', amount_paid);
      formData.append('issuing_bank', issuing_bank);
      formData.append('transaction_reference', transaction_reference);
      formData.append('confirm_owner', confirm_owner ? '1' : '0');

      const { data } = await api.post(`/orders/${id}/upload-proof`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user', 'orders', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      addNotification('success', 'Comprobante enviado. El administrador revisará tu pago.');
    },
    onError: (error: any) => {
      addNotification('error', error.response?.data?.message || 'Error al subir el comprobante.');
    }
  });
};

export const useMarkAsDelivered = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string | number) => {
      const { data } = await api.patch(`/orders/${id}/delivered`);
      return data;
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['user', 'orders', id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders', id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
    },
  });
};

/**
 * HOOKS PARA ADMINISTRADOR
 */
export const useAdminOrders = (params?: any) => {
  return useQuery({
    queryKey: ['admin', 'orders', params],
    queryFn: async () => {
      const { data } = await api.get('/admin/orders', { params });
      return data;
    },
  });
};

export const useAdminOrderDetail = (id: string | number | undefined) => {
  return useQuery({
    queryKey: ['admin', 'orders', id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await api.get(`/orders/${id}`);
      return data;
    },
    enabled: !!id,
    refetchInterval: (query) => {
      // Refrescar cada 15s si el pedido está en camino para ver GPS
      return query.state.data?.status === 'en_camino' ? 15000 : false;
    }
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, comment, ncf_type, driver_id, rejection_reason }: { id: string | number; status: string; comment?: string; ncf_type?: string; driver_id?: number; rejection_reason?: string }) => {
      // Si el estado es pago_confirmado, primero verificamos el pago automáticamente
      if (status === 'pago_confirmado') {
        await api.patch(`/admin/orders/${id}/verify-payment`);
      }
      const { data } = await api.patch(`/admin/orders/${id}/status`, { status, comment, ncf_type, driver_id, rejection_reason });
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['user', 'orders'] });
    },
  });
};

export const useCreateShipment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (shipmentData: any) => {
      const { data } = await api.post('/admin/shipments', shipmentData);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders', data.order_id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'shipments'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'orders', data.order_id] });
    },
  });
};
