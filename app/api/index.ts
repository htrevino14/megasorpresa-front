import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

/**
 * Track if CSRF token has been initialized to avoid redundant calls.
 */
let csrfInitialized = false

/**
 * Initialize CSRF token for Laravel Sanctum.
 *
 * This function calls `/sanctum/csrf-cookie` to establish a session
 * and set the CSRF token cookie required for state-changing requests.
 * Should be called before making POST, PATCH, or DELETE requests.
 *
 * The function caches the initialization state to avoid redundant calls
 * within the same session.
 *
 * @returns Promise that resolves when CSRF token is initialized.
 */
export async function initCsrfToken(): Promise<void> {
  // Only run on client side
  if (!import.meta.client) return

  // Skip if already initialized
  if (csrfInitialized) return

  try {
    // Remove /api suffix from base URL to reach sanctum endpoint
    const baseURL = api.defaults.baseURL?.replace(/\/api$/, '') || 'http://localhost:8000'
    await axios.get(`${baseURL}/sanctum/csrf-cookie`, {
      withCredentials: true,
    })
    csrfInitialized = true
  } catch (error) {
    // Log error but don't throw - allow the actual request to fail with more context
    console.warn('Failed to initialize CSRF token:', error)
    console.warn('Backend CORS configuration may need adjustment. Check Laravel config/cors.php')
  }
}

export default api