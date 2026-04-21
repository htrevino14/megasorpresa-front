<script setup lang="ts">
/**
 * ProductCard – Displays a single catalog product with its primary image,
 * name, price formatted in MXN, and an "Añadir al carrito" button.
 *
 * Hover effect scales the card and swaps to the second gallery image when
 * available, providing a premium browsing feel.
 *
 * @prop {CatalogProduct} product - The product data to display.
 * @emits add-to-cart - Emitted when the user clicks the add-to-cart button, carrying the product.
 */
import type { CatalogProduct } from '@@/types/index'
import { formatPrice } from '~/utils/index'

const props = defineProps<{ product: CatalogProduct }>()
const emit = defineEmits<{ 'add-to-cart': [product: CatalogProduct] }>()

const isHovered = ref(false)

const displayImage = computed<string>(() => {
  if (isHovered.value && props.product.gallery && props.product.gallery.length > 0) {
    return props.product.gallery[0]
  }
  return props.product.primary_image
})

const numericPrice = computed<number>(() => parseFloat(props.product.base_price))
</script>

<template>
  <article
    class="card group flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- Product image -->
    <NuxtLink :to="`/products/${product.slug}`" class="block overflow-hidden rounded-t-lg">
      <div class="relative aspect-square overflow-hidden bg-gray-100">
        <img
          :src="displayImage"
          :alt="product.name"
          class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <!-- Category badge -->
        <span
          v-if="product.categories.length > 0"
          class="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-gray-700 shadow-sm"
        >
          {{ product.categories[0].name }}
        </span>
      </div>
    </NuxtLink>

    <!-- Card body -->
    <div class="flex flex-1 flex-col gap-2 p-3">
      <NuxtLink :to="`/products/${product.slug}`" class="line-clamp-2 text-sm font-semibold text-gray-800 hover:text-yellow-500">
        {{ product.name }}
      </NuxtLink>

      <p class="mt-auto text-base font-bold text-gray-900">
        {{ formatPrice(numericPrice) }}
      </p>

      <button
        class="btn-primary mt-1 w-full text-center"
        type="button"
        @click="emit('add-to-cart', product)"
      >
        Añadir al carrito
      </button>
    </div>
  </article>
</template>
