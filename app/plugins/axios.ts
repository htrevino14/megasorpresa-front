/**
 * Nuxt plugin that configures the shared Axios instance.
 *
 * Sets the API base URL from runtime config and registers interceptors that
 * require Nuxt context (token management, SPA-safe redirects via navigateTo).
 */
import api from '~/api/index'
import { useLocationStore } from '~/stores/location'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  api.defaults.baseURL = config.public.apiBaseUrl as string

  const locationStore = useLocationStore()

  /**
   * Inject the selected city as `X-City-Id` on every outgoing request so the
   * Laravel backend can filter products by delivery coverage.
   *
   * The value is read from `useLocationStore` (the source of truth, restored
   * from localStorage on the client). On the server `selectedCityId` is null,
   * so no header is sent and SSR stays coverage-agnostic.
   */
  api.interceptors.request.use((axiosConfig) => {
    const cityId = locationStore.selectedCityId
    if (cityId != null) {
      axiosConfig.headers = axiosConfig.headers ?? {}
      axiosConfig.headers['X-City-Id'] = String(cityId)
    }
    return axiosConfig
  })

  /** Attach Bearer token from localStorage before every request (client-only). */
  api.interceptors.request.use((axiosConfig) => {
    if (import.meta.client) {
      const token = localStorage.getItem('auth_token')
      if (token) {
        axiosConfig.headers.Authorization = `Bearer ${token}`
      }

      // Debug logging for cart operations
      if (import.meta.dev && axiosConfig.url?.includes('/cart')) {
        console.log('[Axios Request] URL:', axiosConfig.url)
        console.log('[Axios Request] Method:', axiosConfig.method)
        console.log('[Axios Request] Headers:', axiosConfig.headers)
        console.log('[Axios Request] Cookies:', document.cookie)
      }
    }
    return axiosConfig
  })

  /** Handle unauthorised responses by clearing the session and redirecting. */
  api.interceptors.response.use(
    (response) => {
      // Debug logging for cart operations
      if (import.meta.dev && import.meta.client && response.config.url?.includes('/cart')) {
        console.log('[Axios Response] URL:', response.config.url)
        console.log('[Axios Response] Status:', response.status)
        console.log('[Axios Response] Set-Cookie headers:', response.headers['set-cookie'])
        console.log('[Axios Response] Cookies after response:', document.cookie)
      }
      return response
    },
    async (error) => {
      if (error.response?.status === 401 && import.meta.client) {
        localStorage.removeItem('auth_token')
        await navigateTo('/login')
      }

      // Debug logging for cart operation errors
      if (import.meta.dev && import.meta.client && error.config?.url?.includes('/cart')) {
        console.error('[Axios Error] URL:', error.config.url)
        console.error('[Axios Error] Status:', error.response?.status)
        console.error('[Axios Error] Response:', error.response?.data)
      }

      return Promise.reject(error)
    },
  )
})
