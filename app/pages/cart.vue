<script setup lang="ts">
/**
 * cart.vue – Página del carrito de compras.
 *
 * Layout dos columnas (productos | resumen), datos reales desde el backend,
 * skeletons durante la carga y estado vacío elegante.
 */
definePageMeta({ layout: 'landing' })

const cart = useCartStore()

// Al montar la página siempre se hace un fetch fresco para mostrar el estado
// real de la base de datos, sin depender de lo que haya en localStorage.
onMounted(() => {
  cart.refreshCart()
})

async function handleUpdateQuantity(productId: number, quantity: number) {
  try {
    await cart.updateQuantity(productId, quantity)
  } catch {
    // TODO: notificación de error
  }
}

async function handleRemove(productId: number) {
  try {
    await cart.removeItem(productId)
  } catch {
    // TODO: notificación de error
  }
}

useHead({
  title: 'Carrito de compras | Megasorpresa',
  meta: [{ name: 'description', content: 'Revisa tu carrito de compras y continúa con tu pedido.' }],
})
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gray-50">
    <LandingTheHeader />

    <main class="flex-1 py-8 sm:py-12">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <!-- ── Page header ─────────────────────────────────────────────── -->
        <div class="mb-8">
          <h1 class="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Carrito de compras
          </h1>
          <p v-if="!cart.isLoading" class="mt-1 text-sm text-gray-500">
            <template v-if="cart.hasItems">
              {{ cart.totalItems }} {{ cart.totalItems === 1 ? 'artículo' : 'artículos' }}
            </template>
          </p>
        </div>

        <!-- ── Loading skeletons ───────────────────────────────────────── -->
        <div v-if="cart.isLoading" class="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <!-- Items skeleton -->
          <div class="space-y-4 lg:col-span-2">
            <div v-for="n in 3" :key="n" class="flex gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
              <div class="h-28 w-28 shrink-0 animate-pulse rounded-xl bg-gray-200" />
              <div class="flex flex-1 flex-col justify-between py-1">
                <div class="space-y-2">
                  <div class="h-4 w-3/4 animate-pulse rounded-md bg-gray-200" />
                  <div class="h-3 w-1/3 animate-pulse rounded-md bg-gray-200" />
                </div>
                <div class="flex items-center justify-between">
                  <div class="h-8 w-24 animate-pulse rounded-full bg-gray-200" />
                  <div class="h-5 w-20 animate-pulse rounded-md bg-gray-200" />
                </div>
              </div>
            </div>
          </div>

          <!-- Summary skeleton -->
          <div class="lg:col-span-1">
            <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <div class="h-5 w-2/3 animate-pulse rounded-md bg-gray-200" />
              <div class="mt-4 space-y-3">
                <div class="h-4 w-full animate-pulse rounded-md bg-gray-200" />
                <div class="h-4 w-4/5 animate-pulse rounded-md bg-gray-200" />
                <div class="h-4 w-3/5 animate-pulse rounded-md bg-gray-200" />
              </div>
              <div class="mt-6 h-12 w-full animate-pulse rounded-full bg-gray-200" />
            </div>
          </div>
        </div>

        <!-- ── Empty state ─────────────────────────────────────────────── -->
        <div
          v-else-if="!cart.hasItems"
          class="flex flex-col items-center gap-6 rounded-2xl bg-white px-8 py-20 text-center shadow-sm ring-1 ring-gray-100"
        >
          <div class="flex h-24 w-24 items-center justify-center rounded-full bg-yellow-50">
            <svg class="h-12 w-12 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900">Tu carrito está vacío</h2>
            <p class="mt-1 text-sm text-gray-500">Agrega productos para comenzar tu compra.</p>
          </div>
          <NuxtLink
            to="/catalog"
            class="inline-flex items-center gap-2 rounded-full bg-yellow-400 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-yellow-500"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            Ver catálogo
          </NuxtLink>
        </div>

        <!-- ── Main layout ─────────────────────────────────────────────── -->
        <div v-else class="grid grid-cols-1 gap-8 lg:grid-cols-3">

          <!-- Left column: cart items (2/3) -->
          <section class="space-y-3 lg:col-span-2" aria-label="Productos en el carrito">

            <!-- Items list -->
            <TransitionGroup name="cart-item" tag="div" class="space-y-3">
              <CartItemRow
                v-for="item in cart.cartItems"
                :key="item.id"
                :item="item"
                :disabled="cart.isLoading"
                @update:quantity="handleUpdateQuantity"
                @remove="handleRemove"
              />
            </TransitionGroup>

            <!-- Continue shopping link -->
            <div class="pt-2">
              <NuxtLink
                to="/catalog"
                class="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-yellow-500"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
                Seguir comprando
              </NuxtLink>
            </div>
          </section>

          <!-- Right column: order summary (1/3) -->
          <aside class="lg:col-span-1">
            <CartSummary
              :subtotal="cart.cartSubtotal"
              :shipping-city="cart.shippingCity?.name ?? null"
              :delivery-date="cart.deliveryDate"
              :disabled="cart.isLoading || !cart.hasItems"
            />
          </aside>
        </div>

      </div>
    </main>

    <LandingTheFooter />
  </div>
</template>

<style scoped>
.cart-item-enter-active,
.cart-item-leave-active {
  transition: all 0.3s ease;
}
.cart-item-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.cart-item-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>

