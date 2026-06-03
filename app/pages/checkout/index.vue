<script setup lang="ts">
/**
 * checkout.vue – Página principal del proceso de compra.
 *
 * Delega toda la lógica visual en `CheckoutView`. Layout `landing` para
 * conservar header + footer del sitio.
 */
definePageMeta({ layout: 'landing' })

useHead({
  title: 'Proceso de compra | Megasorpresa',
  meta: [
    { name: 'description', content: 'Completa tu pedido en pocos pasos.' },
    { name: 'robots', content: 'noindex' },
  ],
})
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gray-50">
    <LandingTheHeader />

    <main class="flex-1 py-8 sm:py-12">
      <CheckoutView />
    </main>

    <LandingTheFooter />
  </div>
</template>
