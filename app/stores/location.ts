/**
 * Location coverage Pinia store (Composition API / setup store).
 *
 * Manages the user's selected delivery city (Estado/Ciudad) so that the
 * catalog and other parts of the app can filter products based on coverage
 * availability. Selecting a city is mandatory before browsing the catalog.
 *
 * @remarks
 * - `selectedCityId` is the source of truth for catalog filtering.
 * - State is persisted in `localStorage` (`selected_city_id` + `selected_location`)
 *   so the chosen city survives full page reloads.
 * - Call `restoreLocation()` from a client-only plugin to rehydrate state
 *   safely without SSR hydration mismatches.
 * - All localStorage access is guarded by `import.meta.client` to prevent
 *   SSR errors and wrapped in try-catch to handle SecurityError exceptions
 *   (e.g. when third-party cookies / storage are disabled by the browser).
 */
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Location } from '@@/types/index'

const STORAGE_KEY = 'selected_location'
const CITY_KEY = 'selected_city_id'

function safeGetItem(key: string): string | null {
  if (!import.meta.client) return null
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSetItem(key: string, value: string): void {
  if (!import.meta.client) return
  try {
    localStorage.setItem(key, value)
  } catch {
    // Silently ignore quota or security errors
  }
}

function safeRemoveItem(key: string): void {
  if (!import.meta.client) return
  try {
    localStorage.removeItem(key)
  } catch {
    // Silently ignore security errors
  }
}

export const useLocationStore = defineStore('location', () => {
  // ── State ─────────────────────────────────────────────────────────────────
  /** Numeric id of the selected city. Source of truth for catalog filtering. */
  const selectedCityId = ref<number | null>(null)
  /** Full selected location (state + city names), when available. */
  const selectedLocation = ref<Location | null>(null)
  /** Whether the user has confirmed a city selection. */
  const isValidated = ref(false)
  /** Whether the forced city-selection modal is currently visible. */
  const showCityModal = ref(false)

  // ── Getters ───────────────────────────────────────────────────────────────
  /** Returns the selected location object, or null if none. */
  const location = computed<Location | null>(() => selectedLocation.value)

  /** Returns true when the user has a validated location. */
  const hasValidLocation = computed<boolean>(
    () => isValidated.value && selectedCityId.value !== null,
  )

  /** Returns the state name if available. */
  const stateName = computed<string | null>(() => selectedLocation.value?.stateName ?? null)

  /** Returns the city name if available. */
  const cityName = computed<string | null>(() => selectedLocation.value?.cityName ?? null)

  /** Returns the numeric city id used to filter the catalog, or null. */
  const cityId = computed<number | null>(
    () => selectedCityId.value ?? selectedLocation.value?.cityId ?? null,
  )

  // ── Actions ───────────────────────────────────────────────────────────────
  /**
   * Select a city by its numeric id and persist it.
   * @param id - Numeric city id used to filter the catalog by availability zone.
   */
  function setCity(id: number): void {
    selectedCityId.value = id
    isValidated.value = true
    showCityModal.value = false
    safeSetItem(CITY_KEY, String(id))

    // Keep the full location in sync when one is already selected.
    if (selectedLocation.value) {
      selectedLocation.value = { ...selectedLocation.value, cityId: id }
      safeSetItem(STORAGE_KEY, JSON.stringify(selectedLocation.value))
    }
  }

  /** Returns true when a city has been selected. */
  function hasCitySelected(): boolean {
    return selectedCityId.value !== null
  }

  /** Force the city-selection modal open (used by the navigation guard). */
  function openCityModal(): void {
    showCityModal.value = true
  }

  /** Close the city-selection modal. */
  function closeCityModal(): void {
    showCityModal.value = false
  }

  /**
   * Save a full selected location (state + city). Keeps `selectedCityId` in sync.
   * @param newLocation - Location object with state and city.
   */
  function setLocation(newLocation: Location): void {
    selectedLocation.value = newLocation
    selectedCityId.value = newLocation.cityId ?? null
    isValidated.value = true
    showCityModal.value = false

    safeSetItem(STORAGE_KEY, JSON.stringify(newLocation))
    if (newLocation.cityId != null) {
      safeSetItem(CITY_KEY, String(newLocation.cityId))
    }
  }

  /**
   * Restore the last selected location from localStorage.
   * Call this once on the client to avoid SSR hydration mismatches.
   */
  function restoreLocation(): void {
    const savedCity = safeGetItem(CITY_KEY)
    if (savedCity !== null) {
      const parsed = Number(savedCity)
      if (!Number.isNaN(parsed)) {
        selectedCityId.value = parsed
        isValidated.value = true
      }
    }

    const saved = safeGetItem(STORAGE_KEY)
    if (saved) {
      try {
        selectedLocation.value = JSON.parse(saved) as Location
        isValidated.value = true
        if (selectedCityId.value === null && selectedLocation.value?.cityId != null) {
          selectedCityId.value = selectedLocation.value.cityId
        }
      } catch {
        // Invalid JSON, clear it
        safeRemoveItem(STORAGE_KEY)
      }
    }
  }

  /** Reset the location state. */
  function clearLocation(): void {
    selectedCityId.value = null
    selectedLocation.value = null
    isValidated.value = false
    safeRemoveItem(STORAGE_KEY)
    safeRemoveItem(CITY_KEY)
  }

  return {
    // State
    selectedCityId,
    selectedLocation,
    isValidated,
    showCityModal,
    // Getters
    location,
    hasValidLocation,
    stateName,
    cityName,
    cityId,
    // Actions
    setCity,
    hasCitySelected,
    setLocation,
    openCityModal,
    closeCityModal,
    restoreLocation,
    clearLocation,
  }
})
