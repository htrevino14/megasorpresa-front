/**
 * Global TypeScript type definitions for Megasorpresa.
 * These interfaces mirror the backend models from megasorpresa-back (Laravel).
 */

/** Product category */
export interface Category {
  id: number
  name: string
  slug: string
  description?: string
  image_url?: string
  parent_id?: number
}

/** Toy product */
export interface Product {
  id: number
  name: string
  slug: string
  description: string
  price: number
  sale_price?: number
  stock: number
  sku: string
  images: string[]
  category: Category
  category_id: number
  is_active: boolean
  created_at: string
  updated_at: string
}

/** Registered user */
export interface User {
  id: number
  name: string
  email: string
  email_verified_at?: string
  role: 'admin' | 'customer'
  created_at: string
  updated_at: string
}

/** Cart line item */
export interface CartItem {
  product: Product
  quantity: number
  subtotal: number
}

/** Shopping cart */
export interface Cart {
  items: CartItem[]
  total: number
  item_count: number
}

/** Order line item */
export interface OrderItem {
  id: number
  product: Product
  quantity: number
  unit_price: number
  subtotal: number
}

/** Customer order */
export interface Order {
  id: number
  user: User
  items: OrderItem[]
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  shipping_address: Address
  created_at: string
  updated_at: string
}

/** Shipping / billing address */
export interface Address {
  street: string
  city: string
  state: string
  postal_code: string
  country: string
}

/** Auth response returned by the backend */
export interface AuthResponse {
  user: User
  token: string
  token_type: 'Bearer'
}

/** Generic paginated API response */
export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
  links: {
    first: string
    last: string
    prev: string | null
    next: string | null
  }
}
