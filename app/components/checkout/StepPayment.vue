<script setup lang="ts">
/**
 * CheckoutStepPayment – Paso 5: Método de pago.
 *
 * Selección entre MercadoPago y OXXO Pay. Sólo estructura visual:
 * la integración real se hará en una iteración posterior.
 *
 * @emits next - Confirmación final del pedido.
 */
defineEmits<{ next: [] }>()

type PaymentMethod = 'mercadopago' | 'oxxo'

interface PaymentOption {
  id: PaymentMethod
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

const selectedMethod = ref<PaymentMethod | null>(null)
const acceptedTerms = ref(false)

const isValid = computed(() => selectedMethod.value !== null && acceptedTerms.value)
</script>

<template>
  <div class="space-y-5">
    <p class="text-sm text-gray-600">
      Selecciona cómo deseas pagar tu pedido.
    </p>

    <div class="space-y-3">
      <label
        v-for="method in methods"
        :key="method.id"
        class="flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition"
        :class="
          selectedMethod === method.id
            ? 'border-yellow-400 bg-yellow-50 ring-2 ring-yellow-100'
            : 'border-gray-200 bg-white hover:border-gray-300'
        "
      >
        <input
          v-model="selectedMethod"
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

    <!-- Términos -->
    <label class="flex cursor-pointer items-start gap-2 pt-2 text-xs text-gray-600">
      <input
        v-model="acceptedTerms"
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

    <div class="flex justify-end pt-2">
      <button
        type="button"
        :disabled="!isValid"
        class="rounded-full bg-yellow-400 px-8 py-3 text-sm font-bold text-white shadow-md transition hover:bg-yellow-500 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
        @click="$emit('next')"
      >
        Confirmar pedido
      </button>
    </div>
  </div>
</template>
