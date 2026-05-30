<script setup lang="ts">
/**
 * CheckoutStepPhone – Paso 1: Confirmación de teléfono.
 *
 * Selector de lada + input de número. UI únicamente; no realiza llamadas
 * al backend.
 *
 * @emits next - Se emite al pulsar "Siguiente" para avanzar al paso 2.
 */
defineEmits<{ next: [] }>()

const countryCode = ref('+52')
const phoneNumber = ref('')

const isValid = computed(() => phoneNumber.value.replace(/\D/g, '').length >= 10)
</script>

<template>
  <div class="space-y-5">
    <p class="text-sm text-gray-600">
      Este es el teléfono que aparece en tu perfil.<br>
      Lo usaremos para comunicarnos contigo si hay algún inconveniente con el pedido.
    </p>

    <div class="flex gap-3">
      <!-- Country code -->
      <div class="w-24">
        <label for="country-code" class="mb-1 block text-xs font-medium text-gray-500">
          Lada
        </label>
        <select
          id="country-code"
          v-model="countryCode"
          class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100"
        >
          <option value="+52">+52</option>
          <option value="+1">+1</option>
          <option value="+34">+34</option>
        </select>
      </div>

      <!-- Phone -->
      <div class="flex-1">
        <label for="phone-number" class="mb-1 block text-xs font-medium text-gray-500">
          Número de teléfono
        </label>
        <input
          id="phone-number"
          v-model="phoneNumber"
          type="tel"
          inputmode="numeric"
          placeholder="81 1234 5678"
          class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100"
        />
      </div>
    </div>

    <div class="flex justify-end pt-2">
      <button
        type="button"
        :disabled="!isValid"
        class="rounded-full bg-yellow-400 px-8 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-yellow-500 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
        @click="$emit('next')"
      >
        Siguiente
      </button>
    </div>
  </div>
</template>
