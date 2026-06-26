import type { PaginatedResponse, ProductImage } from '@@/types/index'
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

/** Estado del pedido tal como lo anida `OrderResource` (`{ id, name }`). */
export interface OrderStatusRef {
  id: number
  name: string
}

/** Producto comprado, subconjunto de `ProductResource` usado en el detalle. */
export interface OrderLineProduct {
  id: number
  name: string
  slug: string
  sku: string
  base_price: number | string
  primary_image?: string | null
  images: ProductImage[]
}

/** Línea del pedido (`OrderItemResource`). */
export interface OrderLineItem {
  id: number
  product: OrderLineProduct | null
  quantity: number
  unit_price: number | string
  total: number | string
}

/** Franja horaria de entrega anidada en `OrderDetailResource`. */
export interface OrderDeliverySlotInfo {
  id: number
  start_time: string | null
  end_time: string | null
  additional_cost: number | string
}

/** Snapshot de la dirección de envío congelada al momento de la compra. */
export interface OrderShippingAddress {
  street: string | null
  ext_number: string | null
  neighborhood: string | null
  dwelling_type: string | null
  zip_code: string | null
  references: string | null
  city: string | null
  state: string | null
  full_address: string | null
}

/** Detalle de entrega del pedido (`OrderDetailResource`). */
export interface OrderDeliveryDetail {
  recipient_name: string | null
  recipient_phone: string | null
  delivery_date: string | null
  delivery_slot: OrderDeliverySlotInfo | null
  card_message: string | null
  signature: string | null
  address: OrderShippingAddress
}

/**
 * Pedido completo tal como lo devuelve `GET /api/orders/{id}` (`OrderResource`).
 *
 * Incluye estado, items con su producto e imágenes, y el detalle de entrega
 * con la dirección snapshot.
 */
export interface OrderDetail {
  id: number
  order_number: string
  tracking_number: string | null
  status: OrderStatusRef | null
  status_name: string | null
  recipient_name: string | null
  date_legend: string | null
  product_image_url: string | null
  total_amount: number | string
  shipping_cost: number | string
  payment_method: string | null
  items: OrderLineItem[]
  detail: OrderDeliveryDetail | null
  created_at: string
  updated_at: string
}

/**
 * Obtiene el detalle completo de un pedido del usuario autenticado.
 *
 * @param id - Identificador del pedido (param `id` de la ruta).
 */
export const getOrder = (id: number | string) =>
  api.get<{ data: OrderDetail }>(`/orders/${id}`)
