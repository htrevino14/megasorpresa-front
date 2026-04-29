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
 * Check if CSRF token cookie exists.
 * Laravel Sanctum stores the CSRF token in an XSRF-TOKEN cookie.
 *
 * @returns True if XSRF-TOKEN cookie exists, false otherwise.
 */
function hasXsrfToken(): boolean {
  if (!import.meta.client) return false

  try {
    // Check if XSRF-TOKEN cookie exists
    const cookies = document.cookie.split(';')
    return cookies.some(cookie => cookie.trim().startsWith('XSRF-TOKEN='))
  } catch {
    return false
  }
}

/**
 * Initialize CSRF token for Laravel Sanctum.
 *
 * This function calls `/sanctum/csrf-cookie` to establish a session
 * and set the CSRF token cookie required for state-changing requests.
 * Should be called before making POST, PATCH, or DELETE requests.
 *
 * The function checks if a CSRF token already exists to avoid redundant
 * calls and prevent unnecessary session regeneration on the backend.
 *
 * @returns Promise that resolves when CSRF token is initialized.
 */
export async function initCsrfToken(): Promise<void> {
  // Only run on client side
  if (!import.meta.client) return

  // Skip if CSRF token already exists - this prevents creating new sessions
  if (hasXsrfToken()) {
    return
  }

  try {
    // Remove /api suffix from base URL to reach sanctum endpoint
    const baseURL = api.defaults.baseURL?.replace(/\/api$/, '') || 'http://localhost:8000'
    await axios.get(`${baseURL}/sanctum/csrf-cookie`, {
      withCredentials: true,
    })
  } catch (error) {
    // Log error but don't throw - allow the actual request to fail with more context
    console.warn('Failed to initialize CSRF token:', error)
    console.warn('Backend CORS configuration may need adjustment. Check Laravel config/cors.php')
  }
}

export default api