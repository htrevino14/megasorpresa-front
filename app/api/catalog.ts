import api from '~/api/index'
import type { CatalogProduct, CatalogQueryParams, PaginatedResponse, ProductDetail } from '@@/types/index'

/**
 * Fetch a paginated list of products from the catalog.
 * @param params - Optional query parameters: page, category, sort, search.
 */
export const getCatalogProducts = (params?: CatalogQueryParams) =>
  api.get<PaginatedResponse<CatalogProduct>>('/catalog/products', { params })

/**
 * Fetch a single product by its slug.
 * @param slug - The product slug.
 */
export const getCatalogProduct = (slug: string) =>
  api.get<{ data: ProductDetail }>(`/catalog/products/${slug}`)
