<script setup lang="ts">
/**
 * CheckoutStepPayment – Paso 5: Método de pago + envío de la orden.
 *
 * @emits prev - Regresa al paso 4.
 */
import type { AxiosError } from 'axios'
import type { CheckoutErrors, CheckoutPayload, CheckoutResponse, OrderConfirmation } from '@@/types/index'
import { submitCheckout as postCheckout } from '~/api/checkout'

const emit = defineEmits<{
  prev: []
}>()

const checkout = useCheckoutStore()
const cart = useCartStore()
const payload = checkout.payload

interface PaymentOption {
  id: 'mercadopago' | 'oxxo'
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

const isValid = computed(() => payload.payment_method !== '' && payload.accepted_terms)

/** Estado de envío y errores de la petición. */
const isSubmitting = ref(false)
/** Alerta general (errores 500 u otros no relacionados a validación). */
const generalError = ref<string | null>(null)
/** Errores de validación 422 mapeados por campo (`campo` → mensajes). */
const validationErrors = reactive<CheckoutErrors>({})

/** Devuelve el primer mensaje de error de un campo, o null. */
function fieldError(field: string): string | null {
  const messages = validationErrors[field]
  return messages && messages.length > 0 ? messages[0] : null
}

/** Limpia los errores antes de un nuevo intento. */
function clearErrors() {
  generalError.value = null
  for (const key of Object.keys(validationErrors)) delete validationErrors[key]
  // Mantiene sincronizado el store para que los pasos anteriores también
  // limpien sus mensajes.
  checkout.clearErrors()
}

/**
 * Construye el payload plano con todos los datos recolectados en los pasos
 * anteriores y lo envía al backend.
 *
 * - Éxito (200/201): vacía el carrito y redirige a `/checkout/success`.
 * - 422: mapea los errores de Laravel a `validationErrors` para mostrarlos
 *   bajo cada input.
 * - Otro error (p.ej. 500): muestra una alerta general.
 */
async function submitCheckout() {
  if (!isValid.value || isSubmitting.value) return

  clearErrors()
  isSubmitting.value = true

  // 1. Reúne todos los datos de los pasos anteriores en un único objeto plano.
  const body: CheckoutPayload = {
    ...payload,
    subtotal: cart.cartSubtotal,
    total: cart.cartTotal,
  }

  try {
    // 2. Petición POST a través de la instancia de Axios.
    const { data } = await postCheckout(body)
    const order = (data as CheckoutResponse).data.order

    // 3a. Éxito: construye el snapshot de confirmación, vacía el carrito y redirige.
    const confirmation: OrderConfirmation = {
      order_id: order.id,
      tracking_number: order.tracking_number,
      status: order.status?.name ?? 'Pendiente',
      payment_method: payload.payment_method,
      subtotal: cart.cartSubtotal,
      shipping_cost: Number(order.shipping_cost ?? 0),
      total: cart.cartTotal,
      recipient_name: payload.recipient_name,
      phone: payload.recipient_phone,
      address_line: [payload.street, payload.ext_number].filter(Boolean).join(' ')
        + [payload.neighborhood, payload.zip_code].filter(Boolean).map(v => `, ${v}`).join(''),
      city_state: [checkout.labels.city, checkout.labels.state].filter(Boolean).join(', '),
      dwelling_type: payload.dwelling_type,
      references: payload.references,
      delivery_date: payload.delivery_date,
      delivery_slot_label: checkout.labels.deliverySlot,
      card_message: payload.card_message,
      signature: payload.signature,
      products: cart.cartItems.map(item => ({
        name: item.product.name,
        image: item.product.primary_image,
        sku: item.product.sku,
        quantity: item.quantity,
        unit_price: item.price_at_addition,
        line_total: item.price_at_addition * item.quantity,
      })),
    }
    checkout.saveConfirmation(confirmation)

    cart.clearCart()
    checkout.reset()
    await navigateTo('/checkout/success')
  }
  catch (err) {
    // 3b. Manejo de errores.
    const axiosErr = err as AxiosError<{ message?: string, errors?: CheckoutErrors }>
    const status = axiosErr.response?.status

    if (status === 422 && axiosErr.response?.data?.errors) {
      // Errores de validación: mapea cada campo para mostrarlo bajo su input.
      const errors = axiosErr.response.data.errors
      for (const [field, messages] of Object.entries(errors)) {
        validationErrors[field] = messages
      }
      // Propaga al store para que los pasos previos resalten sus campos.
      checkout.errors = errors
      generalError.value = axiosErr.response.data.message
        ?? 'Por favor corrige los campos marcados.'
    }
    else {
      // Error 500 u otros: alerta general.
      generalError.value = axiosErr.response?.data?.message
        ?? 'Ocurrió un error al procesar tu pedido. Intenta de nuevo más tarde.'
    }
  }
  finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="space-y-5">
    <p class="text-sm text-gray-600">
      Selecciona cómo deseas pagar tu pedido.
    </p>

    <!-- Alerta de error global (errores 500 u otros) -->
    <div
      v-if="generalError"
      class="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      role="alert"
    >
      <svg class="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86l-8.18 14.18A2 2 0 003.84 21h16.32a2 2 0 001.73-2.96L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
      <span>{{ generalError }}</span>
    </div>

    <div class="space-y-3">
      <label
        v-for="method in methods"
        :key="method.id"
        class="flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition"
        :class="
          payload.payment_method === method.id
            ? 'border-yellow-400 bg-yellow-50 ring-2 ring-yellow-100'
            : 'border-gray-200 bg-white hover:border-gray-300'
        "
      >
        <input
          v-model="payload.payment_method"
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
    <p v-if="fieldError('payment_method')" class="text-xs text-red-600">
      {{ fieldError('payment_method') }}
    </p>

    <label class="flex cursor-pointer items-start gap-2 pt-2 text-xs text-gray-600">
      <input
        v-model="payload.accepted_terms"
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
    <p v-if="fieldError('accepted_terms')" class="text-xs text-red-600">
      {{ fieldError('accepted_terms') }}
    </p>

    <div class="flex items-center justify-between pt-2">
      <button
        type="button"
        :disabled="isSubmitting"
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
        :disabled="!isValid || isSubmitting"
        class="inline-flex items-center gap-2 rounded-full bg-yellow-400 px-8 py-3 text-sm font-bold text-white shadow-md transition hover:bg-yellow-500 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
        @click="submitCheckout"
      >
        <svg
          v-if="isSubmitting"
          class="h-4 w-4 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        {{ isSubmitting ? 'Procesando…' : 'Confirmar pedido' }}
      </button>
    </div>
  </div>
</template>
