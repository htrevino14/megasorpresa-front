<script setup lang="ts">
/**
 * TheHeader – Site header with announcement bar, blue main navigation with
 * search, megamenu dropdowns, and a collapsible mobile hamburger menu.
 *
 * @emits none
 */

interface NavCategory {
  name: string
  slug: string
  subcategories: string[]
}

const isTopBarVisible = ref(true)
const isMobileMenuOpen = ref(false)
const activeCategory = ref<string | null>(null)
const searchQuery = ref('')

const navCategories: NavCategory[] = [
  {
    name: 'Juguetes',
    slug: 'juguetes',
    subcategories: ['Acción y aventura', 'Muñecas', 'Construcción', 'Juegos de mesa', 'Peluches', 'Arte y manualidades'],
  },
  {
    name: 'Bebés',
    slug: 'bebes',
    subcategories: ['Carriolas y sillas', 'Cunas y cunitas', 'Juguetes para bebé', 'Alimentación', 'Ropa y accesorios'],
  },
  {
    name: 'Exterior',
    slug: 'exterior',
    subcategories: ['Bicicletas', 'Scooters', 'Trampolines', 'Juegos de agua', 'Casas de juego'],
  },
  {
    name: 'Gaming',
    slug: 'gaming',
    subcategories: ['Nintendo Switch', 'PlayStation', 'Xbox', 'Videojuegos', 'Accesorios gaming'],
  },
]

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
    <div v-if="isTopBarVisible" class="bg-gray-900 px-4 py-2 text-center text-sm text-white">
      <span>Entrega en locker 24/7 ahora disponible.</span>
      <button
        class="ml-3 text-gray-400 hover:text-white"
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
      <div class="mx-auto flex max-w-7xl items-center gap-4">
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
        <NuxtLink to="/" class="shrink-0">
          <span class="text-xl font-extrabold tracking-tight text-white">
            🎁 <span class="text-yellow-300">Megasorpresa</span>
          </span>
        </NuxtLink>

        <!-- Search bar -->
        <div class="flex flex-1 items-center overflow-hidden rounded-full bg-white shadow-sm">
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Buscar productos o marcas"
            class="flex-1 bg-transparent px-4 py-2 text-sm text-gray-800 outline-none placeholder:text-gray-400"
            aria-label="Buscar productos"
          />
          <button
            class="flex items-center justify-center rounded-full bg-[#FFD200] px-4 py-2 transition-colors hover:bg-yellow-400"
            aria-label="Buscar"
          >
            <svg class="h-5 w-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>

        <!-- User action icons (desktop) -->
        <div class="hidden items-center gap-5 md:flex">
          <NuxtLink
            to="/login"
            class="flex flex-col items-center gap-0.5 text-white transition-colors hover:text-yellow-200"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span class="text-xs">Iniciar sesión</span>
          </NuxtLink>

          <NuxtLink
            to="/wishlist"
            class="flex flex-col items-center gap-0.5 text-white transition-colors hover:text-yellow-200"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span class="text-xs">Lista de deseos</span>
          </NuxtLink>

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
    <nav class="hidden bg-[#005ECB] md:block" @mouseleave="closeCategory">
      <div class="mx-auto flex max-w-7xl items-center">
        <NuxtLink
          v-for="cat in navCategories"
          :key="cat.slug"
          :to="`/category/${cat.slug}`"
          class="relative px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#0072E3]/40 hover:text-yellow-200"
          @mouseenter="openCategory(cat.name)"
        >
          {{ cat.name }}

          <!-- Dropdown panel -->
          <div
            v-if="activeCategory === cat.name"
            class="absolute left-0 top-full z-50 min-w-48 rounded-b-lg bg-white py-2 shadow-lg"
            @mouseenter="openCategory(cat.name)"
          >
            <NuxtLink
              v-for="sub in cat.subcategories"
              :key="sub"
              :to="`/category/${cat.slug}/${toSlug(sub)}`"
              class="block px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 hover:text-[#0072E3]"
            >
              {{ sub }}
            </NuxtLink>
          </div>
        </NuxtLink>

        <NuxtLink
          to="/gift-finder"
          class="px-6 py-3 text-sm font-semibold text-yellow-300 transition-colors hover:text-yellow-200"
        >
          Buscador de regalos
        </NuxtLink>
      </div>
    </nav>

    <!-- ── Delivery info bar (desktop) ──────────────────────────────────── -->
    <div class="hidden border-b border-gray-100 bg-white py-2 text-xs md:block">
      <div class="mx-auto flex max-w-7xl items-center justify-center gap-10 px-4">
        <span class="flex items-center gap-1.5 text-gray-700">
          <svg class="h-4 w-4 text-[#0072E3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l-1 12h16L19 8M10 12v4m4-4v4" />
          </svg>
          ENVÍO GRATIS EN PEDIDOS MAYORES A $500*
        </span>
        <span class="flex items-center gap-1.5 text-gray-700">
          <svg class="h-4 w-4 text-[#0072E3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          PIDE ANTES DE LAS 10 PM PARA ENTREGA AL DÍA SIGUIENTE*
        </span>
        <span class="flex items-center gap-1.5 text-gray-700">
          <svg class="h-4 w-4 text-[#0072E3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
          CLICK &amp; COLLECT GRATIS EN 2 HORAS*
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
          class="block px-6 py-4 text-base font-medium text-gray-800 hover:bg-gray-50"
          @click="toggleMobileMenu"
        >
          {{ cat.name }}
        </NuxtLink>
        <NuxtLink
          to="/gift-finder"
          class="block px-6 py-4 text-base font-semibold text-yellow-500"
          @click="toggleMobileMenu"
        >
          Buscador de regalos
        </NuxtLink>
        <div class="space-y-3 px-6 py-4 text-sm text-gray-700">
          <NuxtLink to="/login" class="block hover:text-[#0072E3]" @click="toggleMobileMenu">Iniciar sesión</NuxtLink>
          <NuxtLink to="/wishlist" class="block hover:text-[#0072E3]" @click="toggleMobileMenu">Lista de deseos</NuxtLink>
          <NuxtLink to="/cart" class="block hover:text-[#0072E3]" @click="toggleMobileMenu">Carrito</NuxtLink>
        </div>
      </nav>
    </div>
  </header>
</template>
