import api from '~/api/index'
import type { CatalogState, CatalogCity, DeliverySlot } from '@@/types/index'

/**
 * Catálogo de ubicaciones (estados, ciudades y franjas de entrega).
 * Endpoints públicos del backend bajo el prefijo `/locations`.
 */

/** Lista todos los estados disponibles. */
export const getStates = () =>
  api.get<{ data: CatalogState[] }>('/locations/states')

/** Lista las ciudades activas de un estado. */
export const getCitiesByState = (stateId: number) =>
  api.get<{ data: CatalogCity[] }>(`/locations/states/${stateId}/cities`)

/** Lista las franjas de entrega disponibles para una ciudad. */
export const getDeliverySlotsByCity = (cityId: number) =>
  api.get<{ data: DeliverySlot[] }>(`/locations/cities/${cityId}/delivery-slots`)
