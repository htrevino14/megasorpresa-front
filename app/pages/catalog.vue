<script setup lang="ts">
/**
 * catalog – Dynamic product catalog page.
 *
 * Uses the landing layout so it shares the exact same header (announcement
 * bar, blue nav, megamenu) and footer as the home page.
 * Syncs filters (category, age, sort) and page number with the URL query string.
 * Integrates with catalogStore for state management.
 */
import { getCatalogProducts } from '~/api/catalog'
import type { CatalogProduct, CatalogQueryParams, PaginatedResponse } from '@@/types/index'

definePageMeta({ layout: 'landing' })

const route = useRoute()
const router = useRouter()
const catalogStore = useCatalogStore()

// ── Initialize store from URL on mount ────────────────────────────────────────
onMounted(() => {
  catalogStore.initFromQuery(route.query)
})

// ── Filter state (synced with store and URL) ──────────────────────────────────
const category = computed(() => catalogStore.category)
const age = computed(() => catalogStore.age)
const sort = computed(() => catalogStore.sort)
const page = computed(() => catalogStore.page)

const sortOptions = [
  { value: '', label: 'Relevancia' },
  { value: 'price_asc', label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
  { value: 'newest', label: 'Más recientes' },
]

// ── Sync URL → store on browser navigation ────────────────────────────────────
watch(
  () => route.query,
  (q) => {
    catalogStore.initFromQuery(q)
  },
)

// ── Push filter changes to URL ────────────────────────────────────────────────
function applyFilters() {
  catalogStore.setPage(1)
  pushQuery()
}

function pushQuery() {
  router.push({ query: catalogStore.toQuery() })
}

function onPageChange(newPage: number) {
  catalogStore.setPage(newPage)
  pushQuery()
}

function onSortChange(newSort: string) {
  catalogStore.setSort(newSort)
  pushQuery()
}

function clearCategoryFilter() {
  catalogStore.clearFilter('category')
  pushQuery()
}

function clearAgeFilter() {
  catalogStore.clearFilter('age')
  pushQuery()
}

// ── Data fetching ─────────────────────────────────────────────────────────────
const queryKey = computed(() =>
  `catalog-${category.value}-${age.value}-${sort.value}-${page.value}`,
)

const params = computed<CatalogQueryParams>(() => ({
  page: page.value,
  ...(category.value ? { category: category.value } : {}),
  ...(age.value ? { age: age.value } : {}),
  ...(sort.value ? { sort: sort.value } : {}),
}))

const { data: catalogData, status } = await useAsyncData<PaginatedResponse<CatalogProduct>>(
  queryKey,
  () => getCatalogProducts(params.value).then(r => r.data),
  { watch: [queryKey] },
)

const products = computed<CatalogProduct[]>(() => catalogData.value?.data ?? [])
const meta = computed(() => catalogData.value?.meta)
const links = computed(() => catalogData.value?.links)
const isLoading = computed(() => status.value === 'pending')

// ── Cart integration ──────────────────────────────────────────────────────────
const cart = useCartStore()

async function addToCart(product: CatalogProduct) {
  try {
    await cart.addItem(product.id, 1)
    console.log('Added to cart:', product.id)
    // TODO: Show success notification to user
  } catch (error) {
    console.error('Failed to add to cart:', error)
    // TODO: Show error notification to user
  }
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gray-50">
    <LandingTheHeader />

    <main class="flex-1">
      <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <!-- Page heading -->
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-gray-900 md:text-3xl">
            Catálogo de Productos
          </h1>
          <p v-if="meta" class="mt-1 text-sm text-gray-500">
            {{ meta.total }} productos encontrados
          </p>
        </div>

        <!-- Filter bar -->
        <div class="mb-6 flex flex-wrap items-center gap-3">
          <!-- Sort -->
          <select
            :value="sort"
            class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            @change="onSortChange(($event.target as HTMLSelectElement).value)"
          >
            <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>

        <!-- Active filter chips -->
        <div v-if="category || age" class="mb-4 flex flex-wrap gap-2">
          <!-- Category filter chip -->
          <span v-if="category" class="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
            Categoría: {{ category }}
            <button
              type="button"
              class="ml-1 text-yellow-600 hover:text-yellow-800"
              aria-label="Quitar filtro de categoría"
              @click="clearCategoryFilter"
            >
              ✕
            </button>
          </span>

          <!-- Age filter chip -->
          <span v-if="age" class="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
            Edad: {{ age }}
            <button
              type="button"
              class="ml-1 text-blue-600 hover:text-blue-800"
              aria-label="Quitar filtro de edad"
              @click="clearAgeFilter"
            >
              ✕
            </button>
          </span>
        </div>

        <!-- Product grid -->
        <CatalogProductGrid
          :products="products"
          :loading="isLoading"
          @add-to-cart="addToCart"
        />

        <!-- Pagination -->
        <CatalogPagination
          v-if="meta && links && meta.last_page > 1"
          :meta="meta"
          :links="links"
          @page-change="onPageChange"
        />
      </div>
    </main>

    <LandingTheFooter />
  </div>
</template>
