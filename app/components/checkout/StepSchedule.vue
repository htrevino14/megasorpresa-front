<script setup lang="ts">
/**
 * CheckoutStepSchedule – Paso 3: Fecha y horario de entrega.
 *
 * @emits next - Avanza al paso 4.
 * @emits prev - Regresa al paso 2.
 */
import type { CheckoutSchedule } from '@@/types/index'

const emit = defineEmits<{ next: [], prev: [] }>()

const checkout = useCheckoutStore()
const schedule = checkout.payload.schedule

interface DeliverySlot {
  id: NonNullable<CheckoutSchedule['delivery_slot']>
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

if (!schedule.delivery_date) {
  schedule.delivery_date = tomorrow
}

const isValid = computed(() =>
  Boolean(schedule.delivery_date) && schedule.delivery_slot !== null,
)

function handleNext() {
  checkout.clearSectionErrors('schedule')
  if (isValid.value) emit('next')
}
</script>

<template>
  <div class="space-y-5">
    <p class="text-sm text-gray-600">
      Elige el día y franja horaria en que quieres que llegue tu pedido.
    </p>

    <div>
      <label for="delivery-date" class="mb-1 block text-xs font-medium text-gray-500">
        Fecha de envío
      </label>
      <input
        id="delivery-date"
        v-model="schedule.delivery_date"
        type="date"
        :min="tomorrow"
        class="w-full max-w-xs rounded-lg border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
        :class="
          checkout.fieldError('schedule.delivery_date')
            ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
            : 'border-gray-300 focus:border-yellow-400 focus:ring-yellow-100'
        "
      />
      <p v-if="checkout.fieldError('schedule.delivery_date')" class="mt-1 text-xs text-red-600">
        {{ checkout.fieldError('schedule.delivery_date') }}
      </p>
    </div>

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
            schedule.delivery_slot === slot.id
              ? 'border-yellow-400 bg-yellow-50 ring-2 ring-yellow-100'
              : 'border-gray-200 bg-white hover:border-gray-300'
          "
          @click="schedule.delivery_slot = slot.id"
        >
          <span
            class="text-sm font-semibold"
            :class="schedule.delivery_slot === slot.id ? 'text-yellow-700' : 'text-gray-900'"
          >
            {{ slot.label }}
          </span>
          <span class="text-xs text-gray-500">{{ slot.range }}</span>
        </button>
      </div>
      <p v-if="checkout.fieldError('schedule.delivery_slot')" class="mt-2 text-xs text-red-600">
        {{ checkout.fieldError('schedule.delivery_slot') }}
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
        :disabled="!isValid"
        class="rounded-full bg-yellow-400 px-8 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-yellow-500 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
        @click="handleNext"
      >
        Siguiente
      </button>
    </div>
  </div>
</template>
