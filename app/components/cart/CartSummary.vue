<script setup lang="ts">
/**
 * CartSummary – Sticky order summary sidebar.
 *
 * Shows shipping metadata from the cart (city + delivery date),
 * subtotal, and the checkout CTA.
 *
 * @prop {number} subtotal - Cart subtotal from the backend.
 * @prop {string|null} shippingCity - City name stored in the cart.
 * @prop {string|null} deliveryDate - ISO date from scheduled_delivery_date.
 * @prop {boolean} disabled - Disables checkout button.
 */
import { formatPrice, formatDate } from '~/utils/index'

defineProps<{
  subtotal: number
  shippingCity?: string | null
  deliveryDate?: string | null
  disabled?: boolean
}>()
</script>

<template>
  <div class="sticky top-28 flex flex-col gap-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
    <h2 class="text-lg font-bold text-gray-900">Resumen del pedido</h2>

    <!-- Logistics metadata -->
    <div v-if="shippingCity || deliveryDate" class="flex flex-col gap-3 rounded-xl bg-gray-50 p-4">
      <!-- Shipping city -->
      <div v-if="shippingCity" class="flex items-center gap-3">
        <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </span>
        <div>
          <p class="text-xs font-medium uppercase tracking-wide text-gray-400">Envío a</p>
          <p class="text-sm font-semibold text-gray-900">{{ shippingCity }}</p>
        </div>
      </div>

      <!-- Delivery date -->
      <div v-if="deliveryDate" class="flex items-center gap-3">
        <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </span>
        <div>
          <p class="text-xs font-medium uppercase tracking-wide text-gray-400">Fecha de entrega</p>
          <p class="text-sm font-semibold text-gray-900">{{ formatDate(deliveryDate) }}</p>
        </div>
      </div>
    </div>

    <!-- Totals -->
    <div class="flex flex-col gap-2 border-t border-gray-100 pt-4">
      <div class="flex items-center justify-between text-sm text-gray-600">
        <span>Subtotal</span>
        <span class="font-medium text-gray-900">{{ formatPrice(subtotal) }}</span>
      </div>
      <div class="flex items-center justify-between text-sm text-gray-600">
        <span>Envío</span>
        <span class="font-medium text-green-600">Gratis</span>
      </div>
      <div class="mt-2 flex items-center justify-between border-t border-gray-100 pt-3">
        <span class="text-base font-bold text-gray-900">Total</span>
        <span class="text-xl font-bold text-gray-900">{{ formatPrice(subtotal) }}</span>
      </div>
    </div>

    <!-- Checkout CTA -->
    <NuxtLink
      to="/checkout"
      class="flex w-full items-center justify-center gap-2 rounded-full bg-yellow-400 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-yellow-500 hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
      :class="{ 'pointer-events-none opacity-60': disabled }"
    >
      <span>Continuar con la compra</span>
      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
    </NuxtLink>

    <!-- Trust badges -->
    <div class="flex items-center justify-center gap-5 border-t border-gray-100 pt-4 text-xs text-gray-500">
      <div class="flex items-center gap-1.5">
        <svg class="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <span>Compra segura</span>
      </div>
      <div class="flex items-center gap-1.5">
        <svg class="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        <span>Pago protegido</span>
      </div>
    </div>
  </div>
</template>
