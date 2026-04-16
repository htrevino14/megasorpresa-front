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
  <section class="bg-gray-50 px-4 py-10 md:px-6">
    <div class="mx-auto w-[95%] max-w-[1400px]">
      <h2 class="mb-8 font-fredoka text-center text-2xl font-bold text-gray-900 md:text-3xl">
        Comprar por edad
      </h2>

      <div class="flex justify-start gap-4 overflow-x-auto pb-2 md:justify-between md:overflow-visible md:pb-0">
        <NuxtLink
          v-for="group in ageGroups"
          :key="group.slug"
          :to="`/age/${group.slug}`"
          class="flex h-32 w-32 shrink-0 flex-col items-center justify-center rounded-full px-2 text-center shadow-sm transition-transform duration-200 hover:scale-105 md:h-44 md:w-44"
          :style="{ backgroundColor: group.bg_color, color: group.text_color }"
        >
          <span class="font-fredoka text-xl font-bold leading-tight md:text-2xl">{{ group.label }}</span>
          <span class="mt-1 font-fredoka text-xs font-semibold tracking-wide md:text-sm">{{ group.sublabel }}</span>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
