<script setup lang="ts">
/**
 * CatalogPagination – Page-based pagination component driven by the `meta`
 * and `links` objects returned by the Laravel paginated API response.
 *
 * Emits a `page-change` event with the new page number when the user
 * navigates; the parent is responsible for re-fetching the data.
 *
 * @prop {meta}  meta  - Pagination metadata (current_page, last_page, total, per_page).
 * @prop {links} links - First/last/prev/next URL strings (used only to determine availability).
 * @emits page-change - Emitted with the new page number.
 */
defineProps<{
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
  links: {
    first: string
    last: string
    prev: string | null
    next: string | null
  }
}>()

const emit = defineEmits<{ 'page-change': [page: number] }>()

/**
 * Build a compact window of page numbers to display.
 * Always includes first, last, current ±2 and ellipsis markers ("…").
 */
function pageWindow(current: number, last: number): (number | '…')[] {
  if (last <= 1) return [1]
  const pages = new Set<number>([1, last])
  for (let i = Math.max(2, current - 2); i <= Math.min(last - 1, current + 2); i++) {
    pages.add(i)
  }
  const sorted = [...pages].sort((a, b) => a - b)
  const result: (number | '…')[] = []
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push('…')
    result.push(sorted[i])
  }
  return result
}
</script>

<template>
  <nav
    v-if="meta.last_page > 1"
    class="mt-8 flex items-center justify-between gap-2"
    aria-label="Paginación"
  >
    <!-- Resultado count -->
    <p class="hidden text-sm text-gray-500 sm:block">
      {{ (meta.current_page - 1) * meta.per_page + 1 }}–{{ Math.min(meta.current_page * meta.per_page, meta.total) }}
      de {{ meta.total }} productos
    </p>

    <!-- Page buttons -->
    <div class="flex items-center gap-1">
      <!-- Prev -->
      <button
        :disabled="!links.prev"
        class="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Página anterior"
        @click="emit('page-change', meta.current_page - 1)"
      >
        ‹
      </button>

      <!-- Page numbers -->
      <template v-for="page in pageWindow(meta.current_page, meta.last_page)" :key="page">
        <span v-if="page === '…'" class="px-1 text-gray-400 select-none">…</span>
        <button
          v-else
          :class="[
            'rounded-md border px-3 py-1.5 text-sm font-medium shadow-sm transition',
            page === meta.current_page
              ? 'border-yellow-400 bg-yellow-400 text-white'
              : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50',
          ]"
          :aria-current="page === meta.current_page ? 'page' : undefined"
          @click="emit('page-change', page)"
        >
          {{ page }}
        </button>
      </template>

      <!-- Next -->
      <button
        :disabled="!links.next"
        class="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Página siguiente"
        @click="emit('page-change', meta.current_page + 1)"
      >
        ›
      </button>
    </div>
  </nav>
</template>
