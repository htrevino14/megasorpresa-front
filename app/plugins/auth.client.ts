/**
 * Client-only plugin that restores the authentication session from
 * localStorage after hydration, avoiding SSR/client state mismatches.
 */
import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin(() => {
  const auth = useAuthStore()
  auth.restoreSession()
})
