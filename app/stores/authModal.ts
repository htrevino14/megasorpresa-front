/**
 * Auth Modal Pinia store.
 *
 * Controls the global auth modal overlay (login / register forms).
 * Call `open('login')` or `open('register')` from any component to display
 * the modal on top of the current page without navigating away.
 */
import { defineStore } from 'pinia'

type AuthModalMode = 'login' | 'register'

interface AuthModalState {
  /** Whether the modal is currently visible */
  isOpen: boolean
  /** Which form to display inside the modal */
  mode: AuthModalMode
}

export const useAuthModalStore = defineStore('authModal', {
  state: (): AuthModalState => ({
    isOpen: false,
    mode: 'login',
  }),

  actions: {
    /** Open the modal in the specified mode (default: login). */
    open(mode: AuthModalMode = 'login'): void {
      this.mode = mode
      this.isOpen = true
    },

    /** Close the modal and reset form mode to login. */
    close(): void {
      this.isOpen = false
    },

    /** Switch between login and register forms inside the open modal. */
    switchMode(): void {
      this.mode = this.mode === 'login' ? 'register' : 'login'
    },
  },
})
