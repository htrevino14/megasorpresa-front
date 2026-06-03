<script setup lang="ts">
/**
 * CheckoutStepSchedule – Paso 3: Fecha y horario de entrega.
 *
 * Las franjas horarias se cargan desde el backend (`/locations`) según la
 * ciudad elegida en el paso anterior (`payload.city_id`).
 *
 * @emits next - Avanza al paso 4.
 * @emits prev - Regresa al paso 2.
 */
import type { DeliverySlot } from '@@/types/index'
import { getDeliverySlotsByCity } from '~/api/locations'

const emit = defineEmits<{ next: [], prev: [] }>()

const checkout = useCheckoutStore()
const payload = checkout.payload

const slots = ref<DeliverySlot[]>([])
const loadingSlots = ref(false)

const tomorrow = new Date(Date.now() + 86_400_000).toISOString().split('T')[0]

if (!payload.delivery_date) {
  payload.delivery_date = tomorrow
}

/** Formatea el costo adicional de la franja (0 → "Sin costo"). */
function formatCost(cost: number | string): string {
  const value = typeof cost === 'string' ? Number.parseFloat(cost) : cost
  if (!value || value <= 0) return 'Sin costo de envío'
  return `+ $${value.toFixed(2)} de envío`
}

/** Carga las franjas de la ciudad seleccionada. */
async function loadSlots(cityId: number) {
  loadingSlots.value = true
  try {
    const { data } = await getDeliverySlotsByCity(cityId)
    slots.value = data.data
    // Si la franja seleccionada ya no existe para esta ciudad, la limpiamos.
    if (
      payload.delivery_slot_id !== null
      && !slots.value.some(s => s.id === payload.delivery_slot_id)
    ) {
      payload.delivery_slot_id = null
    }
  }
  catch {
    slots.value = []
  }
  finally {
    loadingSlots.value = false
  }
}

watch(
  () => payload.city_id,
  (cityId) => {
    slots.value = []
    payload.delivery_slot_id = null
    if (cityId !== null) loadSlots(cityId)
  },
  { immediate: true },
)

// Guarda la etiqueta legible de la franja para la pantalla de confirmación.
watch(
  [() => payload.delivery_slot_id, slots],
  ([slotId]) => {
    checkout.labels.deliverySlot = slots.value.find(s => s.id === slotId)?.label ?? ''
  },
)

const isValid = computed(() =>
  Boolean(payload.delivery_date) && payload.delivery_slot_id !== null,
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
        v-model="payload.delivery_date"
        type="date"
        :min="tomorrow"
        class="w-full max-w-xs rounded-lg border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
        :class="
          checkout.fieldError('delivery_date')
            ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
            : 'border-gray-300 focus:border-yellow-400 focus:ring-yellow-100'
        "
      />
      <p v-if="checkout.fieldError('delivery_date')" class="mt-1 text-xs text-red-600">
        {{ checkout.fieldError('delivery_date') }}
      </p>
    </div>

    <div>
      <span class="mb-2 block text-xs font-medium text-gray-500">
        Horario de entrega
      </span>

      <!-- Estado de carga -->
      <p v-if="loadingSlots" class="text-sm text-gray-400">
        Cargando horarios disponibles…
      </p>

      <!-- Sin ciudad seleccionada -->
      <p v-else-if="payload.city_id === null" class="text-sm text-gray-400">
        Vuelve al paso anterior y selecciona una ciudad para ver los horarios.
      </p>

      <!-- Sin franjas para la ciudad -->
      <p v-else-if="slots.length === 0" class="text-sm text-gray-400">
        No hay horarios de entrega disponibles para esta ciudad.
      </p>

      <div v-else class="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <button
          v-for="slot in slots"
          :key="slot.id"
          type="button"
          class="flex flex-col items-start gap-1 rounded-xl border-2 px-4 py-3 text-left transition"
          :class="
            payload.delivery_slot_id === slot.id
              ? 'border-yellow-400 bg-yellow-50 ring-2 ring-yellow-100'
              : 'border-gray-200 bg-white hover:border-gray-300'
          "
          @click="payload.delivery_slot_id = slot.id"
        >
          <span
            class="text-sm font-semibold"
            :class="payload.delivery_slot_id === slot.id ? 'text-yellow-700' : 'text-gray-900'"
          >
            {{ slot.label }}
          </span>
          <span class="text-xs text-gray-500">{{ formatCost(slot.additional_cost) }}</span>
        </button>
      </div>

      <p v-if="checkout.fieldError('delivery_slot_id')" class="mt-2 text-xs text-red-600">
        {{ checkout.fieldError('delivery_slot_id') }}
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
