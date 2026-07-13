import api from './axios';

const CouponService = {
  validate: (code: string, subtotal: number) =>
    api.post('/coupons/validate', { code, subtotal }),

  getAll: (params?: any) =>
    api.get('/admin/coupons', { params }),

  create: (data: any) =>
    api.post('/admin/coupons', data),

  update: (id: number | string, data: any) =>
    api.put(`/admin/coupons/${id}`, data),

  delete: (id: number | string) =>
    api.delete(`/admin/coupons/${id}`),
};

export default CouponService;
