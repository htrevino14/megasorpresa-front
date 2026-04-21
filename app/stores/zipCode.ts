/**
 * ZIP code coverage Pinia store.
 *
 * Manages the user's validated postal code (Código Postal) so that other
 * parts of the app (e.g. checkout) can read the coverage status without
 * repeating the validation.
 *
 * @remarks
 * - The validated CP is persisted in `localStorage` under the key `validated_zip_code`.
 * - Call `restoreZipCode()` from a client-only plugin to rehydrate state
 *   safely without SSR mismatches.
 * - All localStorage access is guarded by `import.meta.client` to prevent
 *   SSR errors and wrapped in try-catch to handle SecurityError exceptions
 *   (e.g. when third-party cookies / storage are disabled by the browser).
 */
import { defineStore } from 'pinia'
import type { ZipCodeState } from '@@/types/index'

const STORAGE_KEY = 'validated_zip_code'

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

export const useZipCodeStore = defineStore('zipCode', {
  state: (): ZipCodeState => ({
    zipCode: '',
    isCovered: null,
    isValidated: false,
  }),

  getters: {
    /** Returns the saved CP string, or empty string if none. */
    savedZipCode: (state): string => state.zipCode,

    /** Returns true when the user has a validated and covered CP. */
    hasCoverage: (state): boolean => state.isValidated && state.isCovered === true,
  },

  actions: {
    /**
     * Restore the last validated ZIP code from localStorage.
     * Call this once on the client to avoid SSR hydration mismatches.
     */
    restoreZipCode(): void {
      const saved = safeGetItem(STORAGE_KEY)
      if (saved) {
        this.zipCode = saved
        this.isCovered = true
        this.isValidated = true
      }
    },

    /**
     * Save a validated ZIP code as covered.
     * @param zip - 5-digit ZIP code string.
     */
    setCoveredZip(zip: string): void {
      this.zipCode = zip
      this.isCovered = true
      this.isValidated = true
      safeSetItem(STORAGE_KEY, zip)
    },

    /**
     * Record that the entered ZIP code is NOT covered.
     * @param zip - 5-digit ZIP code string.
     */
    setUncoveredZip(zip: string): void {
      this.zipCode = zip
      this.isCovered = false
      this.isValidated = true
      safeRemoveItem(STORAGE_KEY)
    },

    /** Reset the validation state. */
    clearZipCode(): void {
      this.zipCode = ''
      this.isCovered = null
      this.isValidated = false
      safeRemoveItem(STORAGE_KEY)
    },
  },
})
