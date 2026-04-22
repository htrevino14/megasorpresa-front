<script setup lang="ts">
/**
 * login – User login page.
 *
 * Connects to POST /api/auth/login via the auth Pinia store.
 * On success, redirects the user to the previous page (if safe) or to
 * the catalog.  Displays inline validation errors and API error feedback.
 *
 * @emits none
 */
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'auth' })

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

// Redirect already-authenticated users away from the login page
if (auth.isAuthenticated) {
  await navigateTo('/catalog')
}

// ── Form state ────────────────────────────────────────────────────────────────
const email = ref('')
const password = ref('')
const isLoading = ref(false)
const apiError = ref<string | null>(null)

// ── Validation ────────────────────────────────────────────────────────────────
const emailError = ref<string | null>(null)
const passwordError = ref<string | null>(null)

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateEmail(): boolean {
  if (!email.value.trim()) {
    emailError.value = 'El correo electrónico es requerido.'
    return false
  }
  if (!emailRegex.test(email.value.trim())) {
    emailError.value = 'Ingresa un correo electrónico válido.'
    return false
  }
  emailError.value = null
  return true
}

function validatePassword(): boolean {
  if (!password.value) {
    passwordError.value = 'La contraseña es requerida.'
    return false
  }
  passwordError.value = null
  return true
}

function validateAll(): boolean {
  const ok1 = validateEmail()
  const ok2 = validatePassword()
  return ok1 && ok2
}

// ── Submit ────────────────────────────────────────────────────────────────────
async function handleSubmit() {
  apiError.value = null
  if (!validateAll()) return

  isLoading.value = true
  try {
    await auth.login(email.value.trim(), password.value)

    // Redirect to the page the user came from, or fall back to catalog
    const redirect = route.query.redirect as string | undefined
    await router.push(redirect && redirect.startsWith('/') ? redirect : '/catalog')
  } catch (err: unknown) {
    const axiosError = err as { response?: { status?: number; data?: { message?: string } } }
    if (axiosError.response?.status === 422) {
      apiError.value = 'Los datos ingresados no son válidos. Revisa tu correo y contraseña.'
    } else if (axiosError.response?.status === 401) {
      apiError.value = 'Correo o contraseña incorrectos.'
    } else if (axiosError.response?.data?.message) {
      apiError.value = axiosError.response.data.message
    } else {
      apiError.value = 'Ocurrió un error al iniciar sesión. Intenta de nuevo más tarde.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="w-full max-w-md">
    <div class="card px-8 py-10 shadow-md">
      <!-- Heading -->
      <div class="mb-8 text-center">
        <span class="text-4xl" aria-hidden="true">🎁</span>
        <h1 class="mt-3 text-2xl font-bold text-gray-800">
          Iniciar sesión
        </h1>
        <p class="mt-1 text-sm text-gray-500">
          Bienvenido de vuelta a Megasorpresa
        </p>
      </div>

      <!-- API error banner -->
      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-1"
      >
        <div
          v-if="apiError"
          role="alert"
          class="mb-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <svg class="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ apiError }}</span>
        </div>
      </Transition>

      <!-- Form -->
      <form novalidate @submit.prevent="handleSubmit">
        <!-- Email -->
        <div class="mb-4">
          <label for="email" class="mb-1.5 block text-sm font-medium text-gray-700">
            Correo electrónico
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            autocomplete="email"
            :class="[
              'w-full rounded-xl border px-4 py-2.5 text-sm shadow-sm outline-none transition focus:ring-2',
              emailError
                ? 'border-red-400 focus:ring-red-300'
                : 'border-gray-300 focus:border-yellow-400 focus:ring-yellow-300',
            ]"
            placeholder="tu@correo.com"
            @blur="validateEmail"
          />
          <p v-if="emailError" class="mt-1 text-xs text-red-600">{{ emailError }}</p>
        </div>

        <!-- Password -->
        <div class="mb-6">
          <div class="mb-1.5 flex items-center justify-between">
            <label for="password" class="text-sm font-medium text-gray-700">Contraseña</label>
            <NuxtLink to="/forgot-password" class="text-xs text-yellow-600 hover:text-yellow-700 hover:underline">
              ¿Olvidaste tu contraseña?
            </NuxtLink>
          </div>
          <input
            id="password"
            v-model="password"
            type="password"
            autocomplete="current-password"
            :class="[
              'w-full rounded-xl border px-4 py-2.5 text-sm shadow-sm outline-none transition focus:ring-2',
              passwordError
                ? 'border-red-400 focus:ring-red-300'
                : 'border-gray-300 focus:border-yellow-400 focus:ring-yellow-300',
            ]"
            placeholder="••••••••"
            @blur="validatePassword"
          />
          <p v-if="passwordError" class="mt-1 text-xs text-red-600">{{ passwordError }}</p>
        </div>

        <!-- Submit -->
        <button
          type="submit"
          :disabled="isLoading"
          class="btn-primary flex w-full items-center justify-center gap-2 py-3 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg
            v-if="isLoading"
            class="h-4 w-4 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          {{ isLoading ? 'Iniciando sesión…' : 'Iniciar sesión' }}
        </button>
      </form>

      <!-- Register link -->
      <p class="mt-6 text-center text-sm text-gray-500">
        ¿No tienes cuenta?
        <NuxtLink to="/register" class="font-medium text-yellow-600 hover:text-yellow-700 hover:underline">
          Regístrate gratis
        </NuxtLink>
      </p>
    </div>
  </div>
</template>
