<script setup lang="ts">
/**
 * Default layout for all public-facing pages.
 *
 * Provides a responsive Navbar with category navigation and a Footer.
 * Wrap child page content in `<main>` via `<NuxtPage />`.
 *
 * @emits none
 */
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
const categories = ['Bebés', 'Niños', 'Niñas', 'Educativos', 'Electrónicos', 'Ofertas']
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gray-50">
    <!-- ── Navbar ──────────────────────────────────────────────────────── -->
    <header class="bg-white shadow-sm">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 items-center justify-between">
          <!-- Logo -->
          <NuxtLink to="/" class="flex items-center gap-2">
            <span class="text-2xl font-bold text-yellow-500">🎁</span>
            <span class="text-xl font-bold text-gray-800">Megasorpresa</span>
          </NuxtLink>

          <!-- Category navigation -->
          <nav class="hidden md:flex items-center gap-6">
            <NuxtLink
              v-for="cat in categories"
              :key="cat"
              :to="`/category/${cat.toLowerCase()}`"
              class="text-sm font-medium text-gray-600 hover:text-yellow-500 transition-colors"
            >
              {{ cat }}
            </NuxtLink>
          </nav>

          <!-- Actions -->
          <div class="flex items-center gap-4">
            <NuxtLink to="/cart" class="text-gray-600 hover:text-yellow-500" aria-label="Carrito de compras">
              🛒
            </NuxtLink>
            <template v-if="auth.isAuthenticated">
              <NuxtLink to="/account" class="text-sm font-medium text-gray-700 hover:text-yellow-500">
                Mi cuenta
              </NuxtLink>
              <button
                class="text-sm font-medium text-gray-500 hover:text-red-500"
                @click="auth.logout()"
              >
                Salir
              </button>
            </template>
            <template v-else>
              <NuxtLink
                to="/login"
                class="rounded-md bg-yellow-400 px-4 py-2 text-sm font-semibold text-white hover:bg-yellow-500 transition-colors"
              >
                Iniciar sesión
              </NuxtLink>
            </template>
          </div>
        </div>
      </div>
    </header>

    <!-- ── Page content ───────────────────────────────────────────────── -->
    <main class="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <slot />
    </main>

    <!-- ── Footer ─────────────────────────────────────────────────────── -->
    <footer class="bg-gray-800 text-gray-300">
      <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 class="text-lg font-semibold text-white">Megasorpresa</h3>
            <p class="mt-2 text-sm">
              La mejor tienda de juguetes en México. Diversión garantizada.
            </p>
          </div>
          <div>
            <h3 class="text-sm font-semibold uppercase tracking-wider text-white">Tienda</h3>
            <ul class="mt-2 space-y-1 text-sm">
              <li v-for="cat in categories" :key="cat">
                <NuxtLink :to="`/category/${cat.toLowerCase()}`" class="hover:text-yellow-400">
                  {{ cat }}
                </NuxtLink>
              </li>
            </ul>
          </div>
          <div>
            <h3 class="text-sm font-semibold uppercase tracking-wider text-white">Ayuda</h3>
            <ul class="mt-2 space-y-1 text-sm">
              <li><NuxtLink to="/about" class="hover:text-yellow-400">Acerca de</NuxtLink></li>
              <li><NuxtLink to="/contact" class="hover:text-yellow-400">Contacto</NuxtLink></li>
              <li><NuxtLink to="/shipping" class="hover:text-yellow-400">Envíos</NuxtLink></li>
              <li><NuxtLink to="/returns" class="hover:text-yellow-400">Devoluciones</NuxtLink></li>
            </ul>
          </div>
        </div>
        <p class="mt-8 border-t border-gray-700 pt-4 text-center text-xs">
          © {{ new Date().getFullYear() }} Megasorpresa. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  </div>
</template>
