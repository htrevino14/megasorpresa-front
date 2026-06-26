<script setup lang="ts">
/**
 * order/[id] – Detalle completo de un pedido (`/order/:id`).
 *
 * Extrae el `id` de la ruta, solicita `GET /api/orders/:id` mediante la
 * instancia Axios centralizada y expone el estado de carga/error a la
 * plantilla. Requiere sesión iniciada (middleware `auth`).
 */
import { isAxiosError } from 'axios'
import { getOrder, type OrderDeliverySlotInfo, type OrderDetail, type OrderLineItem } from '~/api/orders'

definePageMeta({
  layout: 'landing',
  middleware: 'auth',
})

const route = useRoute()

/** Estado reactivo de la vista. */
const order = ref<OrderDetail | null>(null)
const isLoading = ref(true)
const errorMessage = ref<string | null>(null)

/**
 * Solicita el detalle del pedido identificado en la URL.
 * Traduce los códigos 401/403/404 a mensajes legibles para el usuario.
 */
async function fetchOrderDetail(): Promise<void> {
  isLoading.value = true
  errorMessage.value = null
  try {
    const { data } = await getOrder(String(route.params.id))
    order.value = data.data
  }
  catch (error: unknown) {
    order.value = null
    if (isAxiosError(error)) {
      const status = error.response?.status
      if (status === 404) errorMessage.value = 'No encontramos el pedido que buscas.'
      else if (status === 403) errorMessage.value = 'No tienes permiso para ver este pedido.'
      else if (status === 401) errorMessage.value = 'Inicia sesión para ver el detalle de tu pedido.'
      else errorMessage.value = 'No pudimos cargar el detalle del pedido. Intenta de nuevo en unos minutos.'
    }
    else {
      errorMessage.value = 'Ocurrió un error inesperado. Intenta de nuevo.'
    }
  }
  finally {
    isLoading.value = false
  }
}

onMounted(() => {
  void fetchOrderDetail()
})

/** Subtotal calculado a partir de los items (los importes llegan como número/decimal). */
const itemsSubtotal = computed<number>(() =>
  (order.value?.items ?? []).reduce((sum, item) => sum + Number(item.total), 0),
)

/** Etiqueta corta del pedido con formato `#00123` (id con padding a 5 dígitos). */
const orderNumberLabel = computed<string>(() =>
  order.value ? `#${String(order.value.id).padStart(5, '0')}` : '',
)

/** Indica si el pedido tuvo costo de envío (> 0) para mostrarlo en el desglose. */
const hasShipping = computed<boolean>(() => Number(order.value?.shipping_cost ?? 0) > 0)

/** Etiquetas legibles para el método de pago almacenado en el backend. */
const PAYMENT_METHOD_LABELS: Record<string, string> = {
  mercadopago: 'Mercado Pago',
  oxxo: 'OXXO',
  card: 'Tarjeta',
  cash: 'Efectivo',
  transfer: 'Transferencia',
}

/** Método de pago en formato legible (o un texto por defecto). */
const paymentMethodLabel = computed<string>(() => {
  const method = order.value?.payment_method
  if (!method) return 'No especificado'
  return PAYMENT_METHOD_LABELS[method] ?? method
})

/** Formatea un importe numérico/decimal a moneda con dos decimales. */
function formatMoney(value: number | string | null | undefined): string {
  return `$${Number(value ?? 0).toFixed(2)}`
}

/** Devuelve la imagen del producto de un item (primaria si existe). */
function productImage(item: OrderLineItem): string | null {
  const product = item.product
  if (!product) return null
  if (product.primary_image) return product.primary_image
  const primary = product.images?.find(img => img.is_primary) ?? product.images?.[0]
  return primary?.url ?? null
}

/** Rango horario legible de la franja de entrega (`09:00 – 13:00`). */
function slotRange(slot: OrderDeliverySlotInfo | null): string | null {
  if (!slot || !slot.start_time || !slot.end_time) return null
  return `${slot.start_time.slice(0, 5)} – ${slot.end_time.slice(0, 5)}`
}

/** Clases del badge de estado según el nombre (string en español del backend). */
function statusBadgeClass(statusName: string | null | undefined): string {
  const base = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset'
  const normalized = (statusName ?? '').toLowerCase()
  if (normalized.includes('entregad')) return `${base} bg-green-50 text-green-700 ring-green-200`
  if (normalized.includes('enviad')) return `${base} bg-blue-50 text-blue-700 ring-blue-200`
  if (normalized.includes('proces')) return `${base} bg-indigo-50 text-indigo-700 ring-indigo-200`
  if (normalized.includes('pendient')) return `${base} bg-yellow-50 text-yellow-800 ring-yellow-200`
  if (normalized.includes('cancel')) return `${base} bg-gray-100 text-gray-600 ring-gray-300`
  return `${base} bg-gray-50 text-gray-700 ring-gray-200`
}

useHead(
  computed(() => ({
    title: order.value
      ? `Pedido ${order.value.order_number} · MegaSorpresa`
      : 'Detalle del pedido · MegaSorpresa',
  })),
)
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gray-50">
    <LandingTheHeader />

    <main class="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <!-- ── Navegación de regreso ──────────────────────────────────────── -->
      <NuxtLink
        to="/account/orders"
        class="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 transition-colors hover:text-gray-900"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Volver a mis pedidos
      </NuxtLink>

      <!-- ── Estado de carga ────────────────────────────────────────────── -->
      <div v-if="isLoading" class="grid gap-6 lg:grid-cols-10">
        <div class="space-y-6 lg:col-span-7">
          <div class="h-24 animate-pulse rounded-xl bg-gray-200" />
          <div class="h-40 animate-pulse rounded-xl bg-gray-200" />
          <div class="h-72 animate-pulse rounded-xl bg-gray-200" />
        </div>
        <div class="h-64 animate-pulse rounded-xl bg-gray-200 lg:col-span-3" />
      </div>

      <!-- ── Estado de error ────────────────────────────────────────────── -->
      <div
        v-else-if="errorMessage"
        class="flex flex-col items-center gap-4 rounded-xl bg-white p-10 text-center shadow-sm ring-1 ring-gray-200"
      >
        <span class="text-5xl">😕</span>
        <h1 class="text-xl font-bold text-gray-800">No pudimos mostrar el pedido</h1>
        <p class="max-w-md text-sm text-gray-500">{{ errorMessage }}</p>
        <div class="mt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            class="inline-flex items-center rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm transition-colors hover:bg-yellow-500"
            @click="fetchOrderDetail"
          >
            Reintentar
          </button>
          <NuxtLink
            to="/account/orders"
            class="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            Ver mis pedidos
          </NuxtLink>
        </div>
      </div>

      <!-- ── Detalle del pedido (solo con datos y sin carga) ────────────── -->
      <div v-else-if="order" class="grid gap-6 lg:grid-cols-10">
        <!-- ════════ Columna izquierda: envío y productos (70 %) ════════ -->
        <div class="space-y-6 lg:col-span-7">
          <!-- 1. Cabecera: número de pedido + badge de estado -->
          <header class="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-gray-200 bg-white p-6">
            <div>
              <p class="text-xs font-medium uppercase tracking-wide text-gray-400">
                Detalle del pedido
              </p>
              <h1 class="mt-1 text-2xl font-bold text-gray-900">
                Pedido {{ orderNumberLabel }}
              </h1>
              <p v-if="order.date_legend" class="mt-1 text-sm text-gray-500">
                {{ order.date_legend }}
              </p>
              <p v-if="order.tracking_number" class="mt-0.5 text-xs text-gray-400">
                Guía: {{ order.tracking_number }}
              </p>
            </div>
            <span :class="statusBadgeClass(order.status_name)">
              {{ order.status_name ?? '—' }}
            </span>
          </header>

          <!-- 2. Sección destinatario: datos de entrega -->
          <section v-if="order.detail" class="rounded-xl border border-gray-200 bg-white p-6">
            <h2 class="text-base font-bold text-gray-900">Datos de entrega</h2>
            <dl class="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt class="text-xs font-medium uppercase tracking-wide text-gray-400">Entregar a</dt>
                <dd class="mt-0.5 font-semibold text-gray-900">
                  {{ order.detail.recipient_name ?? '—' }}
                </dd>
              </div>
              <div v-if="order.detail.recipient_phone">
                <dt class="text-xs font-medium uppercase tracking-wide text-gray-400">Teléfono</dt>
                <dd class="mt-0.5 text-gray-700">{{ order.detail.recipient_phone }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium uppercase tracking-wide text-gray-400">Fecha programada</dt>
                <dd class="mt-0.5 text-gray-700">{{ order.detail.delivery_date ?? '—' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium uppercase tracking-wide text-gray-400">Horario</dt>
                <dd class="mt-0.5 text-gray-700">
                  {{ slotRange(order.detail.delivery_slot) ?? '—' }}
                </dd>
              </div>
              <div v-if="order.detail.address" class="sm:col-span-2">
                <dt class="text-xs font-medium uppercase tracking-wide text-gray-400">Dirección de entrega</dt>
                <dd class="mt-0.5 text-gray-700">
                  <template v-if="order.detail.address.full_address">
                    {{ order.detail.address.full_address }}
                  </template>
                  <template v-else>
                    <span v-if="order.detail.address.street">{{ order.detail.address.street }} </span>
                    <span v-if="order.detail.address.ext_number">{{ order.detail.address.ext_number }}</span>
                    <span v-if="order.detail.address.neighborhood">, {{ order.detail.address.neighborhood }}</span>
                    <span v-if="order.detail.address.city">, {{ order.detail.address.city }}</span>
                    <span v-if="order.detail.address.state">, {{ order.detail.address.state }}</span>
                    <span v-if="order.detail.address.zip_code">, C.P. {{ order.detail.address.zip_code }}</span>
                  </template>
                </dd>
                <p v-if="order.detail.address.references" class="mt-1 text-xs text-gray-500">
                  Referencias: {{ order.detail.address.references }}
                </p>
              </div>
            </dl>
          </section>

          <!-- 3. Sección mensaje: dedicatoria + firma -->
          <section
            v-if="order.detail && (order.detail.card_message || order.detail.signature)"
            class="rounded-xl border border-yellow-200 bg-yellow-50 p-6"
          >
            <div class="flex items-center gap-2">
              <svg class="h-5 w-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h2 class="text-base font-bold text-gray-900">Mensaje de la tarjeta</h2>
            </div>
            <p v-if="order.detail.card_message" class="mt-3 text-base italic leading-relaxed text-gray-700">
              “{{ order.detail.card_message }}”
            </p>
            <p v-if="order.detail.signature" class="mt-3 text-right text-sm font-semibold text-gray-800">
              — {{ order.detail.signature }}
            </p>
          </section>

          <!-- 4. Lista de productos -->
          <section class="rounded-xl border border-gray-200 bg-white p-6">
            <div class="flex items-center justify-between">
              <h2 class="text-base font-bold text-gray-900">Productos</h2>
              <span class="text-xs font-medium text-gray-400">
                {{ order.items.length }} {{ order.items.length === 1 ? 'artículo' : 'artículos' }}
              </span>
            </div>

            <ul class="mt-4 divide-y divide-gray-100">
              <li v-for="item in order.items" :key="item.id" class="flex items-center gap-4 py-4">
                <!-- Miniatura -->
                <div class="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100 ring-1 ring-gray-200">
                  <img
                    v-if="productImage(item)"
                    :src="productImage(item)!"
                    :alt="item.product?.name ?? 'Producto'"
                    class="h-full w-full object-cover"
                    loading="lazy"
                  >
                  <div v-else class="flex h-full w-full items-center justify-center text-gray-400">
                    <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>

                <!-- Nombre + cantidad -->
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-semibold text-gray-900">
                    {{ item.product?.name ?? 'Producto' }}
                  </p>
                  <p v-if="item.product?.sku" class="mt-0.5 text-xs text-gray-400">
                    SKU: {{ item.product.sku }}
                  </p>
                  <p class="mt-1 text-sm text-gray-500">
                    Cantidad: <span class="font-medium text-gray-700">{{ item.quantity }}</span>
                  </p>
                </div>

                <!-- Precio unitario + total de línea -->
                <div class="shrink-0 text-right">
                  <p class="text-sm font-bold text-gray-900">{{ formatMoney(item.unit_price) }}</p>
                  <p class="mt-0.5 text-xs text-gray-400">c/u</p>
                  <p class="mt-1 text-sm font-semibold text-gray-700">{{ formatMoney(item.total) }}</p>
                </div>
              </li>
            </ul>
          </section>
        </div>

        <!-- ════════ Columna derecha: resumen de pago (30 %) ════════ -->
        <aside class="lg:col-span-3">
          <div class="rounded-xl border border-gray-200 bg-white p-6 lg:sticky lg:top-28">
            <h2 class="text-base font-bold text-gray-900">Resumen de pago</h2>

            <!-- Método de pago -->
            <div class="mt-4 flex items-center justify-between rounded-lg bg-gray-50 p-3 ring-1 ring-gray-100">
              <span class="text-sm text-gray-500">Método de pago</span>
              <span class="text-sm font-semibold text-gray-900">{{ paymentMethodLabel }}</span>
            </div>

            <!-- Desglose de costos -->
            <dl class="mt-4 space-y-3 border-t border-gray-100 pt-4 text-sm">
              <div class="flex items-center justify-between text-gray-600">
                <dt>Subtotal</dt>
                <dd>{{ formatMoney(itemsSubtotal) }}</dd>
              </div>
              <div v-if="hasShipping" class="flex items-center justify-between text-gray-600">
                <dt>Costo de envío</dt>
                <dd>{{ formatMoney(order.shipping_cost) }}</dd>
              </div>
              <div v-else class="flex items-center justify-between text-green-600">
                <dt>Envío</dt>
                <dd class="font-semibold">Gratis</dd>
              </div>
              <div class="flex items-end justify-between border-t border-gray-100 pt-4">
                <dt class="text-sm font-semibold text-gray-700">Total pagado</dt>
                <dd class="text-2xl font-bold text-gray-900">{{ formatMoney(order.total_amount) }}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </main>

    <LandingTheFooter />
  </div>
</template>
