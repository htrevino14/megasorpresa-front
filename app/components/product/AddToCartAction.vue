<script setup lang="ts">
/**
 * AddToCartAction – Quantity selector and add-to-cart button for the PDP.
 *
 * Shows a loading spinner while the cart operation is in progress, and
 * disables interaction when the product is out of stock.
 *
 * @prop {number}  stockQuantity - Available stock.
 * @prop {boolean} loading       - Whether an add-to-cart operation is pending.
 * @emits add-to-cart - Emitted with the selected quantity when the user confirms.
 */
const props = defineProps<{
  stockQuantity: number
  loading?: boolean
}>()

const emit = defineEmits<{
  'add-to-cart': [quantity: number]
  'buy-now': [quantity: number]
}>()

const quantity = ref(1)

const isOutOfStock = computed<boolean>(() => props.stockQuantity <= 0)
const maxQuantity = computed<number>(() => Math.min(props.stockQuantity, 10))

function decrement() {
  if (quantity.value > 1) quantity.value--
}

function increment() {
  if (quantity.value < maxQuantity.value) quantity.value++
}

function handleAddToCart() {
  if (!isOutOfStock.value && !props.loading) {
    emit('add-to-cart', quantity.value)
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Quantity selector -->
    <div class="flex items-center gap-3">
      <span class="text-sm font-medium text-gray-700">Cantidad:</span>
      <div class="flex items-center overflow-hidden rounded-full border border-gray-300 bg-white shadow-sm">
        <button
          type="button"
          aria-label="Disminuir cantidad"
          class="flex h-9 w-9 items-center justify-center text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
          :disabled="quantity <= 1 || isOutOfStock"
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
          :disabled="quantity >= maxQuantity || isOutOfStock"
          @click="increment"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Add-to-cart button -->
    <button
      type="button"
      class="btn-primary flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-base font-bold shadow-md transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
      :disabled="isOutOfStock || loading"
      @click="handleAddToCart"
    >
      <!-- Loading spinner -->
      <svg
        v-if="loading"
        class="h-5 w-5 animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>

      <!-- Cart icon -->
      <svg
        v-else
        class="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>

      <span v-if="isOutOfStock">Agotado</span>
      <span v-else-if="loading">Agregando…</span>
      <span v-else>Añadir al carrito</span>
    </button>

    <!-- Buy-now secondary action -->
    <button
      v-if="!isOutOfStock"
      type="button"
      class="btn-secondary flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-base font-bold"
      :disabled="loading"
      @click="emit('buy-now', quantity)"
    >
      Comprar ahora
    </button>
  </div>
</template>
