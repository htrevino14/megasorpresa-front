/**
 * Checkout Pinia store.
 *
 * Recolecta de manera reactiva la información de los 5 pasos del wizard de
 * checkout (`phone`, `recipient`, `schedule`, `dedication`, `payment`) en un
 * único objeto `payload`, y expone la acción `submitOrder()` que envía toda
 * la información a `POST /api/orders/checkout`.
 *
 * - Los errores de validación (422) se exponen en `errors` con el formato
 *   `'recipient.full_name': ['…']` para que cada paso pueda mostrar el mensaje
 *   junto a su campo.
 * - Cualquier otro error queda en `serverError` para mostrarse como alerta.
 */
import { defineStore } from 'pinia'
import type { AxiosError } from 'axios'
import type {
  CheckoutPayload,
  CheckoutErrors,
  CheckoutResponse,
} from '@@/types/index'
import { submitCheckout } from '~/api/checkout'

interface CheckoutState {
  payload: CheckoutPayload
  errors: CheckoutErrors
  serverError: string | null
  isSubmitting: boolean
  orderId: number | null
  trackingNumber: string | null
  paymentUrl: string | null
}

function emptyPayload(): CheckoutPayload {
  return {
    phone: '',
    recipient: {
      recipient_name: '',
      phone: '',
      street: '',
      ext_number: '',
      interior_number: '',
      neighborhood: '',
      zip_code: '',
      city: '',
      state: '',
      references: '',
    },
    schedule: {
      delivery_date: '',
      delivery_slot: null,
    },
    dedication: {
      message: '',
      signature: '',
    },
    payment: {
      method: null,
      accepted_terms: false,
    },
  }
}

export const useCheckoutStore = defineStore('checkout', {
  state: (): CheckoutState => ({
    payload: emptyPayload(),
    errors: {},
    serverError: null,
    isSubmitting: false,
    orderId: null,
    trackingNumber: null,
    paymentUrl: null,
  }),

  getters: {
    /** Devuelve el primer mensaje de error para un campo (formato `seccion.campo`). */
    fieldError: (state) => (path: string): string | null => {
      const messages = state.errors[path]
      return messages && messages.length > 0 ? messages[0] : null
    },

    /** True si hay al menos un error con el prefijo dado (p.ej. "recipient"). */
    hasSectionErrors: (state) => (section: keyof CheckoutPayload): boolean => {
      return Object.keys(state.errors).some(key => key.startsWith(`${section}.`))
    },
  },

  actions: {
    /** Limpia los errores antes de reintentar o avanzar de paso. */
    clearErrors() {
      this.errors = {}
      this.serverError = null
    },

    /** Limpia los errores asociados a una sección específica. */
    clearSectionErrors(section: keyof CheckoutPayload) {
      const next: CheckoutErrors = {}
      for (const [key, value] of Object.entries(this.errors)) {
        if (!key.startsWith(`${section}.`)) next[key] = value
      }
      this.errors = next
    },

    /** Reinicia el store (útil al salir del checkout o tras éxito). */
    reset() {
      this.payload = emptyPayload()
      this.errors = {}
      this.serverError = null
      this.isSubmitting = false
      this.orderId = null
      this.trackingNumber = null
      this.paymentUrl = null
    },

    /**
     * Envía el pedido al backend.
     *
     * @returns `true` si la orden se creó con éxito, `false` si hubo cualquier error.
     */
    async submitOrder(): Promise<boolean> {
      this.clearErrors()
      this.isSubmitting = true

      try {
        const { data } = await submitCheckout(this.payload)
        const order = (data as CheckoutResponse).data
        this.orderId = order.id
        this.trackingNumber = order.tracking_number
        this.paymentUrl = order.payment_url ?? null
        return true
      }
      catch (err) {
        const axiosErr = err as AxiosError<{ message?: string, errors?: CheckoutErrors }>
        const status = axiosErr.response?.status

        if (status === 422 && axiosErr.response?.data?.errors) {
          this.errors = axiosErr.response.data.errors
          this.serverError = axiosErr.response.data.message
            ?? 'Por favor corrige los campos marcados.'
        }
        else if (status === 401) {
          this.serverError = 'Tu sesión ha expirado. Inicia sesión de nuevo.'
        }
        else if (status === 409) {
          this.serverError = axiosErr.response?.data?.message
            ?? 'No hay stock suficiente para uno o más productos.'
        }
        else {
          this.serverError = axiosErr.response?.data?.message
            ?? 'Ocurrió un error al procesar tu pedido. Intenta de nuevo.'
        }

        return false
      }
      finally {
        this.isSubmitting = false
      }
    },
  },
})
