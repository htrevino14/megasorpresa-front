<script setup lang="ts">
/**
 * CategoryCarousel – Horizontally scrollable "Top categories" section.
 * Each card shows a pastel-coloured image tile and the category name below.
 * Data is defined as a const so it can later be replaced by a Laravel API call.
 *
 * @emits none
 */

interface CategoryCard {
  id: number
  name: string
  slug: string
  imageUrl: string
  bgColor: string
}

const allCategories: CategoryCard[] = [
  {
    id: 1,
    name: 'Pokémon',
    slug: 'pokemon',
    imageUrl: 'https://placehold.co/200x200/d1fae5/065f46?text=Pokémon',
    bgColor: 'bg-green-50',
  },
  {
    id: 2,
    name: 'LEGO Nuevos',
    slug: 'lego-nuevos',
    imageUrl: 'https://placehold.co/200x200/fef3c7/92400e?text=LEGO',
    bgColor: 'bg-amber-50',
  },
  {
    id: 3,
    name: 'Trampolines',
    slug: 'trampolines',
    imageUrl: 'https://placehold.co/200x200/ccfbf1/0f766e?text=Trampolines',
    bgColor: 'bg-teal-50',
  },
  {
    id: 4,
    name: 'Fútbol y porterías',
    slug: 'futbol-y-porterias',
    imageUrl: 'https://placehold.co/200x200/dbeafe/1e40af?text=Fútbol',
    bgColor: 'bg-blue-50',
  },
  {
    id: 5,
    name: 'Top Juguetes',
    slug: 'top-juguetes',
    imageUrl: 'https://placehold.co/200x200/ede9fe/4c1d95?text=Top+Toys',
    bgColor: 'bg-violet-100',
  },
  {
    id: 6,
    name: 'Play Factory',
    slug: 'play-factory',
    imageUrl: 'https://placehold.co/200x200/f3e8ff/6d28d9?text=Play+Factory',
    bgColor: 'bg-purple-50',
  },
  {
    id: 7,
    name: 'Gaming',
    slug: 'gaming',
    imageUrl: 'https://placehold.co/200x200/fce7f3/9d174d?text=Gaming',
    bgColor: 'bg-pink-50',
  },
  {
    id: 8,
    name: 'Bebés',
    slug: 'bebes',
    imageUrl: 'https://placehold.co/200x200/fff7ed/c2410c?text=Bebés',
    bgColor: 'bg-orange-50',
  },
]

const categories = computed(() => allCategories.slice(0, 6))
</script>

<template>
  <section class="bg-white px-4 py-10 md:px-8">
    <div class="mx-auto max-w-7xl">
      <h2 class="mb-6 text-2xl font-bold text-gray-900 md:text-3xl">
        Top categorías
      </h2>

      <!-- Centered 6-item grid -->
      <div class="flex flex-wrap justify-center gap-5">
        <NuxtLink
          v-for="cat in categories"
          :key="cat.id"
          :to="`/category/${cat.slug}`"
          class="group flex flex-col items-center gap-3"
        >
          <!-- Image tile -->
          <div
            class="flex h-36 w-36 items-center justify-center overflow-hidden rounded-2xl shadow-sm transition-transform duration-200 group-hover:scale-105 md:h-44 md:w-44"
            :class="cat.bgColor"
          >
            <img
              :src="cat.imageUrl"
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
