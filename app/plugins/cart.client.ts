/**
 * Cart restoration plugin.
 *
 * Restores the cart state from localStorage on client-side mount,
 * then fetches the latest state from the backend to ensure synchronization.
 */
export default defineNuxtPlugin(() => {
  const cart = useCartStore()

  // Restore from localStorage first for immediate UI update
  cart.restoreCart()

  // Then fetch from backend to ensure sync
  // Only if we're on the client side
  if (import.meta.client) {
    cart.fetchCart()
  }
})
