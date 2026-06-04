<script setup lang="ts">
/**
 * LocationSelector – Card component for selecting Estado and Ciudad.
 *
 * Designed to be placed over the hero banner with a floating card style.
 * Loads states and cities from the locations API, saves the selection
 * (including the numeric city id) to the Pinia store and navigates to catalog.
 *
 * @emits none
 */
import { getStates, getCitiesByState } from '~/api/locations'
import { useLocationStore } from '~/stores/location'
import type { CatalogState, CatalogCity } from '@@/types/index'

const locationStore = useLocationStore()
const router = useRouter()

const selectedEstado = ref<number | ''>('')
const selectedCiudad = ref<number | ''>('')
const showWarning = ref(false)

// ── Remote data ───────────────────────────────────────────────────────────────
const { data: estados } = await useAsyncData<CatalogState[]>(
  'location-states',
  () => getStates().then(r => r.data.data),
  { default: () => [] },
)

const { data: ciudades, status: citiesStatus } = await useAsyncData<CatalogCity[]>(
  () => `location-cities-${selectedEstado.value || 'none'}`,
  () => {
    if (!selectedEstado.value) return Promise.resolve([])
    return getCitiesByState(selectedEstado.value).then(r => r.data.data)
  },
  { watch: [selectedEstado], default: () => [] },
)

const availableCiudades = computed<CatalogCity[]>(() => ciudades.value ?? [])
const isLoadingCities = computed(() => citiesStatus.value === 'pending')

// Reset selected city whenever the state changes
watch(selectedEstado, () => {
  selectedCiudad.value = ''
})

// Validation
const isFormValid = computed(
  () => selectedEstado.value !== '' && selectedCiudad.value !== '',
)

function handleSubmit() {
  if (!isFormValid.value) {
    // Show warning toast
    showWarning.value = true
    setTimeout(() => {
      showWarning.value = false
    }, 5000)
    return
  }

  const estadoObj = (estados.value ?? []).find(e => e.id === selectedEstado.value)
  const ciudadObj = availableCiudades.value.find(c => c.id === selectedCiudad.value)
  if (!estadoObj || !ciudadObj) return

  locationStore.setLocation({
    stateCode: String(estadoObj.id),
    stateName: estadoObj.name,
    cityName: ciudadObj.name,
    cityId: ciudadObj.id,
  })

  // Navigate to catalog with location params
  router.push({
    path: '/catalog',
    query: {
      state: String(estadoObj.id),
      city: String(ciudadObj.id),
    },
  })
}
</script>

<template>
  <!-- Warning Toast - Positioned at document level -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="translate-x-full opacity-0"
      enter-to-class="translate-x-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="translate-x-0 opacity-100"
      leave-to-class="translate-x-full opacity-0"
    >
      <div
        v-if="showWarning"
        class="fixed right-4 top-20 z-[9999] max-w-sm rounded-lg bg-yellow-400 p-4 shadow-2xl"
        role="alert"
      >
        <div class="flex items-start gap-3">
          <p class="flex-1 text-sm font-bold text-gray-900">
            ¡Espera! ¿A dónde quieres enviar? Elige una ciudad y te mostraremos los regalos disponibles ahí
          </p>
          <button
            type="button"
            class="flex-shrink-0 rounded-full p-1 hover:bg-yellow-500"
            @click="showWarning = false"
          >
            <svg class="h-4 w-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>

  <div class="mx-auto w-full max-w-4xl px-4">
    <div class="rounded-2xl bg-white p-6 shadow-2xl md:p-8">
      <!-- Title -->
      <h2 class="mb-6 text-center text-2xl font-bold text-gray-900 md:text-3xl">
        ¿A dónde quieres enviar?
      </h2>

      <!-- Form -->
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <!-- Estado Select -->
        <div class="flex flex-col">
          <label for="estado" class="mb-2 text-sm font-semibold text-gray-700">
            Estado
          </label>
          <select
            id="estado"
            v-model.number="selectedEstado"
            class="rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 shadow-sm transition focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
          >
            <option value="" disabled>
              Selecciona un estado
            </option>
            <option v-for="estado in estados" :key="estado.id" :value="estado.id">
              {{ estado.name }}
            </option>
          </select>
        </div>

        <!-- Ciudad Select -->
        <div class="flex flex-col">
          <label for="ciudad" class="mb-2 text-sm font-semibold text-gray-700">
            Ciudad
          </label>
          <select
            id="ciudad"
            v-model.number="selectedCiudad"
            :disabled="!selectedEstado || isLoadingCities"
            class="rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 shadow-sm transition focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
          >
            <option value="" disabled>
              {{ isLoadingCities ? 'Cargando ciudades…' : 'Selecciona una ciudad' }}
            </option>
            <option v-for="ciudad in availableCiudades" :key="ciudad.id" :value="ciudad.id">
              {{ ciudad.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="mt-6 text-center">
        <button
          type="button"
          class="w-full rounded-full bg-yellow-400 px-8 py-4 text-lg font-bold text-gray-900 shadow-lg transition-all hover:bg-yellow-300 active:scale-95 md:w-auto"
          @click="handleSubmit"
        >
          Ver juguetes
        </button>
      </div>
    </div>
  </div>
</template>
