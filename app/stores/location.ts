/**
 * Location coverage Pinia store.
 *
 * Manages the user's selected delivery location (Estado/Ciudad) so that
 * the catalog and other parts of the app can filter products based on
 * coverage availability.
 *
 * @remarks
 * - The selected location is persisted in a cookie under the key `selected_location`.
 * - Call `restoreLocation()` from a client-only plugin to rehydrate state
 *   safely without SSR mismatches.
 * - All cookie access is guarded by `import.meta.client` to prevent
 *   SSR errors and wrapped in try-catch to handle exceptions.
 */
import { defineStore } from 'pinia'
import type { Location, LocationState } from '@@/types/index'

const STORAGE_KEY = 'selected_location'

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

export const useLocationStore = defineStore('location', {
  state: (): LocationState => ({
    selectedLocation: null,
    isValidated: false,
  }),

  getters: {
    /** Returns the selected location, or null if none. */
    location: (state): Location | null => state.selectedLocation,

    /** Returns true when the user has a validated location. */
    hasValidLocation: (state): boolean => state.isValidated && state.selectedLocation !== null,

    /** Returns the state name if available */
    stateName: (state): string | null => state.selectedLocation?.stateName ?? null,

    /** Returns the city name if available */
    cityName: (state): string | null => state.selectedLocation?.cityName ?? null,
  },

  actions: {
    /**
     * Restore the last selected location from localStorage.
     * Call this once on the client to avoid SSR hydration mismatches.
     */
    restoreLocation(): void {
      const saved = safeGetItem(STORAGE_KEY)
      if (saved) {
        try {
          this.selectedLocation = JSON.parse(saved)
          this.isValidated = true
        } catch {
          // Invalid JSON, clear it
          safeRemoveItem(STORAGE_KEY)
        }
      }
    },

    /**
     * Save a selected location.
     * @param location - Location object with state and city.
     */
    setLocation(location: Location): void {
      this.selectedLocation = location
      this.isValidated = true
      safeSetItem(STORAGE_KEY, JSON.stringify(location))
    },

    /** Reset the location state. */
    clearLocation(): void {
      this.selectedLocation = null
      this.isValidated = false
      safeRemoveItem(STORAGE_KEY)
    },
  },
})
