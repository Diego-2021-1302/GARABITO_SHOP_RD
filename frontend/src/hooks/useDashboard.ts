import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { useAuthStore } from '../store/useAuthStore';

export interface DashboardStats {
  revenue: {
    total: number;
    today: number;
    month: number;
  };
  orders: {
    total: number;
    today: number;
    month: number;
    by_status: Record<string, number>;
  };
  products: {
    total: number;
    low_stock: number;
  };
  customers: {
    total: number;
    new_this_month: number;
  };
}

export const useDashboardStats = () => {
  const { user } = useAuthStore();
  const hasDashboardPermission = user?.role === 'admin' || user?.permissions?.includes('dashboard');

  return useQuery<DashboardStats>({
    queryKey: ['admin', 'dashboard-stats'],
    queryFn: async () => {
      const { data } = await api.get('/admin/dashboard-stats');
      return data;
    },
    enabled: !!user && hasDashboardPermission,
  });
};

export const useRecentOrders = () => {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ['admin', 'recent-orders'],
    queryFn: async () => {
      const { data } = await api.get('/admin/dashboard/recent-orders');
      return data;
    },
    enabled: !!user && (user.role === 'admin' || user.permissions?.includes('dashboard')),
  });
};
