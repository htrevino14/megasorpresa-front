<script setup lang="ts">
/**
 * ExperienciaTotal – "Features Highlight" section that communicates the three
 * core pillars of the Megasorpresa shopping experience: Tactility, Power and
 * Emotion. Displayed between the Hero slider and the Top Categories carousel.
 *
 * @emits none
 */

interface Feature {
  key: string
  title: string
  description: string
  /** SVG <path> d attribute for the feature icon (24×24 viewBox, stroke-based). */
  iconPath: string
}

const features: Feature[] = [
  {
    key: 'tactility',
    title: 'Tactility',
    description: 'Papel de seda premium para un unboxing sensorial.',
    iconPath: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10',
  },
  {
    key: 'power',
    title: 'Power',
    description: 'Baterías incluidas en cada pedido.',
    iconPath: 'M13 10V3L4 14h7v7l9-11h-7z',
  },
  {
    key: 'emotion',
    title: 'Emotion',
    description: 'Tu voz y tu imagen en nuestra tarjeta de presentación digital.',
    iconPath: 'M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z',
  },
]
</script>

<template>
  <section class="bg-gray-50 px-4 py-16 md:px-8 md:py-20">
    <div class="mx-auto max-w-7xl">
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="feature in features"
          :key="feature.key"
          class="card flex flex-col items-center gap-6 p-10 text-center transition-shadow duration-200 hover:shadow-lg"
          :class="feature.key === 'emotion' ? 'sm:col-span-2 sm:mx-auto sm:w-1/2 lg:col-span-1 lg:mx-0 lg:w-full' : ''"
        >
          <div class="flex h-20 w-20 items-center justify-center rounded-full bg-yellow-50 text-yellow-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-10 w-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="1.5"
              aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" :d="feature.iconPath" />
            </svg>
          </div>
          <div>
            <h3 class="text-2xl font-extrabold tracking-tight text-gray-900 md:text-3xl">
              {{ feature.title }}
            </h3>
            <p class="mt-3 text-base leading-relaxed text-gray-600 md:text-lg">
              {{ feature.description }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
