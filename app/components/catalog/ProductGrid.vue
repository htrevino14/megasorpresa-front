<script setup lang="ts">
/**
 * ProductGrid – Renders a responsive grid of ProductCard components.
 * Shows skeleton placeholders while products are loading.
 *
 * @prop {CatalogProduct[]} products  - Array of products to display.
 * @prop {boolean}          loading   - When true, skeleton cards are shown instead.
 * @prop {number}           skeletons - Number of skeleton cards to show (default: 8).
 * @emits add-to-cart - Bubbled up from ProductCard, carrying the product.
 */
import type { CatalogProduct } from '@@/types/index'

withDefaults(
  defineProps<{
    products: CatalogProduct[]
    loading: boolean
    skeletons?: number
  }>(),
  { skeletons: 8 },
)

const emit = defineEmits<{ 'add-to-cart': [product: CatalogProduct] }>()
</script>

<template>
  <!-- Skeleton grid -->
  <div
    v-if="loading"
    class="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
  >
    <div
      v-for="n in skeletons"
      :key="n"
      class="card animate-pulse overflow-hidden"
    >
      <div class="aspect-square rounded-t-lg bg-gray-200" />
      <div class="p-3 space-y-2">
        <div class="h-3 rounded bg-gray-200 w-3/4" />
        <div class="h-3 rounded bg-gray-200 w-1/2" />
        <div class="h-4 rounded bg-gray-200 w-1/3 mt-1" />
        <div class="h-9 rounded bg-gray-200 mt-2" />
      </div>
    </div>
  </div>

  <!-- Empty state -->
  <div
    v-else-if="products.length === 0"
    class="flex flex-col items-center justify-center py-20 text-center text-gray-500"
  >
    <span class="text-5xl">🎁</span>
    <p class="mt-4 text-lg font-semibold">No encontramos productos</p>
    <p class="mt-1 text-sm">Intenta con otros filtros o categorías.</p>
  </div>

  <!-- Product grid -->
  <div
    v-else
    class="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
  >
    <CatalogProductCard
      v-for="product in products"
      :key="product.id"
      :product="product"
      @add-to-cart="emit('add-to-cart', $event)"
    />
  </div>
</template>
