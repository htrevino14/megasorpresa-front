import type { PaginatedResponse } from '@@/types/index'
import api from '~/api/index'

export type DwellingTypeOption =
  | 'casa'
  | 'hotel'
  | 'restaurante'
  | 'escuela'
  | 'oficina'
  | 'hospital'
  | 'teatro'
  | 'plaza comercial'
  | 'departamento'
  | 'otro'

export interface UserAddress {
  id: number
  recipient_name: string | null
  phone: string | null
  street: string | null
  ext_number: string | null
  neighborhood: string | null
  zip_code: string | null
  city_name: string | null
  state_name: string | null
  full_address: string
}

export interface StoreAddressPayload {
  recipient_name: string
  phone_code: string
  phone: string
  address_search?: string
  street: string
  ext_number: string
  neighborhood: string
  dwelling_type: DwellingTypeOption
  zip_code: string
  state_id: number
  city_id: number
  references?: string
}

/**
 * Lista paginada de direcciones de envío del usuario autenticado.
 *
 * @param page    - Página (1-indexada).
 * @param perPage - Resultados por página (default 6).
 * @param search  - Búsqueda libre opcional.
 */
export const getAddresses = (page = 1, perPage = 6, search?: string) =>
  api.get<PaginatedResponse<UserAddress>>('/addresses', {
    params: { page, per_page: perPage, ...(search ? { search } : {}) },
  })

/**
 * Crea una nueva dirección de envío para el usuario autenticado.
 */
export const createAddress = (payload: StoreAddressPayload) =>
  api.post<{ data: UserAddress }>('/addresses', payload)
