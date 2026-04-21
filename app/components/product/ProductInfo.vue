<script setup lang="ts">
/**
 * ProductInfo – Displays product name, price, description, category badges,
 * and a subtle stock availability indicator.
 *
 * @prop {string}            name           - Product name.
 * @prop {string}            basePrice      - Raw price string from the backend (parsed internally).
 * @prop {string|null}       description    - Product description, supports basic HTML.
 * @prop {CatalogCategory[]} categories     - List of categories the product belongs to.
 * @prop {number}            stockQuantity  - Available stock units.
 */
import type { CatalogCategory } from '@@/types/index'
import { formatPrice } from '~/utils/index'

const props = defineProps<{
  name: string
  basePrice: string
  description: string | null
  categories: CatalogCategory[]
  stockQuantity: number
}>()

const numericPrice = computed<number>(() => parseFloat(props.basePrice))

const stockStatus = computed<'available' | 'low' | 'out'>(() => {
  if (props.stockQuantity <= 0) return 'out'
  if (props.stockQuantity <= 5) return 'low'
  return 'available'
})

/**
 * Sanitise the description by stripping all HTML tags and preserving line
 * breaks as <br> elements. This avoids an XSS vulnerability while still
 * rendering multi-line descriptions correctly.
 */
const safeDescription = computed<string | null>(() => {
  if (!props.description) return null
  const escaped = props.description
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\n/g, '<br>')
  return escaped
})
</script>

<template>
  <div class="flex flex-col gap-5">
    <!-- Category badges -->
    <div v-if="categories.length > 0" class="flex flex-wrap gap-2">
      <NuxtLink
        v-for="cat in categories"
        :key="cat.id"
        :to="`/catalog?category=${cat.slug}`"
        class="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
      >
        {{ cat.name }}
      </NuxtLink>
    </div>

    <!-- Product name -->
    <h1 class="text-2xl font-bold leading-tight text-gray-900 md:text-3xl">
      {{ name }}
    </h1>

    <!-- Price -->
    <div class="flex items-baseline gap-2">
      <span class="text-3xl font-extrabold text-gray-900 md:text-4xl">
        {{ formatPrice(numericPrice) }}
      </span>
      <span class="text-sm font-medium text-gray-400">MXN</span>
    </div>

    <!-- Stock indicator -->
    <div class="flex items-center gap-2 text-sm font-medium">
      <template v-if="stockStatus === 'available'">
        <span class="h-2 w-2 rounded-full bg-green-400"></span>
        <span class="text-green-700">Disponible</span>
      </template>
      <template v-else-if="stockStatus === 'low'">
        <span class="h-2 w-2 rounded-full bg-yellow-400"></span>
        <span class="text-yellow-700">Últimas {{ stockQuantity }} piezas</span>
      </template>
      <template v-else>
        <span class="h-2 w-2 rounded-full bg-red-400"></span>
        <span class="text-red-700">Agotado</span>
      </template>
    </div>

    <!-- Divider -->
    <hr class="border-gray-200" />

    <!-- Description -->
    <div v-if="safeDescription" class="prose prose-sm max-w-none text-gray-700 leading-relaxed">
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div v-html="safeDescription" />
    </div>
    <p v-else class="text-sm text-gray-400 italic">
      Sin descripción disponible.
    </p>
  </div>
</template>
