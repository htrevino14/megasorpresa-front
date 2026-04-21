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
 */
import { defineStore } from 'pinia'
import type { ZipCodeState } from '@@/types/index'

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
      const saved = localStorage.getItem('validated_zip_code')
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
      localStorage.setItem('validated_zip_code', zip)
    },

    /**
     * Record that the entered ZIP code is NOT covered.
     * @param zip - 5-digit ZIP code string.
     */
    setUncoveredZip(zip: string): void {
      this.zipCode = zip
      this.isCovered = false
      this.isValidated = true
      localStorage.removeItem('validated_zip_code')
    },

    /** Reset the validation state. */
    clearZipCode(): void {
      this.zipCode = ''
      this.isCovered = null
      this.isValidated = false
      localStorage.removeItem('validated_zip_code')
    },
  },
})
