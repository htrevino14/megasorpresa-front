<script setup lang="ts">
/**
 * Account / Direcciones de envío – Listado paginado de las direcciones guardadas.
 *
 * Muestra las direcciones en un grid de 2 columnas (en desktop) con tarjetas
 * que permiten editar o eliminar. Incluye estados de carga, vacío, error y
 * paginación numerada.
 */
import type { PaginatedResponse } from '@@/types/index'
import { getAddresses, type UserAddress } from '~/api/addresses'

definePageMeta({
  layout: 'landing',
  middleware: 'auth',
})

const addresses = ref<UserAddress[]>([])
const pagination = ref<PaginatedResponse<UserAddress>['meta'] | null>(null)
const isLoading = ref(true)
const errorMessage = ref<string | null>(null)

async function fetchAddresses(page = 1): Promise<void> {
  isLoading.value = true
  errorMessage.value = null
  try {
    const { data } = await getAddresses(page, 6)
    addresses.value = data.data
    pagination.value = data.meta
  }
  catch {
    errorMessage.value = 'No pudimos cargar tus direcciones. Intenta de nuevo.'
    addresses.value = []
    pagination.value = null
  }
  finally {
    isLoading.value = false
  }
}

onMounted(() => {
  void fetchAddresses(1)
})

/**
 * Genera el array de páginas a mostrar en la barra de paginación.
 * Siempre incluye la primera, la última y las dos adyacentes a la actual;
 * separa bloques no contiguos con `null` (renderizado como "…").
 */
const pageNumbers = computed<(number | null)[]>(() => {
  if (!pagination.value) return []
  const { current_page: cur, last_page: last } = pagination.value
  if (last <= 1) return []

  const visible = new Set<number>([1, last, cur, cur - 1, cur + 1].filter(n => n >= 1 && n <= last))
  const sorted = [...visible].sort((a, b) => a - b)

  const result: (number | null)[] = []
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i]! - sorted[i - 1]! > 1) result.push(null)
    result.push(sorted[i]!)
  }
  return result
})

/** Eliminar dirección (placeholder — requiere endpoint DELETE /addresses/{id}). */
function handleDelete(address: UserAddress): void {
  // TODO: implementar confirmación + DELETE /api/addresses/{id}
  console.warn('Eliminar dirección:', address.id)
}

/** Editar dirección (placeholder — abre modal / navega a form). */
function handleEdit(address: UserAddress): void {
  // TODO: implementar apertura de modal o navegación a /account/addresses/{id}/edit
  console.warn('Editar dirección:', address.id)
}
</script>

<template>
  <AccountLayout active-tab="addresses">
    <Head>
      <Title>Direcciones de envío · MegaSorpresa</Title>
    </Head>

    <!-- Cabecera de sección -->
    <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-xl font-bold text-gray-900">Direcciones de envío</h1>
        <p class="mt-0.5 text-sm text-gray-500">Tus domicilios guardados para entregas.</p>
      </div>
      <button
        type="button"
        class="self-start text-sm font-semibold text-pink-600 transition-colors hover:text-pink-700 sm:self-auto"
      >
        + Agregar una nueva dirección
      </button>
    </div>

    <!-- ── Estado de carga ─────────────────────────────────────────────── -->
    <div v-if="isLoading" class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div
        v-for="n in 4"
        :key="n"
        class="animate-pulse rounded-xl border border-gray-100 bg-white p-5"
      >
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-2">
            <div class="h-5 w-5 rounded bg-gray-200" />
            <div class="h-4 w-32 rounded bg-gray-200" />
          </div>
          <div class="flex gap-2">
            <div class="h-5 w-5 rounded bg-gray-100" />
            <div class="h-5 w-5 rounded bg-gray-100" />
          </div>
        </div>
        <div class="mt-3 space-y-2">
          <div class="h-3 w-full rounded bg-gray-100" />
          <div class="h-3 w-3/4 rounded bg-gray-100" />
          <div class="h-3 w-1/2 rounded bg-gray-100" />
        </div>
      </div>
    </div>

    <!-- ── Error ───────────────────────────────────────────────────────── -->
    <div
      v-else-if="errorMessage"
      class="rounded-lg bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200"
    >
      {{ errorMessage }}
      <button
        type="button"
        class="ml-2 font-semibold underline hover:text-red-800"
        @click="fetchAddresses(1)"
      >
        Reintentar
      </button>
    </div>

    <!-- ── Estado vacío ────────────────────────────────────────────────── -->
    <div
      v-else-if="addresses.length === 0"
      class="flex flex-col items-center rounded-xl border border-dashed border-gray-300 bg-white py-12 text-center"
    >
      <div class="rounded-full bg-yellow-50 p-4 ring-1 ring-yellow-200">
        <svg class="h-8 w-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </div>
      <h3 class="mt-4 text-base font-semibold text-gray-900">No tienes direcciones guardadas</h3>
      <p class="mt-1 max-w-xs text-sm text-gray-500">
        Agrega tu primera dirección para agilizar tus próximas compras.
      </p>
      <button
        type="button"
        class="mt-4 inline-flex items-center rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm transition-colors hover:bg-yellow-500"
      >
        + Agregar dirección
      </button>
    </div>

    <!-- ── Grid de tarjetas ────────────────────────────────────────────── -->
    <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <article
        v-for="address in addresses"
        :key="address.id"
        class="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
      >
        <!-- Fila superior: icono + nombre / acciones -->
        <div class="flex items-start justify-between gap-3">
          <!-- Icono de casa + nombre del destinatario -->
          <div class="flex items-center gap-2 min-w-0">
            <span class="shrink-0 text-yellow-500">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 12l9-9 9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9"
                />
              </svg>
            </span>
            <span class="truncate text-sm font-bold text-gray-900">
              {{ address.recipient_name || 'Sin nombre' }}
            </span>
          </div>

          <!-- Acciones: editar / eliminar -->
          <div class="flex shrink-0 items-center gap-1">
            <button
              type="button"
              title="Editar dirección"
              class="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
              @click="handleEdit(address)"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15.232 5.232l3.536 3.536M9 11l6.536-6.536a2 2 0 012.828 2.828L11.828 13.828a2 2 0 01-.707.464l-3.535 1.415 1.414-3.536A2 2 0 019 11z"
                />
              </svg>
            </button>
            <button
              type="button"
              title="Eliminar dirección"
              class="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
              @click="handleDelete(address)"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Detalle de la dirección -->
        <div class="mt-3 space-y-0.5 text-sm text-gray-500">
          <p>{{ address.full_address }}</p>
          <p v-if="address.city_name || address.state_name">
            {{ [address.city_name, address.state_name].filter(Boolean).join(', ') }}
          </p>
          <p v-if="address.phone" class="mt-1 font-medium text-gray-700">
            📞 {{ address.phone }}
          </p>
        </div>
      </article>
    </div>

    <!-- ── Paginación numerada ─────────────────────────────────────────── -->
    <nav
      v-if="!isLoading && !errorMessage && pagination && pagination.last_page > 1"
      class="flex items-center justify-center gap-1 pt-2"
      aria-label="Paginación de direcciones"
    >
      <!-- Anterior -->
      <button
        type="button"
        :disabled="pagination.current_page === 1"
        class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Página anterior"
        @click="fetchAddresses(pagination!.current_page - 1)"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <!-- Números / separadores -->
      <template v-for="(page, idx) in pageNumbers" :key="idx">
        <!-- Separador "…" -->
        <span
          v-if="page === null"
          class="inline-flex h-9 w-9 items-center justify-center text-sm text-gray-400"
          aria-hidden="true"
        >…</span>

        <!-- Número de página -->
        <button
          v-else
          type="button"
          :aria-current="page === pagination.current_page ? 'page' : undefined"
          class="inline-flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-semibold transition-colors"
          :class="page === pagination.current_page
            ? 'border-yellow-400 bg-yellow-400 text-gray-900 shadow-sm'
            : 'border-gray-300 text-gray-700 hover:bg-gray-50'"
          @click="fetchAddresses(page)"
        >
          {{ page }}
        </button>
      </template>

      <!-- Siguiente -->
      <button
        type="button"
        :disabled="pagination.current_page === pagination.last_page"
        class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Página siguiente"
        @click="fetchAddresses(pagination!.current_page + 1)"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </nav>
  </AccountLayout>
</template>
