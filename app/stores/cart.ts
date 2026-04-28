/**
 * Shopping cart Pinia store.
 *
 * Manages the user's shopping cart state and provides actions to add, update,
 * and remove items. The cart is synchronized with the backend API which serves
 * as the single source of truth.
 *
 * @remarks
 * - The backend (Laravel Sanctum) manages cart persistence via session cookies.
 * - Call `fetchCart()` from a client-only plugin to hydrate state on app load.
 * - All mutation actions automatically sync with the backend after each change.
 * - Do NOT use localStorage for cart items as the backend is the source of truth.
 */
import { defineStore } from 'pinia'
import type { CartState, CartItem } from '@@/types/index'
import { getCart, addToCart, updateCartQuantity, removeFromCart } from '~/api/cart'
import { initCsrfToken } from '~/api/index'

export const useCartStore = defineStore('cart', {
  state: (): CartState => ({
    items: [],
    subtotal: 0,
    total_items: 0,
    isLoading: false,
  }),

  getters: {
    /** Returns true if the cart has items. */
    hasItems: (state): boolean => state.total_items > 0,

    /** Returns the total number of items in the cart. */
    totalItems: (state): number => state.total_items,

    /** Returns the cart items array. */
    cartItems: (state): CartItem[] => state.items,

    /** Returns the subtotal. */
    cartSubtotal: (state): number => state.subtotal,

    /** Returns the grand total (same as subtotal for now). */
    cartTotal: (state): number => state.subtotal,
  },

  actions: {
    /**
     * Fetch the cart from the backend and update the local state.
     * This is the primary method to synchronize cart state with the backend.
     */
    async fetchCart(): Promise<void> {
      try {
        this.isLoading = true
        const response = await getCart()
        const cart = response.data.data

        this.items = cart.items
        this.subtotal = cart.subtotal
        this.total_items = cart.total_items
      } catch (error) {
        console.error('Failed to fetch cart:', error)
        // Keep existing state on error to avoid losing cart during network issues.
        // Only reset if this is the initial fetch (empty cart)
        if (this.items.length === 0) {
          // Initial fetch failed, ensure clean state
          this.items = []
          this.subtotal = 0
          this.total_items = 0
        }
        // Otherwise, keep the existing cart state to handle temporary network issues
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Add a product to the cart.
     * @param productId - The product ID.
     * @param quantity - Number of units to add.
     * @param wrappingOptionId - Optional gift wrapping selection.
     */
    async addItem(
      productId: number,
      quantity: number,
      wrappingOptionId?: number | null,
    ): Promise<void> {
      try {
        this.isLoading = true

        // Initialize CSRF token before state-changing request
        await initCsrfToken()

        const response = await addToCart(productId, quantity, wrappingOptionId)
        const cart = response.data.data

        this.items = cart.items
        this.subtotal = cart.subtotal
        this.total_items = cart.total_items
      } catch (error) {
        console.error('Failed to add item to cart:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Update the quantity of a cart item.
     * @param productId - The product ID in the cart.
     * @param quantity - New quantity value.
     */
    async updateQuantity(productId: number, quantity: number): Promise<void> {
      try {
        this.isLoading = true

        // Initialize CSRF token before state-changing request
        await initCsrfToken()

        const response = await updateCartQuantity(productId, quantity)
        const cart = response.data.data

        this.items = cart.items
        this.subtotal = cart.subtotal
        this.total_items = cart.total_items
      } catch (error) {
        console.error('Failed to update cart quantity:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Remove a product from the cart.
     * @param productId - The product ID to remove.
     */
    async removeItem(productId: number): Promise<void> {
      try {
        this.isLoading = true

        // Initialize CSRF token before state-changing request
        await initCsrfToken()

        const response = await removeFromCart(productId)
        const cart = response.data.data

        this.items = cart.items
        this.subtotal = cart.subtotal
        this.total_items = cart.total_items
      } catch (error) {
        console.error('Failed to remove item from cart:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /** Clear the cart state (local only, does not sync with backend). */
    clearCart(): void {
      this.items = []
      this.subtotal = 0
      this.total_items = 0
    },
  },
})
