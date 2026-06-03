<script setup lang="ts">
/**
 * AccountSidebar – Menú de navegación vertical del área de cuenta.
 *
 * Muestra los enlaces de la sección de perfil con su icono y un estado
 * activo basado en la ruta actual, más un botón para cerrar sesión.
 *
 * @emits none
 */
import type { Component } from 'vue'
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
const route = useRoute()

interface NavItem {
  label: string
  to: string
  icon: Component
  /** Si es true, el item se marca activo solo en coincidencia exacta de ruta. */
  exact?: boolean
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
  { label: 'Mi perfil', to: '/account', icon: IconUser, exact: true },
  { label: 'Mis pedidos', to: '/account/orders', icon: IconOrders },
  { label: 'Direcciones de envío', to: '/account/addresses', icon: IconAddress },
  { label: 'Recordatorios', to: '/account/reminders', icon: IconReminder },
  { label: 'Centro de Ayuda', to: '/ayuda', icon: IconHelp },
]

/** Determina si un item está activo según la ruta actual. */
function isActive(item: NavItem): boolean {
  return item.exact ? route.path === item.to : route.path.startsWith(item.to)
}

async function handleLogout() {
  await auth.logout()
  await navigateTo('/')
}
</script>

<template>
  <nav class="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
    <ul class="py-2">
      <li v-for="item in navItems" :key="item.to">
        <NuxtLink
          :to="item.to"
          class="flex items-center gap-3 py-3 pr-4 text-sm font-medium transition-colors hover:bg-gray-100"
          :class="isActive(item)
            ? 'border-l-4 border-yellow-400 bg-yellow-50 pl-3 text-yellow-700'
            : 'border-l-4 border-transparent pl-3 text-gray-700'"
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
</template>
