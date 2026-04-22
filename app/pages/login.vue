<script setup lang="ts">
/**
 * login – URL alias for the auth modal.
 *
 * When a user navigates directly to /login (e.g. from the auth middleware),
 * this page opens the auth modal and sends them back to the page they wanted
 * to visit (via the `redirect` query param) or to the home page.
 * The modal itself handles the actual form logic without any navigation.
 *
 * @emits none
 */
import { useAuthStore } from '~/stores/auth'
import { useAuthModalStore } from '~/stores/authModal'

definePageMeta({ layout: false })

const auth = useAuthStore()
const authModal = useAuthModalStore()
const route = useRoute()

// Redirect authenticated users to their destination immediately
if (auth.isAuthenticated) {
  const redirect = route.query.redirect as string | undefined
  await navigateTo(redirect && redirect.startsWith('/') ? redirect : '/')
} else {
  // Navigate to the destination (or home) and open the modal on the client
  const redirect = route.query.redirect as string | undefined
  const destination = redirect && redirect.startsWith('/') ? redirect : '/'
  await navigateTo(destination, { replace: true })
  if (import.meta.client) {
    authModal.open('login')
  }
}
</script>

<template>
  <div />
</template>
