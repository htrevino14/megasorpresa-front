<script setup lang="ts">
/**
 * HeroSection – Full-width hero banner with a blue gradient left panel and
 * a product image on the right. Supports multiple slides with prev/next controls.
 *
 * @emits none
 */

interface HeroSlide {
  title: string
  subtitle: string
  ctaText: string
  ctaLink: string
  imageUrl: string
}

const heroSlides: HeroSlide[] = [
  {
    title: 'Gran valor – 2 x $299',
    subtitle: "Autos de control remoto Spin n' Stunt escala 1:24",
    ctaText: 'Comprar ahora',
    ctaLink: '/category/juguetes',
    imageUrl: 'https://placehold.co/900x520/4a90d9/ffffff?text=Juguetes+RC',
  },
  {
    title: 'Nuevas llegadas LEGO',
    subtitle: 'Descubre los sets más nuevos de tu colección favorita',
    ctaText: 'Ver colección',
    ctaLink: '/category/juguetes',
    imageUrl: 'https://placehold.co/900x520/f97316/ffffff?text=LEGO+Sets',
  },
  {
    title: 'Gaming – La mejor selección',
    subtitle: 'Consolas, juegos y accesorios para todos los niveles',
    ctaText: 'Explorar gaming',
    ctaLink: '/category/gaming',
    imageUrl: 'https://placehold.co/900x520/7c3aed/ffffff?text=Gaming',
  },
]

const currentSlide = ref(0)

function nextSlide() {
  currentSlide.value = (currentSlide.value + 1) % heroSlides.length
}

function prevSlide() {
  currentSlide.value = (currentSlide.value - 1 + heroSlides.length) % heroSlides.length
}
</script>

<template>
  <section class="relative h-72 overflow-hidden sm:h-96 md:h-[520px]">
    <!-- Slides -->
    <div
      v-for="(slide, index) in heroSlides"
      :key="index"
      class="absolute inset-0 flex transition-opacity duration-500"
      :class="index === currentSlide ? 'opacity-100' : 'pointer-events-none opacity-0'"
    >
      <!-- Right image panel (full bleed, behind gradient) -->
      <div class="absolute inset-0">
        <img
          :src="slide.imageUrl"
          :alt="slide.title"
          class="h-full w-full object-cover"
          loading="lazy"
        />
      </div>

      <!-- Left content panel with gradient overlay -->
      <div
        class="relative z-10 flex w-full flex-col justify-center px-8 py-12 md:w-1/2 md:px-16"
        style="background: linear-gradient(to right, #0072E3 55%, rgba(0,114,227,0.7) 80%, transparent 100%);"
      >
        <h1 class="text-2xl font-bold leading-tight text-white sm:text-3xl md:text-5xl">
          {{ slide.title }}
        </h1>
        <p class="mt-3 max-w-sm text-sm text-blue-100 sm:text-base md:text-lg">
          {{ slide.subtitle }}
        </p>
        <div class="mt-6">
          <NuxtLink
            :to="slide.ctaLink"
            class="inline-block rounded-full bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-md transition-colors hover:bg-gray-100"
          >
            {{ slide.ctaText }}
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Prev button -->
    <button
      class="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow transition-colors hover:bg-white"
      aria-label="Anterior"
      @click="prevSlide"
    >
      <svg class="h-5 w-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>

    <!-- Next button -->
    <button
      class="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow transition-colors hover:bg-white"
      aria-label="Siguiente"
      @click="nextSlide"
    >
      <svg class="h-5 w-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </button>

    <!-- Dot indicators -->
    <div class="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
      <button
        v-for="(_, index) in heroSlides"
        :key="index"
        class="h-2 rounded-full transition-all"
        :class="index === currentSlide ? 'w-6 bg-white' : 'w-2 bg-white/50'"
        :aria-label="`Ir a la diapositiva ${index + 1}`"
        @click="currentSlide = index"
      />
    </div>
  </section>
</template>
