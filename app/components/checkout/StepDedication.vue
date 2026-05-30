<script setup lang="ts">
/**
 * CheckoutStepDedication – Paso 4: Dedicatoria y firma.
 *
 * Textarea para el mensaje opcional y un input para la firma.
 * Este paso siempre se puede saltar; el botón "Siguiente" nunca se
 * deshabilita.
 *
 * @emits next - Avanza al paso 5.
 */
defineEmits<{ next: [] }>()

const MAX_LENGTH = 250

const message = ref('')
const signature = ref('')

const remaining = computed(() => MAX_LENGTH - message.value.length)
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
        v-model="message"
        rows="4"
        :maxlength="MAX_LENGTH"
        placeholder="Para que sepas lo mucho que te quiero…"
        class="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100"
      />
      <p class="mt-1 text-right text-xs text-gray-400">
        {{ remaining }} caracteres restantes
      </p>
    </div>

    <div>
      <label for="dedication-signature" class="mb-1 block text-xs font-medium text-gray-500">
        Firma
      </label>
      <input
        id="dedication-signature"
        v-model="signature"
        type="text"
        placeholder="Con cariño, María"
        maxlength="60"
        class="w-full max-w-md rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100"
      />
    </div>

    <div class="flex justify-end pt-2">
      <button
        type="button"
        class="rounded-full bg-yellow-400 px-8 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-yellow-500"
        @click="$emit('next')"
      >
        Siguiente
      </button>
    </div>
  </div>
</template>
