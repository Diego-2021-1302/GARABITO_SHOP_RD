import api from './axios';

const CategoryService = {
  getAll: () =>
    api.get('/categories'),

  getById: (id: number) =>
    api.get(`/categories/${id}`),

  create: (data: any) =>
    api.post('/categories', data),

  update: (id: number, data: any) =>
    api.put(`/categories/${id}`, data),

  delete: (id: number) =>
    api.delete(`/categories/${id}`),
};

export default CategoryService;
