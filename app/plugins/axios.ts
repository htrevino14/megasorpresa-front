/**
 * Nuxt plugin that configures the shared Axios instance.
 *
 * Sets the API base URL from runtime config and registers interceptors that
 * require Nuxt context (token management, SPA-safe redirects via navigateTo).
 */
import api from '~/api/index'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  api.defaults.baseURL = config.public.apiBaseUrl as string

  /** Attach Bearer token from localStorage before every request (client-only). */
  api.interceptors.request.use((axiosConfig) => {
    if (import.meta.client) {
      const token = localStorage.getItem('auth_token')
      if (token) {
        axiosConfig.headers.Authorization = `Bearer ${token}`
      }
    }
    return axiosConfig
  })

  /** Handle unauthorised responses by clearing the session and redirecting. */
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401 && import.meta.client) {
        localStorage.removeItem('auth_token')
        await navigateTo('/login')
      }
      return Promise.reject(error)
    },
  )
})
