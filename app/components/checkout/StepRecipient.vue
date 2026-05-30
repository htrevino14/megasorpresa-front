<script setup lang="ts">
/**
 * CheckoutStepRecipient – Paso 2: Datos del destinatario.
 *
 * Bindea los inputs a `checkoutStore.payload.recipient`. Permite
 * regresar al paso anterior mediante el evento `prev`.
 *
 * @emits next - Avanza al paso 3.
 * @emits prev - Regresa al paso 1.
 */
const emit = defineEmits<{ next: [], prev: [] }>()

const checkout = useCheckoutStore()
const recipient = checkout.payload.recipient

const isValid = computed(() =>
  recipient.recipient_name.trim() !== ''
  && recipient.street.trim() !== ''
  && recipient.ext_number.trim() !== ''
  && recipient.neighborhood.trim() !== ''
  && recipient.zip_code.trim() !== '',
)

function handleNext() {
  checkout.clearSectionErrors('recipient')
  if (isValid.value) emit('next')
}

function inputClass(field: string): string {
  return checkout.fieldError(`recipient.${field}`)
    ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
    : 'border-gray-300 focus:border-yellow-400 focus:ring-yellow-100'
}
</script>

<template>
  <div class="space-y-5">
    <p class="text-sm text-gray-600">
      Ingresa los datos completos de la persona que recibirá el pedido.
    </p>

    <!-- Nombre -->
    <div>
      <label for="r-name" class="mb-1 block text-xs font-medium text-gray-500">
        Nombre del destinatario *
      </label>
      <input
        id="r-name"
        v-model="recipient.recipient_name"
        type="text"
        placeholder="Ej. María López"
        class="w-full rounded-lg border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
        :class="inputClass('recipient_name')"
      />
      <p v-if="checkout.fieldError('recipient.recipient_name')" class="mt-1 text-xs text-red-600">
        {{ checkout.fieldError('recipient.recipient_name') }}
      </p>
    </div>

    <!-- Dirección -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-6">
      <div class="sm:col-span-4">
        <label for="r-street" class="mb-1 block text-xs font-medium text-gray-500">
          Calle *
        </label>
        <input
          id="r-street"
          v-model="recipient.street"
          type="text"
          placeholder="Av. Constitución"
          class="w-full rounded-lg border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
          :class="inputClass('street')"
        />
        <p v-if="checkout.fieldError('recipient.street')" class="mt-1 text-xs text-red-600">
          {{ checkout.fieldError('recipient.street') }}
        </p>
      </div>

      <div class="sm:col-span-2">
        <label for="r-ext" class="mb-1 block text-xs font-medium text-gray-500">
          Núm. exterior *
        </label>
        <input
          id="r-ext"
          v-model="recipient.ext_number"
          type="text"
          placeholder="123"
          class="w-full rounded-lg border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
          :class="inputClass('ext_number')"
        />
        <p v-if="checkout.fieldError('recipient.ext_number')" class="mt-1 text-xs text-red-600">
          {{ checkout.fieldError('recipient.ext_number') }}
        </p>
      </div>

      <div class="sm:col-span-3">
        <label for="r-neighborhood" class="mb-1 block text-xs font-medium text-gray-500">
          Colonia *
        </label>
        <input
          id="r-neighborhood"
          v-model="recipient.neighborhood"
          type="text"
          placeholder="Centro"
          class="w-full rounded-lg border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
          :class="inputClass('neighborhood')"
        />
        <p v-if="checkout.fieldError('recipient.neighborhood')" class="mt-1 text-xs text-red-600">
          {{ checkout.fieldError('recipient.neighborhood') }}
        </p>
      </div>

      <div class="sm:col-span-3">
        <label for="r-zip" class="mb-1 block text-xs font-medium text-gray-500">
          Código postal *
        </label>
        <input
          id="r-zip"
          v-model="recipient.zip_code"
          type="text"
          inputmode="numeric"
          placeholder="64000"
          maxlength="5"
          class="w-full rounded-lg border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
          :class="inputClass('zip_code')"
        />
        <p v-if="checkout.fieldError('recipient.zip_code')" class="mt-1 text-xs text-red-600">
          {{ checkout.fieldError('recipient.zip_code') }}
        </p>
      </div>
    </div>

    <!-- Acciones: Atrás / Siguiente -->
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
        :disabled="!isValid"
        class="rounded-full bg-yellow-400 px-8 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-yellow-500 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
        @click="handleNext"
      >
        Siguiente
      </button>
    </div>
  </div>
</template>
