/**
 * Axios instance configured to communicate with the megasorpresa-back API.
 * Request interceptors (Bearer token) and response interceptors (401 handling)
 * are registered in `~/plugins/axios.ts` so they can use Nuxt's context.
 */
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

export default api
