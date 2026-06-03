<script setup lang="ts">
/**
 * AccountLayout – Layout reutilizable para todas las pantallas de "Mi cuenta".
 *
 * Renderiza dos columnas: a la izquierda el sidebar de navegación + widget
 * de puntos + botón de cerrar sesión; a la derecha un `<slot />` donde cada
 * pantalla inyecta su contenido. El resaltado del item activo se controla
 * mediante el prop `activeTab`.
 *
 * @prop {AccountTab} activeTab - Identificador de la pestaña activa.
 */
import type { Component } from 'vue'
import { useAuthStore } from '~/stores/auth'

export type AccountTab = 'profile' | 'orders' | 'addresses' | 'reminders' | 'help'

const props = defineProps<{
  activeTab: AccountTab
}>()

const auth = useAuthStore()

interface NavItem {
  key: AccountTab
  label: string
  to: string
  icon: Component
}

/** Iconos inline (estilo Heroicons outline) como componentes funcionales. */
const IconUser: Component = {
  render: () =>
    h('svg', { class: 'h-5 w-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' }),
    ]),
}
const IconOrders: Component = {
  render: () =>
    h('svg', { class: 'h-5 w-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' }),
    ]),
}
const IconAddress: Component = {
  render: () =>
    h('svg', { class: 'h-5 w-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' }),
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M15 11a3 3 0 11-6 0 3 3 0 016 0z' }),
    ]),
}
const IconReminder: Component = {
  render: () =>
    h('svg', { class: 'h-5 w-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' }),
    ]),
}
const IconHelp: Component = {
  render: () =>
    h('svg', { class: 'h-5 w-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' }),
    ]),
}

const navItems: NavItem[] = [
  { key: 'profile', label: 'Mi perfil', to: '/account', icon: IconUser },
  { key: 'orders', label: 'Mis pedidos', to: '/account/orders', icon: IconOrders },
  { key: 'addresses', label: 'Direcciones de envío', to: '/account/addresses', icon: IconAddress },
  { key: 'reminders', label: 'Recordatorios', to: '/account/reminders', icon: IconReminder },
  { key: 'help', label: 'Centro de Ayuda', to: '/ayuda', icon: IconHelp },
]

/** Puntos de fidelidad del usuario autenticado (0 si no hay). */
const loyaltyPoints = computed<number>(() => Number(auth.user?.loyalty_points ?? 0))

/** Nombre a mostrar en el widget de puntos. */
const userDisplayName = computed<string>(() => {
  const u = auth.user
  if (!u) return ''
  const composed = [u.first_name, u.last_name].filter(Boolean).join(' ').trim()
  return composed || u.name || ''
})

async function handleLogout(): Promise<void> {
  await auth.logout()
  await navigateTo('/')
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gray-50">
    <LandingTheHeader />

    <main class="flex-1 py-8 sm:py-12">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 class="mb-6 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Mi cuenta
        </h1>

        <div class="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <!-- ── Columna izquierda: sidebar + puntos + logout ─────────── -->
          <aside class="space-y-4 lg:col-span-3">
            <!-- Widget de puntos -->
            <div
              v-if="auth.isAuthenticated"
              class="rounded-xl bg-gradient-to-br from-yellow-300 to-yellow-400 p-4 shadow-sm ring-1 ring-yellow-500/20"
            >
              <p class="text-xs font-semibold uppercase tracking-wide text-yellow-900/80">
                Hola{{ userDisplayName ? `, ${userDisplayName}` : '' }}
              </p>
              <div class="mt-2 flex items-baseline gap-1.5">
                <span class="text-2xl font-extrabold text-gray-900">{{ loyaltyPoints }}</span>
                <span class="text-sm font-semibold text-gray-800">puntos</span>
              </div>
              <p class="mt-1 text-xs text-gray-800/80">Acumula y canjea sorpresas</p>
            </div>

            <!-- Navegación principal -->
            <nav class="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
              <ul class="py-2">
                <li v-for="item in navItems" :key="item.key">
                  <NuxtLink
                    :to="item.to"
                    class="flex items-center gap-3 py-3 pr-4 text-sm transition-colors hover:bg-gray-100"
                    :class="props.activeTab === item.key
                      ? 'border-l-4 border-yellow-400 bg-yellow-50 pl-3 font-bold text-yellow-700'
                      : 'border-l-4 border-transparent pl-3 font-medium text-gray-700'"
                  >
                    <component :is="item.icon" />
                    {{ item.label }}
                  </NuxtLink>
                </li>
              </ul>

              <div class="border-t border-gray-100 p-3">
                <button
                  type="button"
                  class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-gray-100"
                  @click="handleLogout"
                >
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h5a2 2 0 012 2v1" />
                  </svg>
                  Cerrar sesión
                </button>
              </div>
            </nav>
          </aside>

          <!-- ── Columna derecha: contenido inyectado por la página ───── -->
          <section class="space-y-6 lg:col-span-9">
            <slot />
          </section>
        </div>
      </div>
    </main>

    <LandingTheFooter />
  </div>
</template>
