import api from './axios';

const WishlistService = {
  get: () =>
    api.get('/wishlist'),

  addProduct: (productId: number) =>
    api.post(`/wishlist/add/${productId}`, {}),

  removeProduct: (productId: number) =>
    api.delete(`/wishlist/remove/${productId}`),

  isInWishlist: (productId: number) =>
    api.get(`/wishlist/check/${productId}`),
};

export default WishlistService;
