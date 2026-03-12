<script setup lang="ts">
/**
 * AgeSelector – "Shop by age" section with vibrant circular age-group buttons.
 * Data is defined as a const so it can later be replaced by a Laravel API call.
 *
 * @emits none
 */

interface AgeGroup {
  label: string
  sublabel: string
  slug: string
  bgColor: string
  textColor: string
}

const ageGroups: AgeGroup[] = [
  {
    label: '0-18',
    sublabel: 'MESES',
    slug: '0-18-meses',
    bgColor: 'bg-[#b2f0e8]',
    textColor: 'text-[#065f46]',
  },
  {
    label: '18-36',
    sublabel: 'MESES',
    slug: '18-36-meses',
    bgColor: 'bg-[#ddd6fe]',
    textColor: 'text-[#4c1d95]',
  },
  {
    label: '3-5',
    sublabel: 'AÑOS',
    slug: '3-5-anos',
    bgColor: 'bg-[#a7f3d0]',
    textColor: 'text-[#064e3b]',
  },
  {
    label: '6-8',
    sublabel: 'AÑOS',
    slug: '6-8-anos',
    bgColor: 'bg-[#fed7aa]',
    textColor: 'text-[#7c2d12]',
  },
  {
    label: '9-11',
    sublabel: 'AÑOS',
    slug: '9-11-anos',
    bgColor: 'bg-[#bfdbfe]',
    textColor: 'text-[#1e3a5f]',
  },
  {
    label: 'BIG',
    sublabel: 'KIDS',
    slug: 'big-kids',
    bgColor: 'bg-[#fecdd3]',
    textColor: 'text-[#881337]',
  },
]
</script>

<template>
  <section class="bg-gray-50 px-4 py-10 md:px-8">
    <div class="mx-auto max-w-7xl">
      <h2 class="mb-8 text-2xl font-bold text-gray-900 md:text-3xl">
        Comprar por edad
      </h2>

      <div class="flex flex-wrap justify-center gap-5 sm:justify-start">
        <NuxtLink
          v-for="group in ageGroups"
          :key="group.slug"
          :to="`/age/${group.slug}`"
          class="flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-full shadow-sm transition-transform duration-200 hover:scale-105 md:h-36 md:w-36"
          :class="[group.bgColor, group.textColor]"
        >
          <span class="text-xl font-extrabold leading-tight md:text-2xl">{{ group.label }}</span>
          <span class="mt-0.5 text-xs font-semibold tracking-widest md:text-sm">{{ group.sublabel }}</span>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
