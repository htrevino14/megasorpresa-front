import api from '~/api/index'
import type { Cart } from '@@/types/index'

/**
 * Get the current cart state.
 * Requires session_id cookie or Bearer token for authenticated users.
 */
export const getCart = () =>
  api.get<{ data: Cart }>('/cart')

/**
 * Add a product to the cart.
 * @param productId - The product ID to add.
 * @param quantity - Number of units to add.
 * @param wrappingOptionId - Optional gift wrapping selection.
 */
export const addToCart = (
  productId: number,
  quantity: number,
  wrappingOptionId?: number | null,
) =>
  api.post<{ data: Cart }>('/cart/add', {
    product_id: productId,
    quantity,
    wrapping_option_id: wrappingOptionId,
  })

/**
 * Update the quantity of a cart item.
 * @param productId - The product ID in the cart.
 * @param quantity - New quantity value.
 */
export const updateCartQuantity = (productId: number, quantity: number) =>
  api.patch<{ data: Cart }>('/cart/update-quantity', {
    product_id: productId,
    quantity,
  })

/**
 * Remove a product from the cart.
 * @param productId - The product ID to remove.
 */
export const removeFromCart = (productId: number) =>
  api.delete<{ data: Cart }>(`/cart/remove/${productId}`)
