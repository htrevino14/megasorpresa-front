import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
  withCredentials: true,
  // Desde axios 1.x, el header X-XSRF-TOKEN sólo se envía same-origin a menos
  // que se habilite explícitamente. Como front (:3000) y back (:8080) son
  // cross-origin, ESTO ES OBLIGATORIO para que Sanctum acepte POST/PUT/DELETE.
  withXSRFToken: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

/**
 * Persistencia del token de carrito de invitado (X-Cart-Token).
 *
 * El backend identifica el carrito de un invitado mediante un UUID que envía
 * en el header `X-Cart-Token` de cada respuesta. Si no lo reenviamos en las
 * siguientes peticiones, el backend crea un carrito (y sesión) nuevo cada vez.
 */
const CART_TOKEN_HEADER = 'X-Cart-Token'
const CART_TOKEN_STORAGE_KEY = 'cart_token'

function getStoredCartToken(): string | null {
  if (!import.meta.client) return null
  try {
    return localStorage.getItem(CART_TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

function storeCartToken(token: string): void {
  if (!import.meta.client) return
  try {
    localStorage.setItem(CART_TOKEN_STORAGE_KEY, token)
  } catch {
    // ignorar quota/security errors
  }
}

api.interceptors.request.use((config) => {
  const token = getStoredCartToken()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers[CART_TOKEN_HEADER] = token
  }
  return config
})

api.interceptors.response.use(
  (response) => {
    const headerToken
      = (response.headers?.[CART_TOKEN_HEADER.toLowerCase()] as string | undefined)
        ?? (response.headers?.[CART_TOKEN_HEADER] as string | undefined)
    if (headerToken && headerToken !== getStoredCartToken()) {
      storeCartToken(headerToken)
    }
    return response
  },
  error => Promise.reject(error),
)

function hasXsrfToken(): boolean {
  if (!import.meta.client) return false
  try {
    return document.cookie.split(';').some(c => c.trim().startsWith('XSRF-TOKEN='))
  } catch {
    return false
  }
}

/**
 * Initialize CSRF token for Laravel Sanctum.
 *
 * Llama a `/sanctum/csrf-cookie` para establecer la cookie XSRF-TOKEN y la
 * cookie de sesión. Idempotente: si ya existe XSRF-TOKEN, no hace nada.
 */
let csrfInitPromise: Promise<void> | null = null

export async function initCsrfToken(): Promise<void> {
  if (!import.meta.client) return
  if (hasXsrfToken()) return
  if (csrfInitPromise) return csrfInitPromise

  return forceCsrfRefresh()
}

/**
 * Fuerza la obtención de una cookie XSRF-TOKEN fresca, ignorando si ya existe
 * una. Necesario cuando la cookie quedó obsoleta (p.ej. tras un logout que
 * regenera la sesión en Laravel) y el backend responde 419 "CSRF token
 * mismatch".
 */
export async function forceCsrfRefresh(): Promise<void> {
  if (!import.meta.client) return
  if (csrfInitPromise) return csrfInitPromise

  const baseURL = api.defaults.baseURL?.replace(/\/api\/?$/, '') || 'http://localhost:8080'
  csrfInitPromise = axios
    .get(`${baseURL}/sanctum/csrf-cookie`, { withCredentials: true })
    .then(() => undefined)
    .catch((error) => {
      console.warn('[CSRF] Failed to initialize CSRF cookie:', error)
    })
    .finally(() => {
      csrfInitPromise = null
    })

  return csrfInitPromise
}

/**
 * Interceptor: garantiza CSRF cookie antes de cualquier mutación.
 * Sin esto, el primer POST/PUT/PATCH/DELETE de la sesión falla con
 * "CSRF token mismatch" (419).
 */
const MUTATING_METHODS = new Set(['post', 'put', 'patch', 'delete'])

api.interceptors.request.use(async (config) => {
  if (import.meta.client) {
    const method = (config.method ?? 'get').toLowerCase()
    if (MUTATING_METHODS.has(method) && !hasXsrfToken()) {
      await initCsrfToken()
    }
  }
  return config
})

/**
 * Interceptor: si una mutación falla con 419 "CSRF token mismatch" (cookie
 * XSRF-TOKEN obsoleta), renueva la cookie y reintenta la petición una sola vez.
 */
api.interceptors.response.use(
  response => response,
  async (error) => {
    const status = error.response?.status
    const original = error.config

    if (
      import.meta.client
      && status === 419
      && original
      && !original._csrfRetry
    ) {
      original._csrfRetry = true
      await forceCsrfRefresh()
      return api(original)
    }

    return Promise.reject(error)
  },
)

export default api