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
 * Initialize CSRF token for Laravel Sanctum.
 *
 * This function calls `/sanctum/csrf-cookie` to establish a session
 * and set the CSRF token cookie required for state-changing requests.
 * Should be called before making POST, PATCH, or DELETE requests.
 *
 * @returns Promise that resolves when CSRF token is initialized.
 */
export async function initCsrfToken(): Promise<void> {
  if (!import.meta.client) return

  try {
    // Remove /api suffix from base URL to reach sanctum endpoint
    const baseURL = api.defaults.baseURL?.replace(/\/api$/, '') || 'http://localhost:8000'
    await axios.get(`${baseURL}/sanctum/csrf-cookie`, {
      withCredentials: true,
    })
  } catch (error) {
    console.error('Failed to initialize CSRF token:', error)
    throw error
  }
}

export default api