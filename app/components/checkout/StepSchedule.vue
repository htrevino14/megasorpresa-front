<script setup lang="ts">
/**
 * CheckoutStepSchedule – Paso 3: Fecha y horario de entrega.
 *
 * Selector de fecha (input date) y bloques de horario predefinidos.
 * UI únicamente; los slots son estáticos por ahora.
 *
 * @emits next - Avanza al paso 4.
 */
defineEmits<{ next: [] }>()

interface DeliverySlot {
  id: string
  label: string
  range: string
}

const slots: DeliverySlot[] = [
  { id: 'morning', label: 'Mañana', range: '9:00 – 12:00' },
  { id: 'noon', label: 'Mediodía', range: '12:00 – 15:00' },
  { id: 'afternoon', label: 'Tarde', range: '15:00 – 18:00' },
  { id: 'evening', label: 'Noche', range: '18:00 – 21:00' },
]

const tomorrow = new Date(Date.now() + 86_400_000).toISOString().split('T')[0]
const selectedDate = ref<string>(tomorrow)
const selectedSlot = ref<string | null>(null)

const isValid = computed(() => Boolean(selectedDate.value) && selectedSlot.value !== null)
</script>

<template>
  <div class="space-y-5">
    <p class="text-sm text-gray-600">
      Elige el día y franja horaria en que quieres que llegue tu pedido.
    </p>

    <!-- Fecha -->
    <div>
      <label for="delivery-date" class="mb-1 block text-xs font-medium text-gray-500">
        Fecha de envío
      </label>
      <input
        id="delivery-date"
        v-model="selectedDate"
        type="date"
        :min="tomorrow"
        class="w-full max-w-xs rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100"
      />
    </div>

    <!-- Slots -->
    <div>
      <span class="mb-2 block text-xs font-medium text-gray-500">
        Horario de entrega
      </span>
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <button
          v-for="slot in slots"
          :key="slot.id"
          type="button"
          class="flex flex-col items-start gap-1 rounded-xl border-2 px-4 py-3 text-left transition"
          :class="
            selectedSlot === slot.id
              ? 'border-yellow-400 bg-yellow-50 ring-2 ring-yellow-100'
              : 'border-gray-200 bg-white hover:border-gray-300'
          "
          @click="selectedSlot = slot.id"
        >
          <span
            class="text-sm font-semibold"
            :class="selectedSlot === slot.id ? 'text-yellow-700' : 'text-gray-900'"
          >
            {{ slot.label }}
          </span>
          <span class="text-xs text-gray-500">{{ slot.range }}</span>
        </button>
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
