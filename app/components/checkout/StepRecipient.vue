<script setup lang="ts">
/**
 * CheckoutStepRecipient – Paso 2: Datos del destinatario y dirección.
 *
 * Bindea los inputs directamente a los campos planos de `checkout.payload`
 * (recipient_name, street, ext_number, neighborhood, dwelling_type,
 * zip_code, state_id, city_id, references). Estado y ciudad se cargan
 * desde el catálogo del backend (`/locations`) con selects dependientes.
 *
 * @emits next - Avanza al paso 3.
 * @emits prev - Regresa al paso 1.
 */
import type { CatalogState, CatalogCity, DwellingType } from '@@/types/index'
import { getStates, getCitiesByState } from '~/api/locations'

const emit = defineEmits<{ next: [], prev: [] }>()

const checkout = useCheckoutStore()
const payload = checkout.payload

const dwellingTypes: { value: DwellingType, label: string }[] = [
  { value: 'casa', label: 'Casa' },
  { value: 'departamento', label: 'Departamento' },
  { value: 'oficina', label: 'Oficina' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'restaurante', label: 'Restaurante' },
  { value: 'escuela', label: 'Escuela' },
  { value: 'hospital', label: 'Hospital' },
  { value: 'teatro', label: 'Teatro' },
  { value: 'plaza comercial', label: 'Plaza comercial' },
  { value: 'otro', label: 'Otro' },
]

const states = ref<CatalogState[]>([])
const cities = ref<CatalogCity[]>([])
const loadingStates = ref(false)
const loadingCities = ref(false)

/** Carga los estados al montar el paso. */
async function loadStates() {
  loadingStates.value = true
  try {
    const { data } = await getStates()
    states.value = data.data
  }
  catch {
    states.value = []
  }
  finally {
    loadingStates.value = false
  }
}

/** Carga las ciudades del estado seleccionado. */
async function loadCities(stateId: number) {
  loadingCities.value = true
  try {
    const { data } = await getCitiesByState(stateId)
    cities.value = data.data
  }
  catch {
    cities.value = []
  }
  finally {
    loadingCities.value = false
  }
}

onMounted(loadStates)

// Al cambiar de estado, recarga ciudades y resetea la ciudad seleccionada
// (salvo en la carga inicial, donde se conserva el valor ya elegido).
watch(
  () => payload.state_id,
  (stateId, previous) => {
    if (previous !== undefined) {
      payload.city_id = null
    }
    cities.value = []
    if (stateId !== null) loadCities(stateId)
  },
  { immediate: true },
)

// Guarda los nombres legibles del estado/ciudad para la pantalla de confirmación.
watch(
  [() => payload.state_id, states],
  ([stateId]) => {
    checkout.labels.state = states.value.find(s => s.id === stateId)?.name ?? ''
  },
)
watch(
  [() => payload.city_id, cities],
  ([cityId]) => {
    checkout.labels.city = cities.value.find(c => c.id === cityId)?.name ?? ''
  },
)

const isValid = computed(() =>
  payload.recipient_name.trim() !== ''
  && payload.street.trim() !== ''
  && payload.ext_number.trim() !== ''
  && payload.neighborhood.trim() !== ''
  && payload.dwelling_type !== ''
  && payload.zip_code.trim() !== ''
  && payload.state_id !== null
  && payload.city_id !== null,
)

function handleNext() {
  checkout.clearSectionErrors('recipient')
  if (isValid.value) emit('next')
}

function inputClass(field: string): string {
  return checkout.fieldError(field)
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
        v-model="payload.recipient_name"
        type="text"
        placeholder="Ej. María López"
        class="w-full rounded-lg border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
        :class="inputClass('recipient_name')"
      />
      <p v-if="checkout.fieldError('recipient_name')" class="mt-1 text-xs text-red-600">
        {{ checkout.fieldError('recipient_name') }}
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
          v-model="payload.street"
          type="text"
          placeholder="Av. Constitución"
          class="w-full rounded-lg border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
          :class="inputClass('street')"
        />
        <p v-if="checkout.fieldError('street')" class="mt-1 text-xs text-red-600">
          {{ checkout.fieldError('street') }}
        </p>
      </div>

      <div class="sm:col-span-2">
        <label for="r-ext" class="mb-1 block text-xs font-medium text-gray-500">
          Núm. exterior *
        </label>
        <input
          id="r-ext"
          v-model="payload.ext_number"
          type="text"
          placeholder="123"
          class="w-full rounded-lg border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
          :class="inputClass('ext_number')"
        />
        <p v-if="checkout.fieldError('ext_number')" class="mt-1 text-xs text-red-600">
          {{ checkout.fieldError('ext_number') }}
        </p>
      </div>

      <div class="sm:col-span-3">
        <label for="r-neighborhood" class="mb-1 block text-xs font-medium text-gray-500">
          Colonia *
        </label>
        <input
          id="r-neighborhood"
          v-model="payload.neighborhood"
          type="text"
          placeholder="Centro"
          class="w-full rounded-lg border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
          :class="inputClass('neighborhood')"
        />
        <p v-if="checkout.fieldError('neighborhood')" class="mt-1 text-xs text-red-600">
          {{ checkout.fieldError('neighborhood') }}
        </p>
      </div>

      <div class="sm:col-span-3">
        <label for="r-zip" class="mb-1 block text-xs font-medium text-gray-500">
          Código postal *
        </label>
        <input
          id="r-zip"
          v-model="payload.zip_code"
          type="text"
          inputmode="numeric"
          placeholder="64000"
          maxlength="5"
          class="w-full rounded-lg border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
          :class="inputClass('zip_code')"
        />
        <p v-if="checkout.fieldError('zip_code')" class="mt-1 text-xs text-red-600">
          {{ checkout.fieldError('zip_code') }}
        </p>
      </div>

      <!-- Tipo de domicilio -->
      <div class="sm:col-span-3">
        <label for="r-dwelling" class="mb-1 block text-xs font-medium text-gray-500">
          Tipo de domicilio *
        </label>
        <select
          id="r-dwelling"
          v-model="payload.dwelling_type"
          class="w-full rounded-lg border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
          :class="inputClass('dwelling_type')"
        >
          <option value="" disabled>Selecciona…</option>
          <option v-for="dt in dwellingTypes" :key="dt.value" :value="dt.value">
            {{ dt.label }}
          </option>
        </select>
        <p v-if="checkout.fieldError('dwelling_type')" class="mt-1 text-xs text-red-600">
          {{ checkout.fieldError('dwelling_type') }}
        </p>
      </div>

      <!-- Estado / Ciudad (catálogo del backend) -->
      <div class="sm:col-span-3">
        <label for="r-state" class="mb-1 block text-xs font-medium text-gray-500">
          Estado *
        </label>
        <select
          id="r-state"
          v-model.number="payload.state_id"
          :disabled="loadingStates"
          class="w-full rounded-lg border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-50"
          :class="inputClass('state_id')"
        >
          <option :value="null" disabled>
            {{ loadingStates ? 'Cargando…' : 'Selecciona un estado' }}
          </option>
          <option v-for="state in states" :key="state.id" :value="state.id">
            {{ state.name }}
          </option>
        </select>
        <p v-if="checkout.fieldError('state_id')" class="mt-1 text-xs text-red-600">
          {{ checkout.fieldError('state_id') }}
        </p>
      </div>

      <div class="sm:col-span-3">
        <label for="r-city" class="mb-1 block text-xs font-medium text-gray-500">
          Ciudad *
        </label>
        <select
          id="r-city"
          v-model.number="payload.city_id"
          :disabled="payload.state_id === null || loadingCities"
          class="w-full rounded-lg border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-50"
          :class="inputClass('city_id')"
        >
          <option :value="null" disabled>
            {{
              payload.state_id === null
                ? 'Primero elige un estado'
                : loadingCities
                  ? 'Cargando…'
                  : 'Selecciona una ciudad'
            }}
          </option>
          <option v-for="city in cities" :key="city.id" :value="city.id">
            {{ city.name }}
          </option>
        </select>
        <p v-if="checkout.fieldError('city_id')" class="mt-1 text-xs text-red-600">
          {{ checkout.fieldError('city_id') }}
        </p>
      </div>

      <!-- Referencias -->
      <div class="sm:col-span-6">
        <label for="r-references" class="mb-1 block text-xs font-medium text-gray-500">
          Referencias (opcional)
        </label>
        <textarea
          id="r-references"
          v-model="payload.references"
          rows="2"
          placeholder="Casa blanca con portón negro, entre calle X y calle Y…"
          class="w-full resize-none rounded-lg border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
          :class="inputClass('references')"
        />
        <p v-if="checkout.fieldError('references')" class="mt-1 text-xs text-red-600">
          {{ checkout.fieldError('references') }}
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
