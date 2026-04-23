<script setup lang="ts">
/**
 * WrapperSelector – Interactive gift wrapping selector for checkout.
 *
 * Allows users to choose from different gift wrap designs. All options are
 * free as part of the Megasorpresa value proposition. Shows a dynamic preview
 * of the gift box that updates based on the selected wrapping style.
 *
 * @prop {number | null} modelValue - Currently selected wrapping ID (for v-model).
 * @emits update:modelValue - Emitted when the user selects a wrapping option.
 */
import type { WrappingOption } from '@@/types/index'

const props = defineProps<{
  modelValue?: number | null
}>()

const emit = defineEmits<{
  'update:modelValue': [wrappingId: number]
}>()

// Mock data as specified in the issue
const wrappingOptions: WrappingOption[] = [
  { id: 1, name: 'Clásico Megasorpresa', hex: '#F3F4F6', texture_url: '/textures/default-paper.jpg' },
  { id: 2, name: 'Aventura Dinosaurio', hex: '#22C55E', texture_url: '/textures/dino-skin.jpg' },
  { id: 3, name: 'Mundo de Fantasía', hex: '#EC4899', texture_url: '/textures/unicorn-pattern.jpg' },
  { id: 4, name: 'Estelar Galáctico', hex: '#1E293B', texture_url: '/textures/space-pattern.jpg' },
]

// Local state for selected and hovered options
const selectedWrappingId = ref<number | null>(props.modelValue ?? null)
const hoveredWrappingId = ref<number | null>(null)

// Computed property for the active wrapper (hovered or selected)
const activeWrapper = computed<WrappingOption>(() => {
  const activeId = hoveredWrappingId.value ?? selectedWrappingId.value ?? 1
  return wrappingOptions.find(w => w.id === activeId) || wrappingOptions[0]
})

// Watch for prop changes
watch(() => props.modelValue, (newValue) => {
  selectedWrappingId.value = newValue ?? null
})

// Handle selection
function selectWrapper(id: number) {
  selectedWrappingId.value = id
  emit('update:modelValue', id)
}

// Handle mouse enter on swatch
function handleMouseEnter(id: number) {
  hoveredWrappingId.value = id
}

// Handle mouse leave on swatch
function handleMouseLeave() {
  hoveredWrappingId.value = null
}
</script>

<template>
  <div class="card">
    <!-- Title and benefit badge -->
    <div class="mb-6 flex items-start justify-between gap-3">
      <div>
        <h3 class="text-lg font-bold text-gray-900">
          Elige tu envoltura de regalo
        </h3>
        <p class="mt-1 text-sm text-gray-600">
          Selecciona el diseño que más le guste al destinatario
        </p>
      </div>
      <span class="shrink-0 rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-gray-900 shadow-sm">
        ¡Gratis!
      </span>
    </div>

    <!-- Preview area -->
    <div class="mb-6 overflow-hidden rounded-xl bg-gray-50 p-8">
      <Transition name="preview-fade" mode="out-in">
        <div
          :key="activeWrapper.id"
          class="flex flex-col items-center justify-center gap-4"
        >
          <!-- Gift box preview with dynamic color -->
          <div
            class="relative flex h-48 w-48 items-center justify-center rounded-2xl shadow-lg transition-all duration-500"
            :style="{ backgroundColor: activeWrapper.hex }"
          >
            <!-- Decorative ribbon -->
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="h-full w-2 bg-yellow-400 opacity-70" />
            </div>
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="h-2 w-full bg-yellow-400 opacity-70" />
            </div>
            <!-- Gift bow -->
            <div class="absolute -top-4 left-1/2 -translate-x-1/2">
              <svg class="h-12 w-12 text-yellow-400 drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm8 7h-3.17c.41-.53.66-1.2.66-1.93 0-1.76-1.44-3.2-3.2-3.2-.92 0-1.74.4-2.32 1.03C11.39 4.27 10.57 3.87 9.65 3.87c-1.76 0-3.2 1.44-3.2 3.2 0 .73.25 1.4.66 1.93H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V11c0-1.1-.9-2-2-2zm-8 10H4v-8h3.5l4.5 4.5V19zm8 0h-8v-5.5l4.5-4.5H20v10z" />
              </svg>
            </div>
          </div>

          <!-- Active wrapper name -->
          <p class="text-center text-base font-semibold text-gray-900 transition-all duration-300">
            {{ activeWrapper.name }}
          </p>
        </div>
      </Transition>
    </div>

    <!-- Swatches selector -->
    <div class="space-y-3">
      <p class="text-sm font-medium text-gray-700">
        Diseños disponibles:
      </p>
      <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
        <button
          v-for="wrapper in wrappingOptions"
          :key="wrapper.id"
          type="button"
          class="group relative flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all duration-200"
          :class="selectedWrappingId === wrapper.id
            ? 'border-yellow-400 bg-yellow-50 shadow-md'
            : 'border-gray-200 bg-white hover:border-yellow-300 hover:shadow-sm'"
          @click="selectWrapper(wrapper.id)"
          @mouseenter="handleMouseEnter(wrapper.id)"
          @mouseleave="handleMouseLeave"
        >
          <!-- Swatch circle with color -->
          <div
            class="h-16 w-16 shrink-0 rounded-full shadow-inner ring-2 ring-white transition-transform duration-200 group-hover:scale-110"
            :style="{ backgroundColor: wrapper.hex }"
          />

          <!-- Wrapper name -->
          <span
            class="text-center text-xs font-medium transition-colors duration-200"
            :class="selectedWrappingId === wrapper.id ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900'"
          >
            {{ wrapper.name }}
          </span>

          <!-- Selected checkmark -->
          <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="scale-0 opacity-0"
            enter-to-class="scale-100 opacity-100"
            leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="scale-100 opacity-100"
            leave-to-class="scale-0 opacity-0"
          >
            <div
              v-if="selectedWrappingId === wrapper.id"
              class="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-yellow-400 shadow-md"
            >
              <svg class="h-4 w-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </Transition>
        </button>
      </div>
    </div>

    <!-- Confirmation message when selected -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-2 opacity-0"
    >
      <div
        v-if="selectedWrappingId !== null"
        class="mt-4 flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-800"
      >
        <svg class="h-5 w-5 shrink-0 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="font-medium">
          ¡Excelente elección! Envolveremos tu regalo con mucho cuidado
        </p>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* Preview fade transition */
.preview-fade-enter-active,
.preview-fade-leave-active {
  transition: all 0.3s ease;
}

.preview-fade-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.preview-fade-leave-to {
  opacity: 0;
  transform: scale(1.05);
}
</style>
