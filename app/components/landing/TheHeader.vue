<script setup lang="ts">
/**
 * TheHeader – Site header with announcement bar, blue main navigation with
 * search, megamenu dropdowns, and a collapsible mobile hamburger menu.
 * Data is fetched from GET /api/landing/announcement-bar and /api/landing/megamenu.
 * Shows a dynamic auth section: "Mi Cuenta" + logout when authenticated,
 * "Iniciar sesión" link when not.
 *
 * @emits none
 */
import { getAnnouncementBar, getMegamenu } from '~/api/landing'
import type { AnnouncementBar, MegamenuCategory } from '@@/types/index'
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()

const { data: announcementData } = await useAsyncData<AnnouncementBar | null>(
  'announcement-bar',
  () => getAnnouncementBar().then(r => r.data.data),
)

const { data: megamenuData } = await useAsyncData<MegamenuCategory[]>(
  'megamenu',
  () => getMegamenu().then(r => r.data.data),
)

const announcementBar = computed<AnnouncementBar | null>(() => announcementData.value ?? null)
const navCategories = computed<MegamenuCategory[]>(() => megamenuData.value ?? [])

const isTopBarVisible = ref(true)
const isMobileMenuOpen = ref(false)
const activeCategory = ref<string | null>(null)

const activeCategoryData = computed(() =>
  navCategories.value.find((c) => c.name === activeCategory.value) ?? null,
)

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

function openCategory(name: string) {
  activeCategory.value = name
}

function closeCategory() {
  activeCategory.value = null
}

function toSlug(text: string): string {
  return text.toLowerCase().replace(/[\s/]+/g, '-')
}
</script>

<template>
  <header class="sticky top-0 z-50">
    <!-- ── Announcement top bar ──────────────────────────────────────────── -->
    <div
      v-if="isTopBarVisible && announcementBar"
      class="px-4 py-2 text-center text-sm"
      :style="{
        backgroundColor: announcementBar.bg_color ?? '#111827',
        color: announcementBar.text_color ?? '#ffffff',
      }"
    >
      <span>{{ announcementBar.message }}</span>
      <a
        v-if="announcementBar.link_url"
        :href="announcementBar.link_url"
        class="ml-2 underline opacity-80 hover:opacity-100"
      >
        {{ announcementBar.link_label }}
      </a>
      <button
        class="ml-3 opacity-60 hover:opacity-100"
        aria-label="Cerrar aviso"
        @click="isTopBarVisible = false"
      >
        <svg class="inline h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- ── Main nav bar (blue) ───────────────────────────────────────────── -->
    <div class="bg-[#0072E3] px-4 py-3 md:px-6">
      <div class="relative mx-auto flex max-w-7xl items-center justify-between gap-4">
        <!-- Hamburger (mobile only) -->
        <button
          class="shrink-0 text-white md:hidden"
          aria-label="Abrir menú"
          @click="toggleMobileMenu"
        >
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <!-- Logo -->
        <NuxtLink to="/" class="absolute left-1/2 -translate-x-1/2 shrink-0 md:static md:translate-x-0">
          <span class="inline-flex items-center gap-1 whitespace-nowrap text-2xl font-extrabold tracking-tight text-white md:text-3xl">
            <span aria-hidden="true">🎁</span>
            <span class="text-yellow-300">Megasorpresa</span>
          </span>
        </NuxtLink>

        <!-- User action icons (desktop) -->
        <div class="hidden items-center gap-5 md:flex">
          <template v-if="auth.isAuthenticated">
            <!-- Authenticated: Mi Cuenta + Cerrar sesión -->
            <div class="relative flex items-center gap-3">
              <NuxtLink
                to="/account"
                class="flex flex-col items-center gap-0.5 text-white transition-colors hover:text-yellow-200"
              >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span class="text-xs">{{ auth.user?.name ?? 'Mi Cuenta' }}</span>
              </NuxtLink>
              <button
                class="flex flex-col items-center gap-0.5 text-white/70 transition-colors hover:text-yellow-200"
                aria-label="Cerrar sesión"
                @click="auth.logout().then(() => navigateTo('/login'))"
              >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h5a2 2 0 012 2v1" />
                </svg>
                <span class="text-xs">Salir</span>
              </button>
            </div>
          </template>
          <template v-else>
            <!-- Unauthenticated: Iniciar sesión -->
            <NuxtLink
              to="/login"
              class="flex flex-col items-center gap-0.5 text-white transition-colors hover:text-yellow-200"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span class="text-xs">Iniciar sesión</span>
            </NuxtLink>
          </template>

          <NuxtLink
            to="/cart"
            class="flex flex-col items-center gap-0.5 text-white transition-colors hover:text-yellow-200"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span class="text-xs">Carrito</span>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- ── Megamenu category nav (desktop) ──────────────────────────────── -->
    <nav class="relative hidden bg-[#005ECB] md:block" @mouseleave="closeCategory">
      <div class="mx-auto flex max-w-7xl items-center justify-center">
        <button
          v-for="cat in navCategories"
          :key="cat.slug"
          :aria-expanded="activeCategory === cat.name"
          :aria-controls="`megamenu-${cat.slug}`"
          class="px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#0072E3]/40 hover:text-yellow-200"
          :class="{ 'bg-[#0072E3]/40 text-yellow-200': activeCategory === cat.name }"
          @mouseenter="openCategory(cat.name)"
          @click="openCategory(cat.name)"
        >
          {{ cat.name }}
          <svg
            aria-hidden="true"
            class="ml-1 inline h-3 w-3 transition-transform"
            :class="{ 'rotate-180': activeCategory === cat.name }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <NuxtLink
          to="/gift-finder"
          class="px-6 py-3 text-sm font-semibold text-yellow-300 transition-colors hover:text-yellow-200"
        >
          Buscador de regalos
        </NuxtLink>
      </div>

      <!-- ── Megamenu panel ──────────────────────────────────────────────── -->
      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div
          v-if="activeCategoryData"
          :id="`megamenu-${activeCategoryData.slug}`"
          class="absolute left-0 right-0 top-full z-50 bg-white shadow-xl"
          @mouseenter="openCategory(activeCategoryData.name)"
        >
          <div class="mx-auto max-w-7xl px-6 py-6">
            <div class="grid grid-cols-5 gap-6">
              <!-- Subcategory columns -->
              <div
                v-for="group in activeCategoryData.subcategory_groups"
                :key="group.id"
                class="col-span-1"
              >
                <h3 class="mb-3 text-sm font-bold uppercase tracking-wide text-gray-800">
                  {{ group.title }}
                </h3>
                <ul class="space-y-1.5">
                  <li v-for="item in group.items" :key="item.id">
                    <NuxtLink
                      :to="`/category/${activeCategoryData.slug}/${toSlug(item.label)}`"
                      class="text-sm text-gray-600 transition-colors hover:text-[#0072E3] hover:underline"
                      @click="closeCategory"
                    >
                      {{ item.label }}
                    </NuxtLink>
                  </li>
                </ul>
              </div>

              <!-- Promotional panel -->
              <div v-if="activeCategoryData.promo_panel" class="col-span-1">
                <div
                  class="relative flex h-full flex-col justify-between overflow-hidden rounded-lg p-5 text-white"
                  :class="`bg-gradient-to-br ${activeCategoryData.promo_panel.bg_color}`"
                >
                  <div>
                    <span class="mb-2 inline-block rounded-full bg-white/30 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide">
                      {{ activeCategoryData.promo_panel.badge }}
                    </span>
                    <div class="my-3 text-4xl">{{ activeCategoryData.promo_panel.emoji }}</div>
                    <h4 class="text-base font-bold leading-snug">{{ activeCategoryData.promo_panel.title }}</h4>
                    <p class="mt-1.5 text-xs leading-relaxed text-white/90">
                      {{ activeCategoryData.promo_panel.description }}
                    </p>
                  </div>
                  <NuxtLink
                    :to="activeCategoryData.promo_panel.link_url"
                    class="mt-4 inline-block rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-gray-800 transition-opacity hover:opacity-90"
                    @click="closeCategory"
                  >
                    {{ activeCategoryData.promo_panel.link_text }} →
                  </NuxtLink>
                </div>
              </div>
            </div>

            <!-- Bottom link to full category -->
            <div class="mt-5 border-t border-gray-100 pt-4">
              <NuxtLink
                :to="`/category/${activeCategoryData.slug}`"
                class="text-sm font-semibold text-[#0072E3] hover:underline"
                @click="closeCategory"
              >
                Ver todo en {{ activeCategoryData.name }} →
              </NuxtLink>
            </div>
          </div>
        </div>
      </Transition>
    </nav>

    <!-- ── Delivery info bar (desktop) ──────────────────────────────────── -->
    <div class="hidden border-b border-gray-100 bg-white py-2 text-xs md:block">
      <div class="mx-auto flex max-w-7xl items-center justify-center gap-10 px-4">
        <span class="flex items-center gap-1.5 text-gray-700">
          <svg class="h-4 w-4 text-[#0072E3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l-1 12h16L19 8M10 12v4m4-4v4" />
          </svg>
          PERSONALIZA TU REGALO*
        </span>
        <span class="flex items-center gap-1.5 text-gray-700">
          <svg class="h-4 w-4 text-[#0072E3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          ENVIA TODO DE HOY PARA HOY*
        </span>
        <span class="flex items-center gap-1.5 text-gray-700">
          <svg class="h-4 w-4 text-[#0072E3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
          JUGUETES PREMIUM*
        </span>
      </div>
    </div>

    <!-- ── Mobile full-screen menu ───────────────────────────────────────── -->
    <div
      v-if="isMobileMenuOpen"
      class="fixed inset-0 z-50 flex flex-col bg-white md:hidden"
    >
      <div class="flex items-center justify-between bg-[#0072E3] px-4 py-3">
        <span class="text-lg font-bold text-white">Menú</span>
        <button class="text-white" aria-label="Cerrar menú" @click="toggleMobileMenu">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <nav class="flex-1 divide-y overflow-y-auto">
        <NuxtLink
          v-for="cat in navCategories"
          :key="cat.slug"
          :to="`/category/${cat.slug}`"
          class="flex items-center justify-between px-6 py-4 text-base font-medium text-gray-800 hover:bg-gray-50"
          @click="toggleMobileMenu"
        >
          {{ cat.name }}
          <svg aria-hidden="true" class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </NuxtLink>
        <NuxtLink
          to="/gift-finder"
          class="block px-6 py-4 text-base font-semibold text-yellow-500"
          @click="toggleMobileMenu"
        >
          Buscador de regalos
        </NuxtLink>
        <div class="space-y-3 px-6 py-4 text-sm text-gray-700">
          <template v-if="auth.isAuthenticated">
            <NuxtLink to="/account" class="block hover:text-[#0072E3]" @click="toggleMobileMenu">
              {{ auth.user?.name ? `Hola, ${auth.user.name}` : 'Mi Cuenta' }}
            </NuxtLink>
            <button
              class="block w-full text-left text-red-500 hover:text-red-700"
              @click="auth.logout().then(() => { toggleMobileMenu(); navigateTo('/login') })"
            >
              Cerrar sesión
            </button>
          </template>
          <template v-else>
            <NuxtLink to="/login" class="block hover:text-[#0072E3]" @click="toggleMobileMenu">Iniciar sesión</NuxtLink>
            <NuxtLink to="/register" class="block hover:text-[#0072E3]" @click="toggleMobileMenu">Crear cuenta</NuxtLink>
          </template>
          <NuxtLink to="/cart" class="block hover:text-[#0072E3]" @click="toggleMobileMenu">Carrito</NuxtLink>
        </div>
      </nav>
    </div>
  </header>
</template>
