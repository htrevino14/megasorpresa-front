<script setup lang="ts">
/**
 * CartSummary – Order summary sidebar with totals and delivery info.
 *
 * Displays subtotal, shipping cost, total, selected location and delivery date.
 * Sticky positioned on desktop for easy access during scroll.
 *
 * @prop {number} subtotal - Cart subtotal before shipping.
 * @prop {number} shippingCost - Shipping cost.
 * @prop {number} total - Grand total.
 * @prop {boolean} disabled - Whether to disable the checkout button.
 */
import { formatPrice } from '~/utils/index'

defineProps<{
  subtotal: number
  shippingCost: number
  total: number
  disabled?: boolean
}>()

const location = useLocationStore()
</script>

<template>
  <div class="card sticky top-28 flex flex-col gap-4">
    <h2 class="text-lg font-bold text-gray-900">Resumen del pedido</h2>

    <!-- Delivery location -->
    <div v-if="location.hasValidLocation" class="rounded-lg bg-gray-50 p-3">
      <h3 class="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
        Envío a
      </h3>
      <div class="flex items-start gap-2">
        <svg class="mt-0.5 h-4 w-4 flex-shrink-0 text-[#0072E3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <div class="text-sm">
          <p class="font-semibold text-gray-900">{{ location.cityName }}</p>
          <p class="text-gray-600">{{ location.stateName }}</p>
        </div>
      </div>

      <div v-if="location.location?.deliveryDate" class="mt-2 flex items-center gap-2 border-t border-gray-200 pt-2">
        <svg class="h-4 w-4 flex-shrink-0 text-[#0072E3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p class="text-sm text-gray-600">{{ location.location.deliveryDate }}</p>
      </div>
    </div>

    <!-- Price breakdown -->
    <div class="space-y-2 border-t border-gray-200 pt-4">
      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-600">Subtotal</span>
        <span class="font-semibold text-gray-900">{{ formatPrice(subtotal) }}</span>
      </div>
      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-600">Envío</span>
        <span class="font-semibold text-gray-900">
          {{ shippingCost > 0 ? formatPrice(shippingCost) : 'Gratis' }}
        </span>
      </div>
    </div>

    <!-- Total -->
    <div class="flex items-center justify-between border-t border-gray-200 pt-4">
      <span class="text-lg font-bold text-gray-900">Total</span>
      <span class="text-2xl font-bold text-gray-900">{{ formatPrice(total) }}</span>
    </div>

    <!-- Checkout button -->
    <NuxtLink
      to="/checkout"
      class="btn-primary flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-base font-bold shadow-md transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
      :class="{ 'pointer-events-none opacity-60': disabled }"
    >
      <span>Continuar con la compra</span>
      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
    </NuxtLink>

    <!-- Security badges -->
    <div class="flex items-center justify-center gap-4 border-t border-gray-200 pt-4 text-xs text-gray-500">
      <div class="flex items-center gap-1">
        <svg class="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <span>Compra segura</span>
      </div>
      <div class="flex items-center gap-1">
        <svg class="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        <span>Pago protegido</span>
      </div>
    </div>
  </div>
</template>
