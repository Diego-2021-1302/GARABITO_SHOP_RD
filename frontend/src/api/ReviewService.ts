import api from './axios';

const ReviewService = {
  getByProduct: (productId: number, params?: any) =>
    api.get(`/products/${productId}/reviews`, { params }),

  getMyReviews: (params?: any) =>
    api.get('/reviews/my', { params }),

  create: (data: any) =>
    api.post('/reviews', data),

  update: (id: number, data: any) =>
    api.put(`/reviews/${id}`, data),

  delete: (id: number) =>
    api.delete(`/reviews/${id}`),

  markHelpful: (id: number, helpful: boolean) =>
    api.post(`/reviews/${id}/helpful`, { helpful }),
};

export default ReviewService;
