<script setup lang="ts">
/**
 * CartItemRow – Single product row in the shopping cart.
 *
 * Displays product image, name, unit price, quantity controls (+/-),
 * item subtotal, and a remove button.
 *
 * @prop {CartItem} item - The cart item to display.
 * @prop {boolean} disabled - Disable controls during loading.
 * @emits update:quantity - Emitted with [productId, quantity] after debounce.
 * @emits remove - Emitted with [productId] when user clicks remove.
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
let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(() => props.item.quantity, (newQty) => {
  if (!pendingUpdate.value) quantity.value = newQty
})

function decrement() {
  if (quantity.value > 1 && !props.disabled) {
    quantity.value--
    debouncedUpdate()
  }
}

function increment() {
  if (quantity.value < 99 && !props.disabled) {
    quantity.value++
    debouncedUpdate()
  }
}

function debouncedUpdate() {
  pendingUpdate.value = true
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    emit('update:quantity', props.item.product.id, quantity.value)
    pendingUpdate.value = false
  }, 600)
}

function handleRemove() {
  if (!props.disabled) emit('remove', props.item.product.id)
}

const imageUrl = computed(
  () => props.item.product.primary_image ?? '/images/placeholder-toy.png',
)
</script>

<template>
  <div
    class="flex gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 transition-opacity"
    :class="{ 'opacity-60': disabled }"
  >
    <!-- Product image -->
    <NuxtLink :to="`/product/${item.product.slug}`" class="shrink-0">
      <img
        :src="imageUrl"
        :alt="item.product.name"
        class="h-24 w-24 rounded-xl object-cover ring-1 ring-gray-100 sm:h-28 sm:w-28"
        loading="lazy"
      />
    </NuxtLink>

    <!-- Content -->
    <div class="flex flex-1 flex-col justify-between gap-2">
      <!-- Top row: name + remove -->
      <div class="flex items-start justify-between gap-2">
        <NuxtLink
          :to="`/product/${item.product.slug}`"
          class="text-sm font-semibold leading-snug text-gray-900 hover:text-yellow-500 sm:text-base"
        >
          {{ item.product.name }}
        </NuxtLink>

        <button
          type="button"
          aria-label="Eliminar producto"
          class="ml-2 shrink-0 rounded-full p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40"
          :disabled="disabled"
          @click="handleRemove"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Unit price -->
      <p class="text-xs text-gray-500">
        Precio unitario:
        <span class="font-medium text-gray-700">{{ formatPrice(item.price_at_addition) }}</span>
      </p>

      <!-- Bottom row: quantity controls + subtotal -->
      <div class="flex items-center justify-between">
        <!-- Quantity stepper -->
        <div class="inline-flex items-center overflow-hidden rounded-full border border-gray-200 bg-gray-50">
          <button
            type="button"
            aria-label="Disminuir cantidad"
            class="flex h-8 w-8 items-center justify-center text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="quantity <= 1 || disabled"
            @click="decrement"
          >
            <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M20 12H4" />
            </svg>
          </button>
          <span class="w-8 text-center text-sm font-bold text-gray-900">{{ quantity }}</span>
          <button
            type="button"
            aria-label="Aumentar cantidad"
            class="flex h-8 w-8 items-center justify-center text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="quantity >= 99 || disabled"
            @click="increment"
          >
            <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        <!-- Subtotal -->
        <p class="text-base font-bold text-gray-900">
          {{ formatPrice(item.subtotal) }}
        </p>
      </div>
    </div>
  </div>
</template>
