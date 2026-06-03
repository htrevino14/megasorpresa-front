/**
 * Checkout Pinia store.
 *
 * Recolecta de manera reactiva la información del wizard de checkout en un
 * único objeto plano `payload` que coincide 1:1 con lo que valida el backend
 * (`StoreCheckoutRequest`). El envío de la orden lo realiza el paso 5
 * (`StepPayment.vue`); este store solo guarda el estado del formulario,
 * los errores de validación y un snapshot del pedido confirmado.
 *
 * - Los errores de validación (422) se exponen en `errors` con el nombre plano
 *   del campo (p.ej. `street`, `delivery_slot_id`) para que cada paso pueda
 *   mostrar el mensaje junto a su campo.
 * - `labels` guarda los nombres legibles (estado, ciudad, franja) elegidos en
 *   los selects, para reconstruirlos en la pantalla de confirmación.
 * - `confirmation` se persiste en sessionStorage para sobrevivir la redirección
 *   a `/checkout/success`.
 */
import { defineStore } from 'pinia'
import type {
  CheckoutPayload,
  CheckoutErrors,
  CheckoutSection,
  OrderConfirmation,
} from '@@/types/index'

const CONFIRMATION_KEY = 'checkout_confirmation'

interface CheckoutLabels {
  state: string
  city: string
  deliverySlot: string
}

interface CheckoutState {
  payload: CheckoutPayload
  errors: CheckoutErrors
  labels: CheckoutLabels
}

/**
 * Campos planos del payload que pertenecen a cada paso del wizard.
 * Se usa para saltar al primer paso con errores y para limpiar errores
 * por sección.
 */
const SECTION_FIELDS: Record<CheckoutSection, (keyof CheckoutPayload)[]> = {
  phone: ['recipient_phone'],
  recipient: [
    'recipient_name',
    'street',
    'ext_number',
    'neighborhood',
    'dwelling_type',
    'zip_code',
    'state_id',
    'city_id',
    'references',
  ],
  schedule: ['delivery_date', 'delivery_slot_id'],
  dedication: ['card_message', 'signature'],
  payment: ['payment_method', 'subtotal', 'total'],
}

function emptyPayload(): CheckoutPayload {
  return {
    // orders
    payment_method: '',
    subtotal: 0,
    total: 0,
    // order_details
    delivery_date: '',
    delivery_slot_id: null,
    recipient_phone: '',
    card_message: '',
    signature: '',
    // user_addresses
    recipient_name: '',
    street: '',
    ext_number: '',
    neighborhood: '',
    dwelling_type: '',
    zip_code: '',
    state_id: null,
    city_id: null,
    references: '',
    // wizard-only
    accepted_terms: false,
  }
}

function emptyLabels(): CheckoutLabels {
  return { state: '', city: '', deliverySlot: '' }
}

/** Lee el snapshot de confirmación de sessionStorage (SSR-safe). */
function readConfirmation(): OrderConfirmation | null {
  if (!import.meta.client) return null
  try {
    const raw = sessionStorage.getItem(CONFIRMATION_KEY)
    return raw ? (JSON.parse(raw) as OrderConfirmation) : null
  }
  catch {
    return null
  }
}

export const useCheckoutStore = defineStore('checkout', {
  state: (): CheckoutState => ({
    payload: emptyPayload(),
    errors: {},
    labels: emptyLabels(),
  }),

  getters: {
    /** Devuelve el primer mensaje de error para un campo plano (p.ej. `street`). */
    fieldError: (state) => (field: string): string | null => {
      const messages = state.errors[field]
      return messages && messages.length > 0 ? messages[0] : null
    },

    /** True si hay al menos un error en algún campo de la sección dada. */
    hasSectionErrors: (state) => (section: CheckoutSection): boolean => {
      const fields = SECTION_FIELDS[section] as string[]
      return Object.keys(state.errors).some(key => fields.includes(key))
    },
  },

  actions: {
    /** Limpia los errores antes de reintentar o avanzar de paso. */
    clearErrors() {
      this.errors = {}
    },

    /** Limpia los errores asociados a una sección específica. */
    clearSectionErrors(section: CheckoutSection) {
      const fields = SECTION_FIELDS[section] as string[]
      const next: CheckoutErrors = {}
      for (const [key, value] of Object.entries(this.errors)) {
        if (!fields.includes(key)) next[key] = value
      }
      this.errors = next
    },

    /** Guarda el snapshot del pedido confirmado en sessionStorage. */
    saveConfirmation(confirmation: OrderConfirmation) {
      if (!import.meta.client) return
      try {
        sessionStorage.setItem(CONFIRMATION_KEY, JSON.stringify(confirmation))
      }
      catch {
        // Ignora errores de cuota/seguridad.
      }
    },

    /** Recupera el snapshot del pedido confirmado (para la pantalla de éxito). */
    loadConfirmation(): OrderConfirmation | null {
      return readConfirmation()
    },

    /** Elimina el snapshot de confirmación de sessionStorage. */
    clearConfirmation() {
      if (!import.meta.client) return
      try {
        sessionStorage.removeItem(CONFIRMATION_KEY)
      }
      catch {
        // Ignora errores de seguridad.
      }
    },

    /** Reinicia el formulario del checkout (no toca la confirmación guardada). */
    reset() {
      this.payload = emptyPayload()
      this.errors = {}
      this.labels = emptyLabels()
    },
  },
})
