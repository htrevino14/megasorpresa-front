<script setup lang="ts">
/**
 * ProductGallery – Responsive image gallery for the product detail page.
 *
 * Renders a main image area with smooth slide transitions and a row of
 * clickable thumbnails below. Supports full-screen lightbox on click.
 *
 * @prop {string}        primaryImage  - Fallback image URL when images array is empty.
 * @prop {ProductImage[]} images       - Ordered array of product images from the backend.
 * @prop {string}        productName   - Used as alt text fallback.
 */
import type { ProductImage } from '@@/types/index'

const props = defineProps<{
  primaryImage: string
  images: ProductImage[]
  productName: string
}>()

// ── Normalise image list ───────────────────────────────────────────────────────
const allImages = computed<ProductImage[]>(() => {
  if (props.images && props.images.length > 0) {
    return [...props.images].sort((a, b) => a.order - b.order)
  }
  return [{ id: 0, url: props.primaryImage, alt: props.productName, order: 0 }]
})

// ── Active index ──────────────────────────────────────────────────────────────
const activeIndex = ref(0)
const direction = ref<'next' | 'prev'>('next')

const activeImage = computed<ProductImage>(() => allImages.value[activeIndex.value])

function goTo(index: number) {
  direction.value = index > activeIndex.value ? 'next' : 'prev'
  activeIndex.value = index
}

function prev() {
  const newIndex = activeIndex.value === 0 ? allImages.value.length - 1 : activeIndex.value - 1
  direction.value = 'prev'
  activeIndex.value = newIndex
}

function next() {
  const newIndex = activeIndex.value === allImages.value.length - 1 ? 0 : activeIndex.value + 1
  direction.value = 'next'
  activeIndex.value = newIndex
}

// ── Lightbox ──────────────────────────────────────────────────────────────────
const lightboxOpen = ref(false)

function openLightbox() {
  lightboxOpen.value = true
}

function closeLightbox() {
  lightboxOpen.value = false
}

// Close lightbox on Escape key
if (import.meta.client) {
  useEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox()
    if (e.key === 'ArrowLeft' && lightboxOpen.value) prev()
    if (e.key === 'ArrowRight' && lightboxOpen.value) next()
  })
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <!-- ── Main image area ─────────────────────────────────────────────────── -->
    <div class="relative overflow-hidden rounded-2xl bg-gray-100 shadow-sm">
      <Transition
        :name="direction === 'next' ? 'slide-left' : 'slide-right'"
        mode="out-in"
      >
        <img
          :key="activeImage.url"
          :src="activeImage.url"
          :alt="activeImage.alt ?? productName"
          class="aspect-square w-full cursor-zoom-in object-cover"
          @click="openLightbox"
        />
      </Transition>

      <!-- Prev / Next arrows (only when more than 1 image) -->
      <template v-if="allImages.length > 1">
        <button
          type="button"
          aria-label="Imagen anterior"
          class="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow backdrop-blur-sm transition-colors hover:bg-white"
          @click="prev"
        >
          <svg class="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          type="button"
          aria-label="Imagen siguiente"
          class="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow backdrop-blur-sm transition-colors hover:bg-white"
          @click="next"
        >
          <svg class="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <!-- Dot indicators -->
        <div class="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          <button
            v-for="(_, idx) in allImages"
            :key="idx"
            type="button"
            :aria-label="`Ir a imagen ${idx + 1}`"
            class="h-2 w-2 rounded-full transition-all duration-200"
            :class="idx === activeIndex ? 'w-5 bg-yellow-400' : 'bg-white/70'"
            @click="goTo(idx)"
          />
        </div>
      </template>

      <!-- Zoom icon hint -->
      <span class="pointer-events-none absolute right-3 top-3 rounded-full bg-white/70 p-1.5 text-gray-500 backdrop-blur-sm">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
        </svg>
      </span>
    </div>

    <!-- ── Thumbnails ──────────────────────────────────────────────────────── -->
    <div v-if="allImages.length > 1" class="flex gap-2 overflow-x-auto pb-1">
      <button
        v-for="(img, idx) in allImages"
        :key="img.id"
        type="button"
        :aria-label="`Ver imagen ${idx + 1}`"
        class="h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-200"
        :class="idx === activeIndex
          ? 'border-yellow-400 shadow-md'
          : 'border-transparent opacity-60 hover:opacity-100'"
        @click="goTo(idx)"
      >
        <img
          :src="img.url"
          :alt="img.alt ?? productName"
          class="h-full w-full object-cover"
          loading="lazy"
        />
      </button>
    </div>

    <!-- ── Lightbox overlay ────────────────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="lightboxOpen"
          class="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          @click.self="closeLightbox"
        >
          <!-- Close button -->
          <button
            type="button"
            aria-label="Cerrar imagen"
            class="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-white/40"
            @click="closeLightbox"
          >
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Navigation arrows -->
          <template v-if="allImages.length > 1">
            <button
              type="button"
              aria-label="Imagen anterior"
              class="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white transition-colors hover:bg-white/40"
              @click="prev"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              type="button"
              aria-label="Imagen siguiente"
              class="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white transition-colors hover:bg-white/40"
              @click="next"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </template>

          <!-- Full image -->
          <Transition :name="direction === 'next' ? 'slide-left' : 'slide-right'" mode="out-in">
            <img
              :key="activeImage.url"
              :src="activeImage.url"
              :alt="activeImage.alt ?? productName"
              class="max-h-[90vh] max-w-full rounded-lg object-contain shadow-2xl"
            />
          </Transition>

          <!-- Counter -->
          <div v-if="allImages.length > 1" class="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/20 px-3 py-1 text-sm text-white backdrop-blur-sm">
            {{ activeIndex + 1 }} / {{ allImages.length }}
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* Slide-left transition (next) */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s ease;
}
.slide-left-enter-from {
  opacity: 0;
  transform: translateX(40px);
}
.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-40px);
}

/* Slide-right transition (prev) */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease;
}
.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-40px);
}
.slide-right-leave-to {
  opacity: 0;
  transform: translateX(40px);
}

/* Fade transition (lightbox) */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
