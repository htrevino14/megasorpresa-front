/**
 * Utility helpers for the Megasorpresa storefront.
 */

/**
 * Format a numeric amount as Mexican Peso currency.
 * @param amount - Numeric value to format.
 * @returns Formatted string, e.g. `"$1,299.00"`.
 *
 * @example
 * formatPrice(1299) // "$1,299.00"
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format an ISO date string as a human-readable date in Spanish.
 * @param dateString - ISO 8601 date string.
 * @returns Formatted string, e.g. `"12 de marzo de 2026"`.
 *
 * @example
 * formatDate('2026-03-12') // "12 de marzo de 2026"
 */
export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateString))
}

/**
 * Calculate the discount percentage between the original and sale price.
 * @param price - Original price.
 * @param salePrice - Discounted price.
 * @returns Whole-number percentage off, e.g. `25`.
 *
 * @example
 * discountPercentage(400, 300) // 25
 */
export function discountPercentage(price: number, salePrice: number): number {
  return Math.round(((price - salePrice) / price) * 100)
}

/**
 * Truncate a string to a maximum character length, appending an ellipsis.
 * @param text - Input string.
 * @param maxLength - Maximum allowed length (default: 100).
 * @returns Truncated string with `"…"` appended when necessary.
 */
export function truncate(text: string, maxLength = 100): string {
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text
}
