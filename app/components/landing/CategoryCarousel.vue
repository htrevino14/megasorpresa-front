<script setup lang="ts">
/**
 * CategoryCarousel – Horizontally scrollable "Top categories" section.
 * Each card shows a pastel-coloured image tile and the category name below.
 * Data is fetched from GET /api/landing/category-carousel.
 * Clicking navigates to /catalog with the category filter applied.
 *
 * @emits none
 */
import { getCategoryCarousel } from '~/api/landing'
import type { CategoryCarouselItem } from '@@/types/index'

const { data: carouselData } = await useAsyncData<CategoryCarouselItem[]>(
  'category-carousel',
  () => getCategoryCarousel().then(r => r.data.data),
)

const categories = computed<CategoryCarouselItem[]>(() => carouselData.value ?? [])

const catalogStore = useCatalogStore()

/**
 * Navigate to catalog with category filter
 */
function selectCategory(categorySlug: string) {
  // Clear previous filters and set the category filter
  catalogStore.clearAllFilters()
  catalogStore.setCategory(categorySlug)
}
</script>

<template>
  <section class="bg-white px-4 py-10 md:px-8">
    <div class="mx-auto max-w-7xl">
      <h2 class="mb-6 text-2xl font-bold text-gray-900 md:text-3xl">
        Categorías
      </h2>

      <!-- Centered 6-item grid -->
      <div class="flex flex-wrap justify-center gap-5">
        <NuxtLink
          v-for="cat in categories"
          :key="cat.id"
          :to="{ path: '/catalog', query: { category: cat.slug } }"
          class="group flex flex-col items-center gap-3"
          @click="selectCategory(cat.slug)"
        >
          <!-- Image tile -->
          <div
            class="flex h-36 w-36 items-center justify-center overflow-hidden rounded-2xl shadow-sm transition-transform duration-200 group-hover:scale-105 md:h-44 md:w-44"
            :class="cat.bg_color"
          >
            <img
              :src="cat.image_url"
              :alt="cat.name"
              class="h-full w-full object-cover"
              loading="lazy"
            />
          </div>

          <!-- Category name -->
          <span class="text-center text-sm font-medium text-gray-700 transition-colors group-hover:text-[#0072E3]">
            {{ cat.name }}
          </span>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
