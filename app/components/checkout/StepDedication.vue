<script setup lang="ts">
/**
 * CheckoutStepDedication – Paso 4: Dedicatoria y firma (opcional).
 *
 * @emits next - Avanza al paso 5.
 * @emits prev - Regresa al paso 3.
 */
const emit = defineEmits<{ next: [], prev: [] }>()

const checkout = useCheckoutStore()

const MAX_LENGTH = 250

const remaining = computed(() => MAX_LENGTH - checkout.payload.card_message.length)

function handleNext() {
  checkout.clearSectionErrors('dedication')
  emit('next')
}
</script>

<template>
  <div class="space-y-5">
    <p class="text-sm text-gray-600">
      Personaliza tu regalo con un mensaje. Lo imprimiremos en una tarjeta y la
      adjuntaremos al pedido.
    </p>

    <div>
      <label for="dedication-message" class="mb-1 block text-xs font-medium text-gray-500">
        Mensaje (opcional)
      </label>
      <textarea
        id="dedication-message"
        v-model="checkout.payload.card_message"
        rows="4"
        :maxlength="MAX_LENGTH"
        placeholder="Para que sepas lo mucho que te quiero…"
        class="w-full resize-none rounded-lg border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
        :class="
          checkout.fieldError('card_message')
            ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
            : 'border-gray-300 focus:border-yellow-400 focus:ring-yellow-100'
        "
      />
      <p class="mt-1 text-right text-xs text-gray-400">
        {{ remaining }} caracteres restantes
      </p>
      <p v-if="checkout.fieldError('card_message')" class="mt-1 text-xs text-red-600">
        {{ checkout.fieldError('card_message') }}
      </p>
    </div>

    <div>
      <label for="dedication-signature" class="mb-1 block text-xs font-medium text-gray-500">
        Firma
      </label>
      <input
        id="dedication-signature"
        v-model="checkout.payload.signature"
        type="text"
        placeholder="Con cariño, María"
        maxlength="60"
        class="w-full max-w-md rounded-lg border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
        :class="
          checkout.fieldError('signature')
            ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
            : 'border-gray-300 focus:border-yellow-400 focus:ring-yellow-100'
        "
      />
      <p v-if="checkout.fieldError('signature')" class="mt-1 text-xs text-red-600">
        {{ checkout.fieldError('signature') }}
      </p>
    </div>

    <div class="flex items-center justify-between pt-2">
      <button
        type="button"
        class="inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100"
        @click="emit('prev')"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Atrás
      </button>

      <button
        type="button"
        class="rounded-full bg-yellow-400 px-8 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-yellow-500"
        @click="handleNext"
      >
        Siguiente
      </button>
    </div>
  </div>
</template>
