<script setup lang="ts">
/**
 * CheckoutSuccess – Pantalla de confirmación tras crear el pedido.
 *
 * Lee el snapshot del pedido guardado por el paso 5 en sessionStorage
 * (`useCheckoutStore().loadConfirmation()`) y lo presenta con la estructura
 * de una confirmación de compra: estado del pago, datos de envío, dedicatoria
 * y resumen de productos. Si no hay confirmación (acceso directo), redirige
 * al inicio.
 */
import type { OrderConfirmation } from '@@/types/index'

definePageMeta({ layout: 'landing' })

const checkout = useCheckoutStore()
const confirmation = ref<OrderConfirmation | null>(null)

onMounted(() => {
  confirmation.value = checkout.loadConfirmation()
  if (!confirmation.value) {
    navigateTo('/')
  }
})

/** Limpia el snapshot al salir para no mostrarlo en visitas posteriores. */
onBeforeUnmount(() => {
  checkout.clearConfirmation()
})

const paymentMethodLabel = computed(() => {
  switch (confirmation.value?.payment_method) {
    case 'mercadopago':
      return 'MercadoPago'
    case 'oxxo':
      return 'OXXO Pay'
    default:
      return 'Pago en línea'
  }
})

const paymentInstructions = computed(() => {
  switch (confirmation.value?.payment_method) {
    case 'oxxo':
      return 'Genera tu código y paga en efectivo en cualquier tienda OXXO. Tu pago se reflejará en unos minutos.'
    case 'mercadopago':
      return 'Completa tu pago de forma segura con tarjeta o saldo de MercadoPago. Tu pago se reflejará al instante.'
    default:
      return 'Completa tu pago para asegurar tu pedido.'
  }
})

useHead({ title: 'Pedido confirmado · MegaSorpresa' })
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gray-50">
    <LandingTheHeader />

    <main v-if="confirmation" class="flex-1 pb-16">
      <!-- ── Hero ───────────────────────────────────────────────────────── -->
    <section class="bg-yellow-400">
      <div class="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div class="flex items-start gap-4">
          <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/30">
            <svg class="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <div>
            <h1 class="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              ¡Tu regalo está reservado!
            </h1>
            <p class="mt-1 text-sm text-white/90 sm:text-base">
              Realiza el pago pronto para asegurar la sorpresa de
              <span class="font-semibold">{{ confirmation.recipient_name }}</span>.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Tarjeta principal ──────────────────────────────────────────── -->
    <div class="mx-auto -mt-6 max-w-5xl px-4 sm:px-6 lg:px-8">
      <div class="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
        <!-- Encabezado del pedido -->
        <div class="border-b border-gray-100 px-6 py-5">
          <h2 class="text-lg font-bold text-gray-900">
            Pedido #{{ confirmation.order_id }}
          </h2>
          <p class="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600">
            <span class="h-2 w-2 rounded-full bg-amber-500" />
            Pago pendiente
          </p>
        </div>

        <!-- Detalles del pago -->
        <div class="border-b border-gray-100 px-6 py-5">
          <h3 class="text-base font-bold text-gray-900">Detalles del pago</h3>
          <div class="mt-3 flex items-center gap-2">
            <span class="inline-flex items-center rounded-md bg-yellow-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-yellow-700 ring-1 ring-yellow-200">
              {{ paymentMethodLabel }}
            </span>
          </div>
          <p class="mt-3 text-sm text-gray-600">{{ paymentInstructions }}</p>

          <dl class="mt-4 space-y-1.5 text-sm">
            <div class="flex justify-between text-gray-600">
              <dt>Subtotal</dt>
              <dd>{{ formatPrice(confirmation.subtotal) }}</dd>
            </div>
            <div class="flex justify-between text-gray-600">
              <dt>Envío</dt>
              <dd>{{ confirmation.shipping_cost > 0 ? formatPrice(confirmation.shipping_cost) : 'Sin costo' }}</dd>
            </div>
            <div class="flex justify-between border-t border-gray-100 pt-2 text-base font-bold text-gray-900">
              <dt>Monto a pagar</dt>
              <dd>{{ formatPrice(confirmation.total) }}</dd>
            </div>
          </dl>

          <div class="mt-4 flex items-start gap-2 text-xs text-gray-500">
            <svg class="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>Recibirás los detalles del pago y seguimiento por correo electrónico.</span>
          </div>
        </div>

        <!-- Datos de envío + Dedicatoria -->
        <div class="grid gap-6 border-b border-gray-100 px-6 py-5 sm:grid-cols-2">
          <!-- Datos de envío -->
          <div>
            <h3 class="text-base font-bold text-gray-900">Datos de envío</h3>
            <div class="mt-3 space-y-2 text-sm text-gray-600">
              <p class="flex items-center gap-2 font-semibold text-gray-900">
                <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                {{ confirmation.recipient_name }}
              </p>
              <p>{{ confirmation.address_line }}</p>
              <p v-if="confirmation.city_state">{{ confirmation.city_state }}</p>
              <p v-if="confirmation.references" class="text-xs italic text-gray-500">
                Referencias: {{ confirmation.references }}
              </p>
              <p class="flex items-center gap-2">
                <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {{ confirmation.phone }}
              </p>
            </div>

            <div class="mt-4">
              <p class="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Fecha y horario
              </p>
              <p class="mt-1 text-sm text-gray-600">
                {{ formatDate(confirmation.delivery_date) }}
                <span v-if="confirmation.delivery_slot_label">· {{ confirmation.delivery_slot_label }}</span>
              </p>
            </div>
          </div>

          <!-- Dedicatoria -->
          <div>
            <h3 class="text-base font-bold text-gray-900">Dedicatoria</h3>
            <div class="mt-3 space-y-2 text-sm text-gray-600">
              <p :class="confirmation.card_message ? '' : 'italic text-gray-400'">
                {{ confirmation.card_message || 'Sin mensaje' }}
              </p>
              <p class="text-xs font-medium text-gray-500">
                {{ confirmation.signature ? `— ${confirmation.signature}` : 'Anónimo' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Productos -->
        <div class="px-6 py-5">
          <h3 class="text-base font-bold text-gray-900">Tus productos</h3>
          <ul class="mt-3 divide-y divide-gray-100">
            <li
              v-for="(product, index) in confirmation.products"
              :key="index"
              class="flex items-center gap-4 py-3"
            >
              <div class="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100 ring-1 ring-gray-200">
                <img
                  v-if="product.image"
                  :src="product.image"
                  :alt="product.name"
                  class="h-full w-full object-cover"
                />
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-semibold text-gray-900">{{ product.name }}</p>
                <p class="text-xs text-gray-500">Cantidad: {{ product.quantity }}</p>
                <p class="text-xs text-gray-400">SKU: {{ product.sku }}</p>
              </div>
              <p class="shrink-0 text-sm font-bold text-gray-900">
                {{ formatPrice(product.line_total) }}
              </p>
            </li>
          </ul>
        </div>
      </div>

      <!-- Acciones -->
      <div class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <NuxtLink to="/catalog" class="btn-secondary text-center">
          Seguir comprando
        </NuxtLink>
        <NuxtLink :to="`/order/${confirmation.order_id}`" class="btn-primary text-center">
          Ver detalles del pedido
        </NuxtLink>
      </div>
    </div>
    </main>

    <LandingTheFooter />
  </div>
</template>
