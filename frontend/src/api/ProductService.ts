import api from './axios';

const ProductService = {
  getAll: (params?: any) =>
    api.get('/products', { params }),

  getById: (id: number) =>
    api.get(`/products/${id}`),

  getFeatured: () =>
    api.get('/products/featured'),

  create: (data: any) =>
    api.post('/products', data),

  update: (id: number, data: any) =>
    api.put(`/products/${id}`, data),

  delete: (id: number) =>
    api.delete(`/products/${id}`),

  search: (query: string) =>
    api.get('/products', { params: { search: query } }),

  getByCategory: (categoryId: number) =>
    api.get('/products', { params: { category_id: categoryId } }),
};

export default ProductService;
