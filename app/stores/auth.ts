/**
 * Authentication Pinia store.
 *
 * Manages login, registration, logout and the current user session in
 * coordination with the Bearer token system exposed by megasorpresa-back.
 *
 * @remarks
 * - Token is persisted in `localStorage` under the key `auth_token`.
 * - The shared Axios instance (~/api) automatically reads this key and
 *   attaches the `Authorization` header on every outgoing request.
 * - Call `restoreSession()` from a client-only plugin to rehydrate state
 *   safely without SSR mismatches.
 * - All localStorage access is guarded by `import.meta.client` and wrapped
 *   in try-catch blocks following the same pattern as zipCode.ts.
 */
import { defineStore } from 'pinia'
import type { User, AuthResponse } from '@@/types/index'
import api from '~/api/index'

interface AuthState {
  /** Authenticated user, or `null` when logged out */
  user: User | null
  /** Raw Bearer token string, or `null` when logged out */
  token: string | null
}

const STORAGE_KEY = 'auth_token'

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

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    // Token is restored from localStorage in restoreSession() to avoid SSR mismatch.
    token: null,
  }),

  getters: {
    /** Returns `true` when a token is present in state. */
    isAuthenticated: (state): boolean => !!state.token,

    /** Returns `true` when the logged-in user has the `admin` role. */
    isAdmin: (state): boolean => state.user?.role === 'admin',
  },

  actions: {
    /**
     * Restore the session from localStorage.
     * Call this once on the client (e.g. from a client-only plugin) to avoid
     * SSR hydration mismatches when reading browser storage.
     */
    restoreSession(): void {
      const storedToken = safeGetItem(STORAGE_KEY)
      if (storedToken) {
        this.token = storedToken
      }
    },

    /**
     * Authenticate with the backend and store the token.
     * @param email - User email address.
     * @param password - Plain-text password (sent over HTTPS).
     */
    async login(email: string, password: string): Promise<void> {
      const { data } = await api.post<AuthResponse>('/auth/login', { email, password })
      this.token = data.token
      this.user = data.user
      safeSetItem(STORAGE_KEY, data.token)
    },

    /**
     * Register a new account and store the returned session token.
     * @param name - Full name of the new user.
     * @param email - User email address.
     * @param password - Plain-text password (sent over HTTPS).
     * @param passwordConfirmation - Must match `password`.
     */
    async register(
      name: string,
      email: string,
      password: string,
      passwordConfirmation: string,
    ): Promise<void> {
      const { data } = await api.post<AuthResponse>('/auth/register', {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      })
      this.token = data.token
      this.user = data.user
      safeSetItem(STORAGE_KEY, data.token)
    },

    /**
     * Invalidate the current session on the server and clear local state.
     */
    async logout(): Promise<void> {
      try {
        await api.post('/auth/logout')
      } finally {
        this.token = null
        this.user = null
        safeRemoveItem(STORAGE_KEY)
      }
    },

    /**
     * Fetch the authenticated user profile from the backend.
     * Call this on app mount to restore the session from a persisted token.
     */
    async fetchUser(): Promise<void> {
      const { data } = await api.get<User>('/auth/me')
      this.user = data
    },
  },
})
