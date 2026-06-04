import { defineStore } from 'pinia'

/**
 * Catalog store – Manages filter state for the product catalog.
 * Filters include: category, sort, search, and pagination.
 */
export interface CatalogFilterState {
  category: string
  sort: string
  search: string
  page: number
}

export const useCatalogStore = defineStore('catalog', {
  state: (): CatalogFilterState => ({
    category: '',
    sort: '',
    search: '',
    page: 1,
  }),

  getters: {
    /**
     * Check if any filters are currently active
     */
    hasActiveFilters: (state): boolean => {
      return !!(state.category || state.search)
    },

    /**
     * Get current filter count (excluding sort and page)
     */
    activeFilterCount: (state): number => {
      let count = 0
      if (state.category) count++
      if (state.search) count++
      return count
    },
  },

  actions: {
    /**
     * Set the category filter and reset to page 1
     */
    setCategory(category: string) {
      this.category = category
      this.page = 1
    },

    /**
     * Set the sort option (doesn't reset page)
     */
    setSort(sort: string) {
      this.sort = sort
    },

    /**
     * Set the search term and reset to page 1
     */
    setSearch(search: string) {
      this.search = search
      this.page = 1
    },

    /**
     * Set the current page
     */
    setPage(page: number) {
      this.page = page
    },

    /**
     * Clear all filters and reset to page 1
     */
    clearAllFilters() {
      this.category = ''
      this.sort = ''
      this.search = ''
      this.page = 1
    },

    /**
     * Clear a specific filter and reset to page 1
     */
    clearFilter(filterName: keyof CatalogFilterState) {
      if (filterName === 'sort' || filterName === 'page') {
        this[filterName] = filterName === 'page' ? 1 : ''
      } else {
        this[filterName] = ''
        this.page = 1
      }
    },

    /**
     * Initialize filters from URL query parameters
     */
    initFromQuery(query: Record<string, string | string[] | undefined>) {
      this.category = (query.category as string) ?? ''
      this.sort = (query.sort as string) ?? ''
      this.search = (query.search as string) ?? ''
      this.page = Number(query.page) || 1
    },

    /**
     * Get query object for router navigation
     */
    toQuery(): Record<string, string> {
      const query: Record<string, string> = {}
      if (this.category) query.category = this.category
      if (this.sort) query.sort = this.sort
      if (this.search) query.search = this.search
      if (this.page > 1) query.page = String(this.page)
      return query
    },
  },
})
