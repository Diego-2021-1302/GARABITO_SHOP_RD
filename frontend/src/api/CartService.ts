import api from './axios';

const CartService = {
  getCart: () =>
    api.get('/cart'),

  addItem: (productId: number, quantity: number, variantId?: number) =>
    api.post('/cart/add', { product_id: productId, quantity, variant_id: variantId }),

  updateItem: (productId: number, quantity: number, variantId?: number) =>
    api.put('/cart/update', { product_id: productId, quantity, variant_id: variantId }),

  removeItem: (productId: number, variantId?: number) =>
    api.delete('/cart/remove', { data: { product_id: productId, variant_id: variantId } }),

  clearCart: () =>
    api.delete('/cart/clear'),
};

export default CartService;
