<script setup lang="ts">
/**
 * CheckoutStepPhone – Paso 1: Confirmación de teléfono.
 *
 * Bindea un único input directamente a `checkoutStore.payload.recipient_phone`.
 *
 * @emits next - Avanza al paso 2.
 */
const emit = defineEmits<{ next: [] }>()

const checkout = useCheckoutStore()

const isValid = computed(
  () => checkout.payload.recipient_phone.replace(/\D/g, '').length >= 10,
)

function handleNext() {
  checkout.clearSectionErrors('phone')
  if (isValid.value) emit('next')
}
</script>

<template>
  <div class="space-y-5">
    <p class="text-sm text-gray-600">
      Este es el teléfono que aparece en tu perfil.<br>
      Lo usaremos para comunicarnos contigo si hay algún inconveniente con el pedido.
    </p>

    <div>
      <label for="phone" class="mb-1 block text-xs font-medium text-gray-500">
        Número de teléfono *
      </label>
      <input
        id="phone"
        v-model="checkout.payload.recipient_phone"
        type="tel"
        inputmode="numeric"
        placeholder="+52 81 1234 5678"
        class="w-full max-w-md rounded-lg border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
        :class="
          checkout.fieldError('recipient_phone')
            ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
            : 'border-gray-300 focus:border-yellow-400 focus:ring-yellow-100'
        "
      />
      <p v-if="checkout.fieldError('recipient_phone')" class="mt-1 text-xs text-red-600">
        {{ checkout.fieldError('recipient_phone') }}
      </p>
    </div>

    <div class="flex justify-end pt-2">
      <button
        type="button"
        :disabled="!isValid"
        class="rounded-full bg-yellow-400 px-8 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-yellow-500 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
        @click="handleNext"
      >
        Siguiente
      </button>
    </div>
  </div>
</template>
