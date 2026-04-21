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

// ── Landing Page Types ────────────────────────────────────────────────────────

/** Active announcement bar shown at the top of the header */
export interface AnnouncementBar {
  id: number
  message: string
  link_url: string | null
  link_label: string | null
  bg_color: string | null
  text_color: string | null
}

/** Hero banner slide */
export interface HeroSlide {
  id: number
  title: string
  subtitle: string
  cta_text: string
  cta_link: string
  image_url_desktop: string
  image_url_mobile: string | null
  alt_text: string | null
  bg_color: string | null
  sort_order: number
}

/** Single item inside a megamenu subcategory group */
export interface MegamenuSubcategoryItem {
  id: number
  label: string
  sort_order: number
}

/** Group of subcategory items inside a megamenu category */
export interface MegamenuSubcategoryGroup {
  id: number
  title: string
  sort_order: number
  items: MegamenuSubcategoryItem[]
}

/** Promotional panel shown in the megamenu dropdown */
export interface MegamenuPromoPanel {
  badge: string
  title: string
  description: string
  emoji: string
  bg_color: string
  link_text: string
  link_url: string
  image_url: string | null
}

/** Top-level megamenu category with subcategory groups and optional promo panel */
export interface MegamenuCategory {
  id: number
  name: string
  slug: string
  icon: string | null
  sort_order: number
  subcategory_groups: MegamenuSubcategoryGroup[]
  promo_panel: MegamenuPromoPanel | null
}

/** Item in the "Top categorías" horizontal carousel */
export interface CategoryCarouselItem {
  id: number
  name: string
  slug: string
  image_url: string
  bg_color: string
  sort_order: number
  category_id: number | null
}

/** Age group for the "Comprar por edad" section */
export interface AgeGroup {
  id: number
  label: string
  sublabel: string
  slug: string
  bg_color: string
  text_color: string
  sort_order: number
  category_id_destination: number | null
}

/** Single link inside a footer section */
export interface FooterLink {
  id: number
  label: string
  url: string
  icon: string | null
  open_in_new_tab: boolean
  sort_order: number
}

/** Footer column section with a title and its links */
export interface FooterSection {
  id: number
  title: string
  sort_order: number
  links: FooterLink[]
}

/** Social network link shown in the footer */
export interface SocialLink {
  id: number
  platform: string
  url: string
  icon_class: string | null
  icon_svg: string | null
  initial: string
  sort_order: number
}

/** Payment method accepted by the store */
export interface PaymentMethod {
  id: number
  name: string
  logo_url: string | null
  icon_class: string | null
  sort_order: number
}

/** Full footer data returned by GET /api/landing/footer */
export interface FooterData {
  sections: FooterSection[]
  social_links: SocialLink[]
  payment_methods: PaymentMethod[]
}

/** Newsletter subscription category */
export interface NewsletterCategory {
  id: number
  label: string
  slug: string
  sort_order: number
}

/** ZIP code coverage validation state */
export interface ZipCodeState {
  /** The last ZIP code entered by the user */
  zipCode: string
  /** Whether the ZIP code has been validated and is covered */
  isCovered: boolean | null
  /** Whether a validated ZIP code has been confirmed */
  isValidated: boolean
}

// ── Catalog Types ─────────────────────────────────────────────────────────────

/** Minimal category attached to a catalog product */
export interface CatalogCategory {
  id: number
  name: string
  slug: string
}

/**
 * Product as returned by GET /api/catalog/products.
 * `base_price` comes as a numeric string from the backend and must be parsed
 * with `parseFloat()` before display.
 */
export interface CatalogProduct {
  id: number
  name: string
  slug: string
  base_price: string
  primary_image: string
  gallery?: string[]
  categories: CatalogCategory[]
}

/** Query parameters accepted by GET /api/catalog/products */
export interface CatalogQueryParams {
  page?: number
  category?: string
  sort?: string
  search?: string
}
