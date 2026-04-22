<script setup lang="ts">
/**
 * register – URL alias for the auth modal (register mode).
 *
 * When a user navigates directly to /register this page opens the auth modal
 * in register mode and sends them back to the home page.
 *
 * @emits none
 */
import { useAuthStore } from '~/stores/auth'
import { useAuthModalStore } from '~/stores/authModal'

definePageMeta({ layout: false })

const auth = useAuthStore()
const authModal = useAuthModalStore()

if (auth.isAuthenticated) {
  await navigateTo('/')
} else {
  await navigateTo('/', { replace: true })
  if (import.meta.client) {
    authModal.open('register')
  }
}
</script>

<template>
  <div />
</template>
