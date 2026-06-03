import type { PaginatedResponse } from '@@/types/index'
import api from '~/api/index'

/**
 * Pedido tal como lo devuelve `GET /api/orders` (formato del listado).
 *
 * Es una vista compacta del modelo Order del backend, optimizada para la
 * pantalla "Mis Pedidos": solo incluye los campos necesarios para la tarjeta.
 */
export interface OrderListItem {
  id: number
  order_number: string
  status_name: string | null
  recipient_name: string | null
  date_legend: string | null
  product_image_url: string | null
  total_amount: number | string
  shipping_cost: number | string
  payment_method: string | null
  created_at: string
  updated_at: string
}

/**
 * Obtiene los pedidos del usuario autenticado paginados.
 *
 * @param page    - Número de página (1-indexada).
 * @param perPage - Cantidad de pedidos por página (default 10).
 */
export const getOrders = (page = 1, perPage = 10) =>
  api.get<PaginatedResponse<OrderListItem>>('/orders', {
    params: { page, per_page: perPage },
  })
