/**
 * Cart initialization plugin.
 *
 * Fetches the cart state from the backend on client-side mount.
 * The backend (Laravel Sanctum) serves as the single source of truth,
 * managing cart persistence via session cookies.
 *
 * This plugin only runs once on app initialization (not on every route change).
 */

let isInitialized = false

export default defineNuxtPlugin(() => {
  const cart = useCartStore()

  // Fetch cart from backend on app initialization (only once)
  // The backend identifies the user via session cookies (withCredentials: true)
  if (import.meta.client && !isInitialized) {
    isInitialized = true
    cart.fetchCart()
  }
})
