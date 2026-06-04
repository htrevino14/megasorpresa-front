<script setup lang="ts">
/**
 * catalog – Dynamic product catalog page.
 *
 * Uses the landing layout so it shares the exact same header (announcement
 * bar, blue nav, megamenu) and footer as the home page.
 * Syncs filters (category, sort) and page number with the URL query string.
 * Integrates with catalogStore for state management.
 */
import { getCatalog } from '~/api/catalog'
import type { CatalogParams } from '~/api/catalog'
import type { CatalogProduct, PaginatedResponse } from '@@/types/index'

definePageMeta({ layout: 'landing' })

const route = useRoute()
const router = useRouter()
const catalogStore = useCatalogStore()
const locationStore = useLocationStore()

// ── Global city from the location store ───────────────────────────────────────
const cityId = computed<number | null>(() => locationStore.cityId)

// ── Initialize store from URL on mount ────────────────────────────────────────
onMounted(() => {
  catalogStore.initFromQuery(route.query)
})

// ── Filter state (synced with store and URL) ──────────────────────────────────
const category = computed(() => catalogStore.category)
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

// ── Data fetching ─────────────────────────────────────────────────────────────
const queryKey = computed(() =>
  `catalog-${cityId.value ?? 'none'}-${category.value}-${page.value}`,
)

const params = computed<CatalogParams | null>(() => {
  if (!cityId.value) return null
  return {
    city_id: cityId.value,
    page: page.value,
    ...(category.value ? { category: category.value } : {}),
  }
})

const { data: catalogData, status } = await useAsyncData<PaginatedResponse<CatalogProduct> | null>(
  queryKey,
  () => {
    if (!params.value) return Promise.resolve(null)
    return getCatalog(params.value).then(r => r.data)
  },
  { watch: [queryKey] },
)

const products = computed<CatalogProduct[]>(() => catalogData.value?.data ?? [])
const meta = computed(() => catalogData.value?.meta)
const links = computed(() => catalogData.value?.links)
const isLoading = computed(() => status.value === 'pending')
const hasCity = computed(() => cityId.value !== null)
const isEmpty = computed(() => hasCity.value && !isLoading.value && products.value.length === 0)

// ── Navigation helpers for the empty / no-city states ─────────────────────────
function goChooseCity() {
  router.push('/')
}

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
        <div v-if="category" class="mb-4 flex flex-wrap gap-2">
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
        </div>

        <!-- No city selected -->
        <div
          v-if="!hasCity"
          class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-20 text-center"
        >
          <span class="text-5xl">📍</span>
          <h2 class="mt-4 text-lg font-semibold text-gray-900">
            Elige tu ciudad para ver el catálogo
          </h2>
          <p class="mt-1 max-w-md text-sm text-gray-500">
            Mostramos los regalos disponibles según la ciudad de entrega.
            Selecciona una para continuar.
          </p>
          <button type="button" class="btn-primary mt-6" @click="goChooseCity">
            Seleccionar ciudad
          </button>
        </div>

        <!-- Empty state: no products for this city/category -->
        <div
          v-else-if="isEmpty"
          class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-20 text-center"
        >
          <span class="text-5xl">🎁</span>
          <h2 class="mt-4 text-lg font-semibold text-gray-900">
            No hay productos disponibles aquí
          </h2>
          <p class="mt-1 max-w-md text-sm text-gray-500">
            <template v-if="category">
              No encontramos productos de la categoría
              <span class="font-medium">«{{ category }}»</span> en
              <span class="font-medium">{{ locationStore.cityName }}</span>.
              Prueba con otra categoría o cambia de ciudad.
            </template>
            <template v-else>
              Aún no hay productos disponibles en
              <span class="font-medium">{{ locationStore.cityName }}</span>.
              Prueba cambiando de ciudad.
            </template>
          </p>
          <div class="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              v-if="category"
              type="button"
              class="btn-primary"
              @click="clearCategoryFilter"
            >
              Ver todas las categorías
            </button>
            <button
              type="button"
              class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              @click="goChooseCity"
            >
              Cambiar de ciudad
            </button>
          </div>
        </div>

        <!-- Product grid -->
        <CatalogProductGrid
          v-else
          :products="products"
          :loading="isLoading"
          @add-to-cart="addToCart"
        />

        <!-- Pagination -->
        <CatalogPagination
          v-if="hasCity && !isEmpty && meta && links && meta.last_page > 1"
          :meta="meta"
          :links="links"
          @page-change="onPageChange"
        />
      </div>
    </main>

    <LandingTheFooter />
  </div>
</template>
