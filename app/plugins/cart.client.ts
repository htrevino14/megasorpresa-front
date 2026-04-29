/**
 * Cart restoration plugin.
 *
 * Restores the cart state from localStorage on client-side mount,
 * then fetches the latest state from the backend to ensure synchronization.
 * Initializes CSRF token on first load to establish a persistent session.
 */
import { initCsrfToken } from '~/api/index'

export default defineNuxtPlugin(async () => {
  const cart = useCartStore()

  // Restore from localStorage first for immediate UI update
  cart.restoreCart()

  // Initialize CSRF token early to establish session if it doesn't exist
  // This ensures we have a session before any cart operations
  if (import.meta.client) {
    await initCsrfToken()

    // Then fetch from backend to ensure sync
    cart.fetchCart()
  }
})
