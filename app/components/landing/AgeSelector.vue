<script setup lang="ts">
/**
 * AgeSelector – "Shop by age" section with vibrant circular age-group buttons.
 * Data is fetched from GET /api/landing/age-groups.
 *
 * @emits none
 */
import { getAgeGroups } from '~/api/landing'
import type { AgeGroup } from '@@/types/index'

const { data: ageData } = await useAsyncData<AgeGroup[]>(
  'age-groups',
  () => getAgeGroups().then(r => r.data.data),
)

const ageGroups = computed<AgeGroup[]>(() => ageData.value ?? [])
</script>

<template>
  <section class="bg-gray-50 px-4 py-10 md:px-8">
    <div class="mx-auto max-w-7xl">
      <h2 class="mb-8 text-center text-2xl font-bold text-gray-900 md:text-3xl">
        Comprar por edad
      </h2>

      <div class="flex flex-wrap justify-center gap-5">
        <NuxtLink
          v-for="group in ageGroups"
          :key="group.slug"
          :to="`/age/${group.slug}`"
          class="flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-full shadow-sm transition-transform duration-200 hover:scale-105 md:h-36 md:w-36"
          :style="{ backgroundColor: group.bg_color, color: group.text_color }"
        >
          <span class="text-xl font-extrabold leading-tight md:text-2xl">{{ group.label }}</span>
          <span class="mt-0.5 text-xs font-semibold tracking-widest md:text-sm">{{ group.sublabel }}</span>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
