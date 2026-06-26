<script setup lang="ts">
/**
 * Account / Mis Pedidos – Listado paginado del historial de pedidos del usuario.
 *
 * Consume `GET /api/orders?page=X&per_page=Y` y muestra cada pedido en una
 * tarjeta horizontal con thumbnail, número de pedido, badge de estado,
 * destinatario y leyenda de fecha. Incluye controles de paginación.
 */
import type { PaginatedResponse } from '@@/types/index'
import { getOrders, type OrderListItem } from '~/api/orders'

definePageMeta({
  layout: 'landing',
  middleware: 'auth',
})

/** Estado reactivo del listado. */
const orders = ref<OrderListItem[]>([])

/** Metadatos de paginación devueltos por Laravel. */
const pagination = ref<PaginatedResponse<OrderListItem>['meta'] | null>(null)
const links = ref<PaginatedResponse<OrderListItem>['links'] | null>(null)

const isLoading = ref(true)
const errorMessage = ref<string | null>(null)
const currentPage = ref(1)

/** Trae los pedidos de la página solicitada. */
async function fetchOrders(page = 1): Promise<void> {
  isLoading.value = true
  errorMessage.value = null
  try {
    const { data } = await getOrders(page, 10)
    orders.value = data.data
    pagination.value = data.meta
    links.value = data.links
    currentPage.value = data.meta.current_page
  }
  catch {
    errorMessage.value = 'No pudimos cargar tu historial de pedidos. Intenta de nuevo en unos minutos.'
    orders.value = []
    pagination.value = null
    links.value = null
  }
  finally {
    isLoading.value = false
  }
}

onMounted(() => {
  void fetchOrders(1)
})

/** Navegación de paginación. */
const hasPrevPage = computed<boolean>(() => Boolean(links.value?.prev))
const hasNextPage = computed<boolean>(() => Boolean(links.value?.next))

async function goToPrev(): Promise<void> {
  if (!hasPrevPage.value) return
  await fetchOrders(currentPage.value - 1)
}

async function goToNext(): Promise<void> {
  if (!hasNextPage.value) return
  await fetchOrders(currentPage.value + 1)
}

/**
 * Devuelve las clases Tailwind para el badge de estado en función del
 * nombre del status (string en español proveniente del backend).
 */
function statusBadgeClass(statusName: string | null | undefined): string {
  const base = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset'
  const normalized = (statusName ?? '').toLowerCase()

  if (normalized.includes('entregad')) return `${base} bg-green-50 text-green-700 ring-green-200`
  if (normalized.includes('enviad')) return `${base} bg-blue-50 text-blue-700 ring-blue-200`
  if (normalized.includes('proces')) return `${base} bg-indigo-50 text-indigo-700 ring-indigo-200`
  if (normalized.includes('pendient')) return `${base} bg-yellow-50 text-yellow-800 ring-yellow-200`
  if (normalized.includes('cancel')) return `${base} bg-gray-100 text-gray-600 ring-gray-300`
  if (normalized.includes('reembols')) return `${base} bg-rose-50 text-rose-700 ring-rose-200`

  return `${base} bg-gray-50 text-gray-700 ring-gray-200`
}
</script>

<template>
  <AccountLayout active-tab="orders">
    <Head>
      <Title>Mis pedidos · MegaSorpresa</Title>
    </Head>

    <div class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8">
      <div class="flex items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-gray-900">Mis pedidos</h2>
          <p class="mt-1 text-sm text-gray-500">
            Historial de tus compras y su estado de entrega.
          </p>
        </div>
        <span v-if="pagination" class="text-xs font-medium text-gray-500">
          {{ pagination.total }} {{ pagination.total === 1 ? 'pedido' : 'pedidos' }}
        </span>
      </div>

      <!-- ── Estado de carga ─────────────────────────────────────────── -->
      <ul v-if="isLoading" class="mt-6 space-y-4">
        <li
          v-for="n in 3"
          :key="n"
          class="flex animate-pulse gap-4 rounded-lg border border-gray-100 p-4"
        >
          <div class="h-20 w-20 shrink-0 rounded-lg bg-gray-200" />
          <div class="flex-1 space-y-2">
            <div class="h-3 w-32 rounded bg-gray-200" />
            <div class="h-4 w-48 rounded bg-gray-100" />
            <div class="h-3 w-40 rounded bg-gray-100" />
          </div>
        </li>
      </ul>

      <!-- ── Error ───────────────────────────────────────────────────── -->
      <div
        v-else-if="errorMessage"
        class="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200"
      >
        {{ errorMessage }}
        <button
          type="button"
          class="ml-2 font-semibold underline hover:text-red-800"
          @click="fetchOrders(currentPage)"
        >
          Reintentar
        </button>
      </div>

      <!-- ── Estado vacío ────────────────────────────────────────────── -->
      <div v-else-if="orders.length === 0" class="mt-8 flex flex-col items-center py-10 text-center">
        <div class="rounded-full bg-yellow-50 p-4 ring-1 ring-yellow-200">
          <svg class="h-8 w-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <h3 class="mt-4 text-base font-semibold text-gray-900">Aún no tienes pedidos</h3>
        <p class="mt-1 max-w-sm text-sm text-gray-500">
          Cuando realices tu primera compra aparecerá aquí con su seguimiento.
        </p>
        <NuxtLink
          to="/catalog"
          class="mt-4 inline-flex items-center rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm transition-colors hover:bg-yellow-500"
        >
          Explorar catálogo
        </NuxtLink>
      </div>

      <!-- ── Listado de pedidos ─────────────────────────────────────── -->
      <ul v-else class="mt-6 space-y-4">
        <li
          v-for="order in orders"
          :key="order.id"
          class="flex flex-col gap-4 rounded-lg border border-gray-100 p-4 transition-shadow hover:shadow-md sm:flex-row sm:items-center"
        >
          <!-- Thumbnail -->
          <div class="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100 ring-1 ring-gray-200">
            <img
              v-if="order.product_image_url"
              :src="order.product_image_url"
              :alt="`Producto del pedido ${order.order_number}`"
              class="h-full w-full object-cover"
              loading="lazy"
            >
            <div
              v-else
              class="flex h-full w-full items-center justify-center text-gray-400"
            >
              <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>

          <!-- Contenido principal -->
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-sm font-bold text-gray-900">
                Pedido {{ order.order_number }}
              </span>
              <span :class="statusBadgeClass(order.status_name)">
                {{ order.status_name ?? '—' }}
              </span>
            </div>

            <p v-if="order.recipient_name" class="mt-1 truncate text-sm text-gray-700">
              Enviado a:
              <span class="font-semibold text-gray-900">{{ order.recipient_name }}</span>
            </p>

            <p v-if="order.date_legend" class="mt-0.5 text-xs text-gray-500">
              {{ order.date_legend }}
            </p>
          </div>

          <!-- Importe + acción -->
          <div class="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
            <span class="text-sm font-bold text-gray-900">
              ${{ Number(order.total_amount).toFixed(2) }}
            </span>
            <NuxtLink
              :to="`/order/${order.id}`"
              class="text-sm font-semibold text-pink-600 transition-colors hover:text-pink-700"
            >
              Ver detalles →
            </NuxtLink>
          </div>
        </li>
      </ul>

      <!-- ── Paginación ─────────────────────────────────────────────── -->
      <nav
        v-if="!isLoading && !errorMessage && pagination && pagination.last_page > 1"
        class="mt-6 flex items-center justify-between border-t border-gray-100 pt-4"
        aria-label="Paginación de pedidos"
      >
        <button
          type="button"
          :disabled="!hasPrevPage"
          class="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          @click="goToPrev"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Anterior
        </button>

        <span class="text-sm text-gray-600">
          Página
          <span class="font-bold text-gray-900">{{ pagination.current_page }}</span>
          de
          <span class="font-bold text-gray-900">{{ pagination.last_page }}</span>
        </span>

        <button
          type="button"
          :disabled="!hasNextPage"
          class="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          @click="goToNext"
        >
          Siguiente
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </nav>
    </div>
  </AccountLayout>
</template>
