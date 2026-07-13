import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  created_at: string;
  orders_count?: number;
  total_spent?: number;
  orders?: any[];
}

export const useCustomers = (params?: any) => {
  return useQuery({
    queryKey: ['admin', 'customers', params],
    queryFn: async () => {
      const { data } = await api.get('/admin/customers', { params });
      return data;
    },
  });
};

export const useCustomerDetail = (id: string | number | undefined) => {
  return useQuery({
    queryKey: ['admin', 'customers', id],
    queryFn: async () => {
      if (!id) return null;
      // Asumiendo que el endpoint existe o se filtra por user_id en orders
      const customerRes = await api.get(`/admin/customers/${id}`);
      const ordersRes = await api.get(`/admin/orders`, { params: { user_id: id } });
      return {
        ...customerRes.data,
        orders: ordersRes.data.data
      };
    },
    enabled: !!id,
  });
};
