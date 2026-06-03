import type { PaginatedResponse } from '@@/types/index'
import api from '~/api/index'

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
