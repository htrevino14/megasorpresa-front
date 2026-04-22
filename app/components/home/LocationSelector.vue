<script setup lang="ts">
/**
 * LocationSelector – Card component for selecting Estado and Ciudad.
 *
 * Designed to be placed over the hero banner with a floating card style.
 * Saves selection to Pinia store and navigates to catalog.
 *
 * @emits none
 */
import { useLocationStore } from '~/stores/location'

const locationStore = useLocationStore()
const router = useRouter()

// Hardcoded data (to be replaced with API call in the future)
const estados = [
  { code: 'NL', name: 'Nuevo León' },
  { code: 'CDMX', name: 'Ciudad de México' },
  { code: 'JAL', name: 'Jalisco' },
]

const ciudadesPorEstado: Record<string, string[]> = {
  NL: ['Monterrey', 'San Pedro Garza García', 'Santa Catarina', 'Guadalupe'],
  CDMX: ['Benito Juárez', 'Miguel Hidalgo', 'Coyoacán', 'Cuauhtémoc'],
  JAL: ['Guadalajara', 'Zapopan', 'Tlaquepaque', 'Tonalá'],
}

const selectedEstado = ref('')
const selectedCiudad = ref('')
const showWarning = ref(false)

// Computed cities based on selected state
const availableCiudades = computed(() => {
  if (!selectedEstado.value) return []
  return ciudadesPorEstado[selectedEstado.value] || []
})

// Watch for estado changes to reset ciudad
watch(selectedEstado, () => {
  selectedCiudad.value = ''
})

// Validation
const isFormValid = computed(
  () => selectedEstado.value && selectedCiudad.value,
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

  const estadoObj = estados.find(e => e.code === selectedEstado.value)
  if (!estadoObj) return

  locationStore.setLocation({
    stateCode: selectedEstado.value,
    stateName: estadoObj.name,
    cityName: selectedCiudad.value,
  })

  // Navigate to catalog with location params
  router.push({
    path: '/catalog',
    query: {
      state: selectedEstado.value,
      city: selectedCiudad.value,
    },
  })
}
</script>

<template>
  <div class="mx-auto w-full max-w-4xl px-4">
    <!-- Warning Toast -->
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
        class="fixed right-4 top-4 z-50 max-w-sm rounded-lg bg-yellow-400 p-4 shadow-xl"
      >
        <p class="text-sm font-bold text-gray-900">
          ¡Espera! ¿A dónde quieres enviar? Elige una ciudad y te mostraremos los regalos disponibles ahí
        </p>
      </div>
    </Transition>

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
            v-model="selectedEstado"
            class="rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 shadow-sm transition focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
          >
            <option value="" disabled>
              Selecciona un estado
            </option>
            <option v-for="estado in estados" :key="estado.code" :value="estado.code">
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
            v-model="selectedCiudad"
            :disabled="!selectedEstado"
            class="rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 shadow-sm transition focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
          >
            <option value="" disabled>
              Selecciona una ciudad
            </option>
            <option v-for="ciudad in availableCiudades" :key="ciudad" :value="ciudad">
              {{ ciudad }}
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
