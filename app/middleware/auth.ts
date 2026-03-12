/**
 * Auth middleware – protects routes that require an authenticated user.
 *
 * Add `definePageMeta({ middleware: 'auth' })` to any page that should be
 * accessible only to logged-in users.  Unauthenticated visitors are
 * redirected to `/login`.
 */
import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(() => {
  const auth = useAuthStore()

  if (!auth.isAuthenticated) {
    return navigateTo('/login')
  }
})
