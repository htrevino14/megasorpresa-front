<script setup lang="ts">
/**
 * SuggestedProducts – Horizontal carousel of suggested products for upselling.
 *
 * Displays a scrollable list of recommended products (e.g., globos, tarjetas)
 * to increase the average ticket value.
 */
import type { CatalogProduct } from '@@/types/index'
import { formatPrice } from '~/utils/index'

defineProps<{
  products: CatalogProduct[]
}>()
</script>

<template>
  <div class="py-8">
    <h2 class="mb-4 text-xl font-bold text-gray-900">Agrega un detalle especial</h2>
    <p class="mb-6 text-sm text-gray-600">Complementa tu regalo con estos productos</p>

    <!-- Horizontal scroll container -->
    <div class="scrollbar-hide -mx-4 flex gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0">
      <NuxtLink
        v-for="product in products"
        :key="product.id"
        :to="`/product/${product.id}`"
        class="card group w-40 flex-shrink-0 transition-all hover:shadow-md sm:w-48"
      >
        <!-- Product image -->
        <div class="relative mb-3 aspect-square overflow-hidden rounded-lg bg-gray-100">
          <img
            :src="product.primary_image"
            :alt="product.name"
            class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>

        <!-- Product info -->
        <h3 class="mb-1 line-clamp-2 text-sm font-semibold text-gray-900">
          {{ product.name }}
        </h3>
        <p class="text-base font-bold text-[#0072E3]">
          {{ formatPrice(parseFloat(product.base_price)) }}
        </p>

        <!-- Add button -->
        <button
          type="button"
          class="mt-3 flex w-full items-center justify-center gap-1 rounded-full bg-yellow-400 py-2 text-xs font-bold text-white transition-colors hover:bg-yellow-500"
          @click.prevent
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Agregar</span>
        </button>
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
/* Hide scrollbar but keep functionality */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
