<script setup lang="ts">
/**
 * CheckoutStepPayment – Paso 5: Método de pago + envío de la orden.
 *
 * @emits prev    - Regresa al paso 4.
 * @emits success - Emite cuando la orden se crea con éxito.
 */
import type { CheckoutPayment } from '@@/types/index'

const emit = defineEmits<{
  prev: []
  success: [payload: { orderId: number, trackingNumber: string, paymentUrl: string | null }]
}>()

const checkout = useCheckoutStore()
const payment = checkout.payload.payment

interface PaymentOption {
  id: NonNullable<CheckoutPayment['method']>
  name: string
  description: string
  badge: string
  badgeClass: string
}

const methods: PaymentOption[] = [
  {
    id: 'mercadopago',
    name: 'MercadoPago',
    description: 'Tarjeta de crédito, débito o saldo de MercadoPago.',
    badge: 'Recomendado',
    badgeClass: 'bg-blue-100 text-blue-700',
  },
  {
    id: 'oxxo',
    name: 'OXXO Pay',
    description: 'Genera un código y paga en efectivo en tu OXXO más cercano.',
    badge: 'Efectivo',
    badgeClass: 'bg-amber-100 text-amber-700',
  },
]

const isValid = computed(() => payment.method !== null && payment.accepted_terms)

async function handleConfirm() {
  if (!isValid.value || checkout.isSubmitting) return

  const ok = await checkout.submitOrder()
  if (ok && checkout.orderId !== null && checkout.trackingNumber !== null) {
    emit('success', {
      orderId: checkout.orderId,
      trackingNumber: checkout.trackingNumber,
      paymentUrl: checkout.paymentUrl,
    })
  }
}
</script>

<template>
  <div class="space-y-5">
    <p class="text-sm text-gray-600">
      Selecciona cómo deseas pagar tu pedido.
    </p>

    <!-- Alerta de error global (422 u otros) -->
    <div
      v-if="checkout.serverError"
      class="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      role="alert"
    >
      <svg class="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86l-8.18 14.18A2 2 0 003.84 21h16.32a2 2 0 001.73-2.96L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
      <span>{{ checkout.serverError }}</span>
    </div>

    <div class="space-y-3">
      <label
        v-for="method in methods"
        :key="method.id"
        class="flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition"
        :class="
          payment.method === method.id
            ? 'border-yellow-400 bg-yellow-50 ring-2 ring-yellow-100'
            : 'border-gray-200 bg-white hover:border-gray-300'
        "
      >
        <input
          v-model="payment.method"
          type="radio"
          :value="method.id"
          class="mt-1 h-4 w-4 cursor-pointer accent-yellow-400"
        />
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <span class="text-sm font-semibold text-gray-900">{{ method.name }}</span>
            <span class="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide" :class="method.badgeClass">
              {{ method.badge }}
            </span>
          </div>
          <p class="mt-1 text-xs text-gray-500">{{ method.description }}</p>
        </div>
      </label>
    </div>
    <p v-if="checkout.fieldError('payment.method')" class="text-xs text-red-600">
      {{ checkout.fieldError('payment.method') }}
    </p>

    <label class="flex cursor-pointer items-start gap-2 pt-2 text-xs text-gray-600">
      <input
        v-model="payment.accepted_terms"
        type="checkbox"
        class="mt-0.5 h-4 w-4 cursor-pointer accent-yellow-400"
      />
      <span>
        Acepto los
        <NuxtLink to="/terminos" class="font-semibold text-yellow-600 hover:underline">
          Términos y condiciones
        </NuxtLink>
        y el
        <NuxtLink to="/privacidad" class="font-semibold text-yellow-600 hover:underline">
          Aviso de privacidad
        </NuxtLink>.
      </span>
    </label>
    <p v-if="checkout.fieldError('payment.accepted_terms')" class="text-xs text-red-600">
      {{ checkout.fieldError('payment.accepted_terms') }}
    </p>

    <div class="flex items-center justify-between pt-2">
      <button
        type="button"
        :disabled="checkout.isSubmitting"
        class="inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
        @click="emit('prev')"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Atrás
      </button>

      <button
        type="button"
        :disabled="!isValid || checkout.isSubmitting"
        class="inline-flex items-center gap-2 rounded-full bg-yellow-400 px-8 py-3 text-sm font-bold text-white shadow-md transition hover:bg-yellow-500 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
        @click="handleConfirm"
      >
        <svg
          v-if="checkout.isSubmitting"
          class="h-4 w-4 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        {{ checkout.isSubmitting ? 'Procesando…' : 'Confirmar pedido' }}
      </button>
    </div>
  </div>
</template>
