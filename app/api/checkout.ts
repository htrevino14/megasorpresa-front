import api from '~/api/index'
import type { CheckoutPayload, CheckoutResponse } from '@@/types/index'

/**
 * Envía el pedido final al backend.
 *
 * En caso de validación fallida, Laravel responde 422 con
 * `{ message, errors: { 'field.path': string[] } }` que el store de checkout
 * se encarga de procesar.
 */
export const submitCheckout = (payload: CheckoutPayload) =>
  api.post<CheckoutResponse>('/orders/checkout', payload)
