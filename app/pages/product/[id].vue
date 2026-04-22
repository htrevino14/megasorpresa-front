<script setup lang="ts">
/**
 * product/[id] – Product Detail Page (PDP).
 *
 * Fetches product data from GET /api/catalog/products/:id and renders a
 * two-column layout: 60 % image gallery on the left, product info and
 * add-to-cart action on the right. Shares the full landing header and footer.
 */
import { getCatalogProduct } from '~/api/catalog'
import type { ProductDetail } from '@@/types/index'

definePageMeta({ layout: 'landing' })

const route = useRoute()
const id = computed<number>(() => Number(route.params.id))

const { data: productData, status, error } = await useAsyncData<ProductDetail>(
  `product-${id.value}`,
  () => getCatalogProduct(id.value).then(r => r.data.data),
)

const product = computed<ProductDetail | null>(() => productData.value ?? null)
const isLoading = computed(() => status.value === 'pending')

// ── Cart state (placeholder – replace with useCartStore when available) ────────
const isAddingToCart = ref(false)

async function handleAddToCart(quantity: number) {
  if (!product.value) return
  isAddingToCart.value = true
  try {
    // TODO: integrate with useCartStore once it exists
    await new Promise<void>(resolve => setTimeout(resolve, 800))
    console.log('Added to cart:', product.value.id, 'qty:', quantity)
  }
  finally {
    isAddingToCart.value = false
  }
}

async function handleBuyNow(quantity: number) {
  if (!product.value) return
  await handleAddToCart(quantity)
  // TODO: navigate to checkout once the route exists
  await navigateTo('/checkout')
}

// ── SEO ───────────────────────────────────────────────────────────────────────
useHead(
  computed(() => ({
    title: product.value ? `${product.value.name} | Megasorpresa` : 'Cargando… | Megasorpresa',
    meta: product.value
      ? [{ name: 'description', content: product.value.description ?? product.value.name }]
      : [],
  })),
)
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gray-50">
    <LandingTheHeader />

    <main class="flex-1">
      <!-- ── Loading skeleton ───────────────────────────────────────────── -->
      <div v-if="isLoading" class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 gap-10 lg:grid-cols-5">
          <!-- Gallery skeleton -->
          <div class="lg:col-span-3">
            <div class="aspect-square animate-pulse rounded-2xl bg-gray-200" />
            <div class="mt-3 flex gap-2">
              <div v-for="n in 4" :key="n" class="h-16 w-16 animate-pulse rounded-lg bg-gray-200" />
            </div>
          </div>
          <!-- Info skeleton -->
          <div class="flex flex-col gap-4 lg:col-span-2">
            <div class="h-5 w-1/3 animate-pulse rounded bg-gray-200" />
            <div class="h-8 w-3/4 animate-pulse rounded bg-gray-200" />
            <div class="h-10 w-1/2 animate-pulse rounded bg-gray-200" />
            <div class="h-24 animate-pulse rounded bg-gray-200" />
            <div class="h-12 animate-pulse rounded-full bg-gray-200" />
          </div>
        </div>
      </div>

      <!-- ── Error state ────────────────────────────────────────────────── -->
      <div
        v-else-if="error || !product"
        class="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-20 text-center sm:px-6 lg:px-8"
      >
        <span class="text-5xl">😕</span>
        <h1 class="text-2xl font-bold text-gray-800">Producto no encontrado</h1>
        <p class="text-gray-500">El producto que buscas no existe o ya no está disponible.</p>
        <NuxtLink to="/catalog" class="btn-primary mt-2 rounded-full">
          Ver catálogo
        </NuxtLink>
      </div>

      <!-- ── Product layout ─────────────────────────────────────────────── -->
      <div v-else class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <!-- Breadcrumb -->
        <nav class="mb-6 flex items-center gap-2 text-xs text-gray-500" aria-label="Breadcrumb">
          <NuxtLink to="/" class="hover:text-[#0072E3]">Inicio</NuxtLink>
          <span aria-hidden="true">/</span>
          <NuxtLink to="/catalog" class="hover:text-[#0072E3]">Catálogo</NuxtLink>
          <span aria-hidden="true">/</span>
          <span class="line-clamp-1 font-medium text-gray-700">{{ product.name }}</span>
        </nav>

        <!-- Two-column grid: gallery (60 %) + info (40 %) -->
        <div class="grid grid-cols-1 items-start gap-8 lg:grid-cols-5">
          <!-- ── Left: Gallery (3/5 = 60 %) ─────────────────────────────── -->
          <div class="lg:col-span-3">
            <ProductGallery
              :primary-image="product.primary_image"
              :images="product.images"
              :product-name="product.name"
            />
          </div>

          <!-- ── Right: Info + Actions (2/5 = 40 %) ─────────────────────── -->
          <!-- top-28 accounts for the sticky header (~7rem) with a small buffer -->
          <div class="flex flex-col gap-6 lg:col-span-2 lg:sticky lg:top-28">
            <ProductInfo
              :name="product.name"
              :base-price="product.base_price"
              :description="product.description"
              :categories="product.categories"
              :stock-quantity="product.stock_quantity"
            />

            <ProductAddToCartAction
              :stock-quantity="product.stock_quantity"
              :loading="isAddingToCart"
              @add-to-cart="handleAddToCart"
              @buy-now="handleBuyNow"
            />

            <!-- Trust badges -->
            <div class="grid grid-cols-3 gap-3 rounded-xl bg-white p-4 text-center text-xs text-gray-600 shadow-sm ring-1 ring-gray-200">
              <div class="flex flex-col items-center gap-1">
                <svg class="h-5 w-5 text-[#0072E3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l-1 12h16L19 8M10 12v4m4-4v4" />
                </svg>
                <span>Envío mismo día</span>
              </div>
              <div class="flex flex-col items-center gap-1">
                <svg class="h-5 w-5 text-[#0072E3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Compra segura</span>
              </div>
              <div class="flex flex-col items-center gap-1">
                <svg class="h-5 w-5 text-[#0072E3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Cambios fáciles</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <LandingTheFooter />
  </div>
</template>
