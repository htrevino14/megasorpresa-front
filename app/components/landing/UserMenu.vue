<script setup lang="ts">
/**
 * UserMenu – Icono de usuario con menú desplegable para la barra de navegación.
 *
 * - Alterna la visibilidad del dropdown con `isDropdownOpen`.
 * - Se cierra automáticamente al hacer clic fuera del componente (click outside).
 * - Renderiza un menú distinto según `auth.isAuthenticated`:
 *     · No autenticado → "Iniciar sesión" y "Crear cuenta".
 *     · Autenticado    → "¡Hola, [Nombre]!" + perfil, pedidos, ayuda y salir.
 *
 * @emits none
 */
import { useAuthStore } from '~/stores/auth'
import { useAuthModalStore } from '~/stores/authModal'

const auth = useAuthStore()
const authModal = useAuthModalStore()

/** Controla la visibilidad del menú desplegable. */
const isDropdownOpen = ref(false)
/** Raíz del componente, usada para detectar clics fuera. */
const menuRoot = ref<HTMLElement | null>(null)

const isAuthenticated = computed(() => auth.isAuthenticated)
const firstName = computed(() => auth.user?.name?.split(' ')[0] ?? 'Usuario')

function toggleDropdown() {
  isDropdownOpen.value = !isDropdownOpen.value
}

function closeDropdown() {
  isDropdownOpen.value = false
}

/** Cierra el menú si el clic ocurrió fuera del componente. */
function handleClickOutside(event: MouseEvent) {
  if (menuRoot.value && !menuRoot.value.contains(event.target as Node)) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

function openLogin() {
  closeDropdown()
  authModal.open('login')
}

function openRegister() {
  closeDropdown()
  authModal.open('register')
}

async function handleLogout() {
  closeDropdown()
  await auth.logout()
}
</script>

<template>
  <div ref="menuRoot" class="relative">
    <!-- Botón disparador -->
    <button
      type="button"
      class="flex items-center gap-2 text-white transition-colors hover:text-yellow-200"
      :aria-expanded="isDropdownOpen"
      aria-haspopup="true"
      @click="toggleDropdown"
    >
      <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
      <span class="hidden text-sm font-medium sm:inline">
        <template v-if="isAuthenticated">¡Hola, {{ firstName }}!</template>
        <template v-else>Mi cuenta</template>
      </span>
      <svg
        class="h-4 w-4 transition-transform"
        :class="{ 'rotate-180': isDropdownOpen }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Menú desplegable -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div
        v-if="isDropdownOpen"
        class="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-lg bg-white py-1 text-gray-700 shadow-lg ring-1 ring-black/5"
      >
        <!-- ── No autenticado ────────────────────────────────────────────── -->
        <template v-if="!isAuthenticated">
          <button
            type="button"
            class="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-gray-100"
            @click="openLogin"
          >
            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h5a3 3 0 013 3v1" />
            </svg>
            Iniciar sesión
          </button>
          <button
            type="button"
            class="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-gray-100"
            @click="openRegister"
          >
            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Crear cuenta
          </button>
        </template>

        <!-- ── Autenticado ───────────────────────────────────────────────── -->
        <template v-else>
          <div class="border-b border-gray-100 px-4 py-3">
            <p class="text-sm font-semibold text-gray-900">¡Hola, {{ firstName }}!</p>
            <p v-if="auth.user?.email" class="truncate text-xs text-gray-500">{{ auth.user.email }}</p>
          </div>

          <NuxtLink
            to="/account"
            class="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-gray-100"
            @click="closeDropdown"
          >
            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Mi perfil
          </NuxtLink>

          <NuxtLink
            to="/account/orders"
            class="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-gray-100"
            @click="closeDropdown"
          >
            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            Mis pedidos
          </NuxtLink>

          <NuxtLink
            to="/ayuda"
            class="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-gray-100"
            @click="closeDropdown"
          >
            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Centro de Ayuda
          </NuxtLink>

          <div class="border-t border-gray-100">
            <button
              type="button"
              class="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-gray-100"
              @click="handleLogout"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h5a2 2 0 012 2v1" />
              </svg>
              Cerrar sesión
            </button>
          </div>
        </template>
      </div>
    </Transition>
  </div>
</template>
