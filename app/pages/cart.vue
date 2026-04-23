<script setup lang="ts">
/**
 * cart – Shopping cart page.
 *
 * Two-column layout: left displays cart items with quantity controls,
 * right shows order summary with sticky positioning. Below the cart items,
 * displays suggested products for upselling.
 */
import type { CatalogProduct } from '@@/types/index'
import { getCatalogProducts } from '~/api/catalog'

definePageMeta({ layout: 'landing' })

const cart = useCartStore()

// Fetch suggested products for upselling (limit to 6 items)
const { data: suggestedData } = await useAsyncData<CatalogProduct[]>(
  'suggested-products',
  async () => {
    const response = await getCatalogProducts({ page: 1 })
    return response.data.data.slice(0, 6)
  },
)

const suggestedProducts = computed<CatalogProduct[]>(() => suggestedData.value ?? [])

async function handleUpdateQuantity(productId: number, quantity: number) {
  try {
    await cart.updateQuantity(productId, quantity)
  } catch (error) {
    console.error('Failed to update quantity:', error)
    // TODO: Show error notification to user
  }
}

async function handleRemove(productId: number) {
  try {
    await cart.removeItem(productId)
  } catch (error) {
    console.error('Failed to remove item:', error)
    // TODO: Show error notification to user
  }
}

// SEO
useHead({
  title: 'Carrito de compras | Megasorpresa',
  meta: [
    { name: 'description', content: 'Revisa tu carrito de compras y continúa con tu pedido.' },
  ],
})
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gray-50">
    <LandingTheHeader />

    <main class="flex-1">
      <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <!-- Page title -->
        <div class="mb-6">
          <h1 class="text-3xl font-bold text-gray-900">Carrito de compras</h1>
          <p class="mt-1 text-sm text-gray-600">
            {{ cart.totalItems }} {{ cart.totalItems === 1 ? 'artículo' : 'artículos' }}
          </p>
        </div>

        <!-- Empty cart state -->
        <div
          v-if="!cart.hasItems && !cart.isLoading"
          class="flex flex-col items-center gap-4 py-20 text-center"
        >
          <svg class="h-24 w-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h2 class="text-2xl font-bold text-gray-800">Tu carrito está vacío</h2>
          <p class="text-gray-500">Agrega productos para comenzar tu compra</p>
          <NuxtLink to="/catalog" class="btn-primary mt-4 rounded-full">
            Ver catálogo
          </NuxtLink>
        </div>

        <!-- Loading skeleton -->
        <div v-else-if="cart.isLoading" class="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div class="space-y-4 lg:col-span-2">
            <div v-for="n in 3" :key="n" class="card flex gap-4">
              <div class="h-24 w-24 animate-pulse rounded-lg bg-gray-200" />
              <div class="flex-1 space-y-2">
                <div class="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
                <div class="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
                <div class="h-6 w-1/4 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          </div>
          <div class="lg:col-span-1">
            <div class="card h-96 animate-pulse bg-gray-200" />
          </div>
        </div>

        <!-- Cart layout -->
        <div v-else class="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <!-- Left: Cart items (2/3) -->
          <div class="space-y-4 lg:col-span-2">
            <CartCartItemRow
              v-for="item in cart.cartItems"
              :key="item.id"
              :item="item"
              :disabled="cart.isLoading"
              @update:quantity="handleUpdateQuantity"
              @remove="handleRemove"
            />

            <!-- Suggested products -->
            <CartSuggestedProducts
              v-if="suggestedProducts.length > 0"
              :products="suggestedProducts"
            />
          </div>

          <!-- Right: Order summary (1/3) -->
          <div class="lg:col-span-1">
            <CartCartSummary
              :subtotal="cart.cartSubtotal"
              :disabled="cart.isLoading || !cart.hasItems"
            />
          </div>
        </div>
      </div>
    </main>

    <LandingTheFooter />
  </div>
</template>
