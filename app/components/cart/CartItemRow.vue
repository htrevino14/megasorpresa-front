<script setup lang="ts">
/**
 * CartItemRow – Single product row in the shopping cart.
 *
 * Displays product image, name, SKU, price, quantity controls (+/-),
 * and a remove button. Implements debounced quantity updates to avoid
 * saturating the backend with rapid changes.
 *
 * @prop {CartItem} item - The cart item to display.
 * @emits update:quantity - Emitted when quantity changes (debounced).
 * @emits remove - Emitted when the user clicks remove.
 */
import type { CartItem } from '@@/types/index'
import { formatPrice } from '~/utils/index'

const props = defineProps<{
  item: CartItem
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:quantity': [productId: number, quantity: number]
  remove: [productId: number]
}>()

const quantity = ref(props.item.quantity)
const pendingUpdate = ref(false)
let debounceTimer: NodeJS.Timeout | null = null

// Watch for external changes to item.quantity (e.g., from backend sync)
watch(() => props.item.quantity, (newQty) => {
  if (!pendingUpdate.value) {
    quantity.value = newQty
  }
})

function decrement() {
  if (quantity.value > 1 && !props.disabled) {
    quantity.value--
    debouncedUpdate()
  }
}

function increment() {
  if (quantity.value < 10 && !props.disabled) {
    quantity.value++
    debouncedUpdate()
  }
}

function debouncedUpdate() {
  pendingUpdate.value = true
  if (debounceTimer) clearTimeout(debounceTimer)

  debounceTimer = setTimeout(() => {
    emit('update:quantity', props.item.product_id, quantity.value)
    pendingUpdate.value = false
  }, 600)
}

function handleRemove() {
  if (!props.disabled) {
    emit('remove', props.item.product_id)
  }
}
</script>

<template>
  <div class="card flex flex-col gap-4 sm:flex-row sm:items-center">
    <!-- Product image -->
    <NuxtLink
      :to="`/product/${item.product_id}`"
      class="flex-shrink-0"
    >
      <img
        :src="item.product_image"
        :alt="item.product_name"
        class="h-24 w-24 rounded-lg object-cover transition-transform hover:scale-105"
      />
    </NuxtLink>

    <!-- Product info -->
    <div class="flex flex-1 flex-col gap-1">
      <NuxtLink
        :to="`/product/${item.product_id}`"
        class="text-base font-semibold text-gray-900 hover:text-[#0072E3]"
      >
        {{ item.product_name }}
      </NuxtLink>
      <p class="text-xs text-gray-500">SKU: {{ item.product_id }}</p>
      <p class="text-sm font-bold text-gray-900">
        {{ formatPrice(item.product_price) }}
      </p>

      <!-- Wrapping option badge -->
      <div v-if="item.wrapping_option_name" class="mt-1 flex items-center gap-1 text-xs text-gray-600">
        <svg class="h-4 w-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
        <span>Envoltura: {{ item.wrapping_option_name }}</span>
      </div>
    </div>

    <!-- Quantity controls -->
    <div class="flex items-center gap-4">
      <div class="flex items-center overflow-hidden rounded-full border border-gray-300 bg-white shadow-sm">
        <button
          type="button"
          aria-label="Disminuir cantidad"
          class="flex h-9 w-9 items-center justify-center text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
          :disabled="quantity <= 1 || disabled"
          @click="decrement"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
          </svg>
        </button>
        <span class="w-10 text-center text-sm font-semibold text-gray-900">
          {{ quantity }}
        </span>
        <button
          type="button"
          aria-label="Aumentar cantidad"
          class="flex h-9 w-9 items-center justify-center text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
          :disabled="quantity >= 10 || disabled"
          @click="increment"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      <!-- Subtotal -->
      <div class="hidden text-right sm:block sm:w-24">
        <p class="text-sm font-bold text-gray-900">
          {{ formatPrice(item.subtotal) }}
        </p>
      </div>

      <!-- Remove button -->
      <button
        type="button"
        aria-label="Eliminar producto"
        class="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="disabled"
        @click="handleRemove"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>

    <!-- Mobile subtotal -->
    <div class="flex items-center justify-between sm:hidden">
      <span class="text-sm text-gray-600">Subtotal:</span>
      <p class="text-base font-bold text-gray-900">
        {{ formatPrice(item.subtotal) }}
      </p>
    </div>
  </div>
</template>
