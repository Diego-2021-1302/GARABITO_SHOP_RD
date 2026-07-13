import api from './axios';

const OrderService = {
  getAll: (params?: any) =>
    api.get('/orders', { params }),

  getById: (id: number) =>
    api.get(`/orders/${id}`),

  create: (data: any) =>
    api.post('/orders', data),

  updateStatus: (id: number, status: string) =>
    api.put(`/orders/${id}/status`, { status }),

  cancel: (id: number) =>
    api.put(`/orders/${id}/cancel`, {}),

  uploadPaymentProof: (id: string | number, file: File) => {
    const formData = new FormData();
    formData.append('proof', file);
    return api.post(`/orders/${id}/upload-proof`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
};

export default OrderService;
