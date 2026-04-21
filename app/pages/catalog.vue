<script setup lang="ts">
/**
 * catalog – Dynamic product catalog page.
 *
 * Uses the landing layout so it shares the exact same header (announcement
 * bar, blue nav, megamenu) and footer as the home page.
 * Syncs filters (category, sort) and page number with the URL query string.
 */
import { getCatalogProducts } from '~/api/catalog'
import type { CatalogProduct, CatalogQueryParams, PaginatedResponse } from '@@/types/index'

definePageMeta({ layout: 'landing' })

const route = useRoute()
const router = useRouter()

// ── Filter state (synced with URL) ────────────────────────────────────────────
const category = ref<string>((route.query.category as string) ?? '')
const sort = ref<string>((route.query.sort as string) ?? '')
const page = ref<number>(Number(route.query.page) || 1)

const sortOptions = [
  { value: '', label: 'Relevancia' },
  { value: 'price_asc', label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
  { value: 'newest', label: 'Más recientes' },
]

// ── Sync URL → state on browser navigation ────────────────────────────────────
watch(
  () => route.query,
  (q) => {
    category.value = (q.category as string) ?? ''
    sort.value = (q.sort as string) ?? ''
    page.value = Number(q.page) || 1
  },
)

// ── Push filter changes to URL ────────────────────────────────────────────────
function applyFilters() {
  page.value = 1
  pushQuery()
}

function pushQuery() {
  const query: Record<string, string> = {}
  if (category.value) query.category = category.value
  if (sort.value) query.sort = sort.value
  if (page.value > 1) query.page = String(page.value)
  router.push({ query })
}

function onPageChange(newPage: number) {
  page.value = newPage
  pushQuery()
}

// ── Data fetching ─────────────────────────────────────────────────────────────
const queryKey = computed(() =>
  `catalog-${category.value}-${sort.value}-${page.value}`,
)

const params = computed<CatalogQueryParams>(() => ({
  page: page.value,
  ...(category.value ? { category: category.value } : {}),
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

// ── Cart (placeholder – replace with cart store when available) ───────────────
function addToCart(product: CatalogProduct) {
  // TODO: integrate with useCartStore once it exists
  console.log('Added to cart:', product.id)
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
            v-model="sort"
            class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            @change="applyFilters"
          >
            <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>

        <!-- Active filter chip for category -->
        <div v-if="category" class="mb-4 flex flex-wrap gap-2">
          <span class="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
            Categoría: {{ category }}
            <button
              type="button"
              class="ml-1 text-yellow-600 hover:text-yellow-800"
              aria-label="Quitar filtro de categoría"
              @click="category = ''; applyFilters()"
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
