/**
 * Shopping cart Pinia store.
 *
 * Manages the user's shopping cart state and provides actions to add, update,
 * and remove items. The cart is synchronized with the backend API and persisted
 * in localStorage for continuity across page reloads.
 *
 * @remarks
 * - The cart state is persisted in localStorage under the key `cart_state`.
 * - Call `restoreCart()` from a client-only plugin to rehydrate state
 *   safely without SSR mismatches.
 * - All localStorage access is guarded by `import.meta.client` to prevent
 *   SSR errors and wrapped in try-catch to handle exceptions.
 */
import { defineStore } from 'pinia'
import type { CartState, CartItem } from '@@/types/index'
import { getCart, addToCart, updateCartQuantity, removeFromCart } from '~/api/cart'
import { initCsrfToken } from '~/api/index'

const STORAGE_KEY = 'cart_state'

function safeGetItem(key: string): string | null {
  if (!import.meta.client) return null
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSetItem(key: string, value: string): void {
  if (!import.meta.client) return
  try {
    localStorage.setItem(key, value)
  } catch {
    // Silently ignore quota or security errors
  }
}

function safeRemoveItem(key: string): void {
  if (!import.meta.client) return
  try {
    localStorage.removeItem(key)
  } catch {
    // Silently ignore security errors
  }
}

export const useCartStore = defineStore('cart', {
  state: (): CartState => ({
    items: [],
    subtotal: 0,
    total_items: 0,
    isLoading: false,
    isInitialized: false,
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
     * Restore the cart state from localStorage.
     * Call this once on the client to avoid SSR hydration mismatches.
     */
    restoreCart(): void {
      const saved = safeGetItem(STORAGE_KEY)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          this.items = parsed.items ?? []
          this.subtotal = parsed.subtotal ?? 0
          this.total_items = parsed.total_items ?? 0
        } catch {
          // Invalid JSON, clear it
          safeRemoveItem(STORAGE_KEY)
        }
      }
    },

    /**
     * Persist the current cart state to localStorage.
     */
    persistCart(): void {
      const state = {
        items: this.items,
        subtotal: this.subtotal,
        total_items: this.total_items,
      }
      safeSetItem(STORAGE_KEY, JSON.stringify(state))
    },

    /**
     * Fetch the cart from the backend and update the local state.
     * Only fetches once per session to avoid redundant calls.
     */
    async fetchCart(): Promise<void> {
      // Skip if already initialized to prevent duplicate fetches
      if (this.isInitialized) {
        return
      }

      try {
        this.isLoading = true
        const response = await getCart()
        const cart = response.data.data

        this.items = cart.items
        this.subtotal = cart.subtotal
        this.total_items = cart.total_items

        this.persistCart()
        this.isInitialized = true
      } catch (error) {
        console.error('Failed to fetch cart:', error)
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

        this.persistCart()
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

        this.persistCart()
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

        this.persistCart()
      } catch (error) {
        console.error('Failed to remove item from cart:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /** Clear the cart state. */
    clearCart(): void {
      this.items = []
      this.subtotal = 0
      this.total_items = 0
      this.isInitialized = false
      safeRemoveItem(STORAGE_KEY)
    },
  },
})
