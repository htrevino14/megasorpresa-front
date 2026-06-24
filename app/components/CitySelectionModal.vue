<script setup lang="ts">
/**
 * CitySelectionModal – Forced, non-dismissible city selector overlay.
 *
 * Rendered once globally (in app.vue, inside <ClientOnly>). It is controlled by
 * `useLocationStore().showCityModal`, which the navigation guard turns on when a
 * user reaches the catalog without a selected city.
 *
 * The modal is intentionally "forced":
 *  - no close button,
 *  - static backdrop (clicking it does nothing),
 *  - Escape key is ignored.
 *
 * Choosing a city calls `setCity(id)` (plus `setLocation` for display names),
 * which closes the modal and makes the catalog underneath react and load
 * products for that city.
 *
 * @emits none
 */
import { getStates, getCitiesByState } from '~/api/locations'
import { useLocationStore } from '~/stores/location'
import type { CatalogState, CatalogCity } from '@@/types/index'

const location = useLocationStore()

// ── Form state ────────────────────────────────────────────────────────────────
const estados = ref<CatalogState[]>([])
const ciudades = ref<CatalogCity[]>([])
const selectedEstado = ref<number | ''>('')
const selectedCiudad = ref<number | ''>('')
const loadingStates = ref(false)
const loadingCities = ref(false)

const isFormValid = computed(
  () => selectedEstado.value !== '' && selectedCiudad.value !== '',
)

// ── Remote data (lazy: only fetched when the modal opens) ─────────────────────
async function loadStates(): Promise<void> {
  if (estados.value.length > 0) return
  loadingStates.value = true
  try {
    const { data } = await getStates()
    estados.value = data.data
  } catch {
    estados.value = []
  } finally {
    loadingStates.value = false
  }
}

async function loadCities(stateId: number): Promise<void> {
  loadingCities.value = true
  ciudades.value = []
  try {
    const { data } = await getCitiesByState(stateId)
    ciudades.value = data.data
  } catch {
    ciudades.value = []
  } finally {
    loadingCities.value = false
  }
}

// Load states the first time the modal becomes visible, and lock body scroll.
watch(
  () => location.showCityModal,
  (open) => {
    if (open) loadStates()
    if (import.meta.client) {
      document.body.style.overflow = open ? 'hidden' : ''
    }
  },
  { immediate: true },
)

// When the state changes, reset the city and load the new state's cities.
watch(selectedEstado, (stateId) => {
  selectedCiudad.value = ''
  ciudades.value = []
  if (stateId !== '') loadCities(Number(stateId))
})

onUnmounted(() => {
  if (import.meta.client) document.body.style.overflow = ''
})

// ── Selection ─────────────────────────────────────────────────────────────────
function handleSelect(): void {
  if (!isFormValid.value) return

  const estadoObj = estados.value.find(e => e.id === selectedEstado.value)
  const ciudadObj = ciudades.value.find(c => c.id === selectedCiudad.value)
  if (!estadoObj || !ciudadObj) return

  // Store the human-readable names so the catalog header can show the city...
  location.setLocation({
    stateCode: String(estadoObj.id),
    stateName: estadoObj.name,
    cityName: ciudadObj.name,
    cityId: ciudadObj.id,
  })

  // ...and run the explicit city selection the catalog watches to load products.
  // This also flips `showCityModal` to false, closing this overlay.
  location.setCity(ciudadObj.id)
}
</script>

<template>
  <Teleport to="body">
    <!-- Single transition on the container only. The card renders directly
         inside (no nested Transition / no second `v-if`) so the teleported
         node always detaches cleanly when `showCityModal` becomes false. The
         `modal-pop` classes add a subtle scale/translate to the card that is
         driven by this same enter/leave cycle via descendant CSS. -->
    <Transition
      enter-active-class="modal-enter-active"
      enter-from-class="modal-from"
      enter-to-class="modal-to"
      leave-active-class="modal-leave-active"
      leave-from-class="modal-to"
      leave-to-class="modal-from"
    >
      <div
        v-if="location.showCityModal"
        class="fixed inset-0 z-[9999] flex items-center justify-center px-4"
        role="dialog"
        aria-modal="true"
        aria-label="Selecciona tu ciudad"
      >
        <!-- Static backdrop: no click handler, cannot be dismissed -->
        <div
          class="absolute inset-0 bg-black/60 backdrop-blur-sm"
          aria-hidden="true"
        />

        <div
          class="modal-card relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl md:p-8"
        >
            <!-- Heading -->
            <div class="mb-6 text-center">
              <span class="text-4xl" aria-hidden="true">📍</span>
              <h2 class="mt-3 text-2xl font-bold text-gray-800 md:text-3xl">
                ¿A dónde quieres enviar?
              </h2>
              <p class="mt-1 text-sm text-gray-500">
                Elige tu ciudad para mostrarte los regalos disponibles ahí.
              </p>
            </div>

            <!-- Form -->
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <!-- Estado -->
              <div class="flex flex-col">
                <label for="city-modal-estado" class="mb-2 text-sm font-semibold text-gray-700">
                  Estado
                </label>
                <select
                  id="city-modal-estado"
                  v-model.number="selectedEstado"
                  :disabled="loadingStates"
                  class="rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 shadow-sm transition focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <option value="" disabled>
                    {{ loadingStates ? 'Cargando estados…' : 'Selecciona un estado' }}
                  </option>
                  <option v-for="estado in estados" :key="estado.id" :value="estado.id">
                    {{ estado.name }}
                  </option>
                </select>
              </div>

              <!-- Ciudad -->
              <div class="flex flex-col">
                <label for="city-modal-ciudad" class="mb-2 text-sm font-semibold text-gray-700">
                  Ciudad
                </label>
                <select
                  id="city-modal-ciudad"
                  v-model.number="selectedCiudad"
                  :disabled="!selectedEstado || loadingCities"
                  class="rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 shadow-sm transition focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <option value="" disabled>
                    {{ loadingCities ? 'Cargando ciudades…' : 'Selecciona una ciudad' }}
                  </option>
                  <option v-for="ciudad in ciudades" :key="ciudad.id" :value="ciudad.id">
                    {{ ciudad.name }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Submit -->
            <div class="mt-6 text-center">
              <button
                type="button"
                :disabled="!isFormValid"
                class="w-full rounded-full bg-yellow-400 px-8 py-4 text-lg font-bold text-gray-900 shadow-lg transition-all hover:bg-yellow-300 active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
                @click="handleSelect"
              >
                Ver juguetes
              </button>
              <p v-if="!isFormValid" class="mt-3 text-xs text-gray-400">
                Selecciona tu estado y ciudad para continuar.
              </p>
            </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Container fade (driven by Vue's transition classes on the overlay div). */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-leave-active {
  transition-duration: 0.15s;
}
.modal-from {
  opacity: 0;
}
.modal-to {
  opacity: 1;
}

/* Card "pop": animated purely via descendant selectors off the same
   enter/leave cycle, so there is no nested <Transition> to orphan the node. */
.modal-card {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease;
}
.modal-from .modal-card {
  opacity: 0;
  transform: translateY(8px) scale(0.96);
}
.modal-to .modal-card {
  opacity: 1;
  transform: translateY(0) scale(1);
}
</style>
