<script setup lang="ts">
/**
 * CheckoutStepRecipient – Paso 2: Datos del destinatario.
 *
 * Captura nombre y dirección completa del receptor del envío.
 * UI únicamente; sin llamadas al backend.
 *
 * @emits next - Avanza al paso 3.
 */
defineEmits<{ next: [] }>()

const recipient = reactive({
  fullName: '',
  phone: '',
  street: '',
  exteriorNumber: '',
  interiorNumber: '',
  neighborhood: '',
  zipCode: '',
  city: '',
  state: '',
  references: '',
})

const isValid = computed(() =>
  recipient.fullName.trim() !== ''
  && recipient.phone.trim() !== ''
  && recipient.street.trim() !== ''
  && recipient.exteriorNumber.trim() !== ''
  && recipient.zipCode.trim() !== ''
  && recipient.city.trim() !== ''
  && recipient.state.trim() !== '',
)
</script>

<template>
  <div class="space-y-5">
    <p class="text-sm text-gray-600">
      Ingresa los datos completos de la persona que recibirá el pedido.
    </p>

    <!-- Datos del destinatario -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div class="sm:col-span-2">
        <label for="r-name" class="mb-1 block text-xs font-medium text-gray-500">
          Nombre completo *
        </label>
        <input
          id="r-name"
          v-model="recipient.fullName"
          type="text"
          placeholder="Ej. María López"
          class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100"
        />
      </div>

      <div>
        <label for="r-phone" class="mb-1 block text-xs font-medium text-gray-500">
          Teléfono del destinatario *
        </label>
        <input
          id="r-phone"
          v-model="recipient.phone"
          type="tel"
          inputmode="numeric"
          placeholder="81 1234 5678"
          class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100"
        />
      </div>
    </div>

    <!-- Dirección -->
    <div class="border-t border-gray-100 pt-4">
      <h3 class="mb-3 text-sm font-semibold text-gray-700">Dirección de envío</h3>

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
            class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100"
          />
        </div>

        <div class="sm:col-span-1">
          <label for="r-ext" class="mb-1 block text-xs font-medium text-gray-500">
            Núm. ext *
          </label>
          <input
            id="r-ext"
            v-model="recipient.exteriorNumber"
            type="text"
            placeholder="123"
            class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100"
          />
        </div>

        <div class="sm:col-span-1">
          <label for="r-int" class="mb-1 block text-xs font-medium text-gray-500">
            Núm. int
          </label>
          <input
            id="r-int"
            v-model="recipient.interiorNumber"
            type="text"
            placeholder="A"
            class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100"
          />
        </div>

        <div class="sm:col-span-3">
          <label for="r-neighborhood" class="mb-1 block text-xs font-medium text-gray-500">
            Colonia
          </label>
          <input
            id="r-neighborhood"
            v-model="recipient.neighborhood"
            type="text"
            placeholder="Centro"
            class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100"
          />
        </div>

        <div class="sm:col-span-3">
          <label for="r-zip" class="mb-1 block text-xs font-medium text-gray-500">
            Código postal *
          </label>
          <input
            id="r-zip"
            v-model="recipient.zipCode"
            type="text"
            inputmode="numeric"
            placeholder="64000"
            maxlength="5"
            class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100"
          />
        </div>

        <div class="sm:col-span-3">
          <label for="r-city" class="mb-1 block text-xs font-medium text-gray-500">
            Ciudad *
          </label>
          <input
            id="r-city"
            v-model="recipient.city"
            type="text"
            placeholder="Monterrey"
            class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100"
          />
        </div>

        <div class="sm:col-span-3">
          <label for="r-state" class="mb-1 block text-xs font-medium text-gray-500">
            Estado *
          </label>
          <input
            id="r-state"
            v-model="recipient.state"
            type="text"
            placeholder="Nuevo León"
            class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100"
          />
        </div>

        <div class="sm:col-span-6">
          <label for="r-refs" class="mb-1 block text-xs font-medium text-gray-500">
            Referencias para la entrega
          </label>
          <textarea
            id="r-refs"
            v-model="recipient.references"
            rows="2"
            placeholder="Casa color blanco, portón negro..."
            class="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100"
          />
        </div>
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
