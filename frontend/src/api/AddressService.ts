import api from './axios';

const AddressService = {
  getAll: () =>
    api.get('/addresses'),

  create: (data: any) =>
    api.post('/addresses', data),

  update: (id: number | string, data: any) =>
    api.put(`/addresses/${id}`, data),

  delete: (id: number | string) =>
    api.delete(`/addresses/${id}`),

  setDefault: (id: number | string) =>
    api.patch(`/addresses/${id}/set-default`),
};

export default AddressService;
