import api from '~/api/index'
import type { CatalogProduct, CatalogQueryParams, PaginatedResponse, ProductDetail } from '@@/types/index'

/** Query parameters accepted by GET /api/catalog (city-aware listing). */
export interface CatalogParams {
  city_id: number
  category?: string
  page?: number
  per_page?: number
}

/**
 * Fetch a paginated catalog of products available in a given city,
 * optionally filtered by category slug.
 * @param params - city_id is required; category, page and per_page are optional.
 */
export const getCatalog = (params: CatalogParams) =>
  api.get<PaginatedResponse<CatalogProduct>>('/catalog', { params })

/**
 * Fetch a paginated list of products from the catalog.
 * @param params - Optional query parameters: page, category, sort, search.
 */
export const getCatalogProducts = (params?: CatalogQueryParams) =>
  api.get<PaginatedResponse<CatalogProduct>>('/catalog/products', { params })

/**
 * Fetch a single product by its numeric ID.
 * @param id - The product ID.
 */
export const getCatalogProduct = (id: number) =>
  api.get<{ data: ProductDetail }>(`/catalog/products/${id}`)
