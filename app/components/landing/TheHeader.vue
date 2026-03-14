<script setup lang="ts">
/**
 * TheHeader – Site header with announcement bar, blue main navigation with
 * search, megamenu dropdowns, and a collapsible mobile hamburger menu.
 *
 * @emits none
 */

interface SubcategoryGroup {
  title: string
  items: string[]
}

interface PromoPanel {
  badge: string
  title: string
  description: string
  emoji: string
  bgColor: string
  linkText: string
}

interface NavCategory {
  name: string
  slug: string
  subcategoryGroups: SubcategoryGroup[]
  promo: PromoPanel
}

const isTopBarVisible = ref(true)
const isMobileMenuOpen = ref(false)
const activeCategory = ref<string | null>(null)
const searchQuery = ref('')

const navCategories: NavCategory[] = [
  {
    name: 'Juguetes',
    slug: 'juguetes',
    subcategoryGroups: [
      {
        title: 'Acción y aventura',
        items: ['Superhéroes', 'Dinosaurios', 'Robots', 'Vehículos de juguete', 'Figuras de acción'],
      },
      {
        title: 'Creatividad',
        items: ['Arte y manualidades', 'Pintura', 'Plastilina y arcilla', 'Kits de ciencia', 'Música'],
      },
      {
        title: 'Juegos y puzzles',
        items: ['Juegos de mesa', 'Puzzles', 'Juegos de cartas', 'Juegos de estrategia', 'Trivia'],
      },
      {
        title: 'Muñecas y peluches',
        items: ['Muñecas de moda', 'Bebés de juguete', 'Peluches', 'Casas de muñecas', 'Accesorios'],
      },
    ],
    promo: {
      badge: 'Nuevo',
      title: 'Colección Primavera 2025',
      description: 'Descubre los juguetes más populares de la temporada con hasta 30% de descuento.',
      emoji: '🎠',
      bgColor: 'from-yellow-400 to-orange-400',
      linkText: 'Ver colección',
    },
  },
  {
    name: 'Bebés',
    slug: 'bebes',
    subcategoryGroups: [
      {
        title: 'Movilidad',
        items: ['Carriolas', 'Sillas para auto', 'Portabebés', 'Andadores', 'Sillas de paseo'],
      },
      {
        title: 'Descanso',
        items: ['Cunas', 'Moisés', 'Colchones de cuna', 'Monitores de bebé', 'Sábanas y textiles'],
      },
      {
        title: 'Alimentación',
        items: ['Biberones', 'Sillas de comer', 'Sterilizadores', 'Extractores de leche', 'Baberos'],
      },
      {
        title: 'Estimulación',
        items: ['Gimnasios de actividades', 'Mordedores', 'Sonajeros', 'Juguetes de baño', 'Libros de tela'],
      },
    ],
    promo: {
      badge: 'Trending',
      title: 'Lo mejor para tu bebé',
      description: 'Productos seleccionados por expertos en desarrollo infantil.',
      emoji: '👶',
      bgColor: 'from-pink-400 to-purple-400',
      linkText: 'Ver productos',
    },
  },
  {
    name: 'Exterior',
    slug: 'exterior',
    subcategoryGroups: [
      {
        title: 'Ruedas',
        items: ['Bicicletas', 'Patinetes', 'Scooters eléctricos', 'Patines', 'Triciclos'],
      },
      {
        title: 'Diversión al aire libre',
        items: ['Trampolines', 'Casas de juego', 'Columpios y toboganes', 'Areneros', 'Tiendas de campaña'],
      },
      {
        title: 'Agua y playa',
        items: ['Albercas inflables', 'Pistolas de agua', 'Accesorios de playa', 'Juguetes acuáticos', 'Flotadores'],
      },
      {
        title: 'Deporte',
        items: ['Fútbol', 'Baloncesto', 'Tenis', 'Atletismo', 'Yoga infantil'],
      },
    ],
    promo: {
      badge: 'Temporada',
      title: 'Verano al máximo',
      description: 'Equipa a tus hijos para las mejores aventuras al aire libre.',
      emoji: '🌞',
      bgColor: 'from-green-400 to-teal-400',
      linkText: 'Ver ofertas',
    },
  },
  {
    name: 'Gaming',
    slug: 'gaming',
    subcategoryGroups: [
      {
        title: 'Consolas',
        items: ['Nintendo Switch', 'PlayStation 5', 'Xbox Series', 'Nintendo 3DS', 'Steam Deck'],
      },
      {
        title: 'Videojuegos',
        items: ['Acción', 'Aventura', 'Deportes', 'Infantiles', 'Multijugador'],
      },
      {
        title: 'Accesorios',
        items: ['Controles', 'Audífonos gaming', 'Sillas gamer', 'Fundas y estuches', 'Cargadores'],
      },
      {
        title: 'PC Gaming',
        items: ['Ratones gaming', 'Teclados', 'Monitores', 'Webcams', 'Soportes'],
      },
    ],
    promo: {
      badge: 'Hot',
      title: 'Gaming Zone',
      description: 'Los mejores títulos y accesorios para gamers de todas las edades.',
      emoji: '🎮',
      bgColor: 'from-violet-500 to-indigo-500',
      linkText: 'Ver gaming',
    },
  },
  {
    name: 'Educativos',
    slug: 'educativos',
    subcategoryGroups: [
      {
        title: 'STEM',
        items: ['Robótica', 'Electrónica básica', 'Química', 'Física experimental', 'Programación'],
      },
      {
        title: 'Idiomas y lectura',
        items: ['Libros infantiles', 'Cuentos ilustrados', 'Libros de actividades', 'Flashcards', 'Audiocuentos'],
      },
      {
        title: 'Matemáticas',
        items: ['Ábaco y conteo', 'Geometría', 'Juegos numéricos', 'Fracciones', 'Álgebra visual'],
      },
      {
        title: 'Arte y música',
        items: ['Instrumentos musicales', 'Kits de pintura', 'Escultura', 'Teatro', 'Danza'],
      },
    ],
    promo: {
      badge: 'Recomendado',
      title: 'Aprende jugando',
      description: 'Recursos educativos diseñados para potenciar el aprendizaje desde temprana edad.',
      emoji: '🎓',
      bgColor: 'from-blue-400 to-cyan-400',
      linkText: 'Ver educativos',
    },
  },
]

const activeCategoryData = computed(() =>
  navCategories.find((c) => c.name === activeCategory.value) ?? null,
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
                v-for="group in activeCategoryData.subcategoryGroups"
                :key="group.title"
                class="col-span-1"
              >
                <h3 class="mb-3 text-sm font-bold uppercase tracking-wide text-gray-800">
                  {{ group.title }}
                </h3>
                <ul class="space-y-1.5">
                  <li v-for="item in group.items" :key="item">
                    <NuxtLink
                      :to="`/category/${activeCategoryData.slug}/${toSlug(item)}`"
                      class="text-sm text-gray-600 transition-colors hover:text-[#0072E3] hover:underline"
                      @click="closeCategory"
                    >
                      {{ item }}
                    </NuxtLink>
                  </li>
                </ul>
              </div>

              <!-- Promotional panel -->
              <div class="col-span-1">
                <div
                  class="relative flex h-full flex-col justify-between overflow-hidden rounded-lg p-5 text-white"
                  :class="`bg-gradient-to-br ${activeCategoryData.promo.bgColor}`"
                >
                  <div>
                    <span class="mb-2 inline-block rounded-full bg-white/30 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide">
                      {{ activeCategoryData.promo.badge }}
                    </span>
                    <div class="my-3 text-4xl">{{ activeCategoryData.promo.emoji }}</div>
                    <h4 class="text-base font-bold leading-snug">{{ activeCategoryData.promo.title }}</h4>
                    <p class="mt-1.5 text-xs leading-relaxed text-white/90">
                      {{ activeCategoryData.promo.description }}
                    </p>
                  </div>
                  <NuxtLink
                    :to="`/category/${activeCategoryData.slug}`"
                    class="mt-4 inline-block rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-gray-800 transition-opacity hover:opacity-90"
                    @click="closeCategory"
                  >
                    {{ activeCategoryData.promo.linkText }} →
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
          <NuxtLink to="/login" class="block hover:text-[#0072E3]" @click="toggleMobileMenu">Iniciar sesión</NuxtLink>
          <NuxtLink to="/wishlist" class="block hover:text-[#0072E3]" @click="toggleMobileMenu">Lista de deseos</NuxtLink>
          <NuxtLink to="/cart" class="block hover:text-[#0072E3]" @click="toggleMobileMenu">Carrito</NuxtLink>
        </div>
      </nav>
    </div>
  </header>
</template>
