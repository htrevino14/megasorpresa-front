<script setup lang="ts">
/**
 * register – New user registration page.
 *
 * Connects to POST /api/auth/register via the auth Pinia store.
 * On success, the user is automatically logged in and redirected to the
 * catalog.  Displays inline validation errors and API error feedback.
 *
 * @emits none
 */
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'auth' })

const auth = useAuthStore()
const router = useRouter()

// Redirect already-authenticated users away from the register page
if (auth.isAuthenticated) {
  await navigateTo('/catalog')
}

// ── Form state ────────────────────────────────────────────────────────────────
const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const isLoading = ref(false)
const apiError = ref<string | null>(null)

// ── Validation ────────────────────────────────────────────────────────────────
const nameError = ref<string | null>(null)
const emailError = ref<string | null>(null)
const passwordError = ref<string | null>(null)
const passwordConfirmationError = ref<string | null>(null)

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateName(): boolean {
  if (!name.value.trim()) {
    nameError.value = 'El nombre es requerido.'
    return false
  }
  if (name.value.trim().length < 2) {
    nameError.value = 'El nombre debe tener al menos 2 caracteres.'
    return false
  }
  nameError.value = null
  return true
}

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
  if (password.value.length < 8) {
    passwordError.value = 'La contraseña debe tener al menos 8 caracteres.'
    return false
  }
  passwordError.value = null
  return true
}

function validatePasswordConfirmation(): boolean {
  if (!passwordConfirmation.value) {
    passwordConfirmationError.value = 'Confirma tu contraseña.'
    return false
  }
  if (passwordConfirmation.value !== password.value) {
    passwordConfirmationError.value = 'Las contraseñas no coinciden.'
    return false
  }
  passwordConfirmationError.value = null
  return true
}

function validateAll(): boolean {
  const ok1 = validateName()
  const ok2 = validateEmail()
  const ok3 = validatePassword()
  const ok4 = validatePasswordConfirmation()
  return ok1 && ok2 && ok3 && ok4
}

// ── Submit ────────────────────────────────────────────────────────────────────
async function handleSubmit() {
  apiError.value = null
  if (!validateAll()) return

  isLoading.value = true
  try {
    await auth.register(
      name.value.trim(),
      email.value.trim(),
      password.value,
      passwordConfirmation.value,
    )
    await router.push('/catalog')
  } catch (err: unknown) {
    const axiosError = err as {
      response?: { status?: number; data?: { message?: string; errors?: Record<string, string[]> } }
    }
    if (axiosError.response?.status === 422) {
      // Show the first validation error from the backend if available
      const errors = axiosError.response.data?.errors
      if (errors) {
        const firstKey = Object.keys(errors)[0]
        if (firstKey) {
          apiError.value = errors[firstKey][0] ?? 'Los datos ingresados no son válidos.'
        } else {
          apiError.value = 'Los datos ingresados no son válidos.'
        }
      } else {
        apiError.value = axiosError.response.data?.message ?? 'Los datos ingresados no son válidos.'
      }
    } else if (axiosError.response?.data?.message) {
      apiError.value = axiosError.response.data.message
    } else {
      apiError.value = 'Ocurrió un error al crear tu cuenta. Intenta de nuevo más tarde.'
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
          Crear cuenta
        </h1>
        <p class="mt-1 text-sm text-gray-500">
          Únete a Megasorpresa y disfruta compras sin complicaciones
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
        <!-- Name -->
        <div class="mb-4">
          <label for="name" class="mb-1.5 block text-sm font-medium text-gray-700">
            Nombre completo
          </label>
          <input
            id="name"
            v-model="name"
            type="text"
            autocomplete="name"
            :class="[
              'w-full rounded-xl border px-4 py-2.5 text-sm shadow-sm outline-none transition focus:ring-2',
              nameError
                ? 'border-red-400 focus:ring-red-300'
                : 'border-gray-300 focus:border-yellow-400 focus:ring-yellow-300',
            ]"
            placeholder="Juan Pérez"
            @blur="validateName"
          />
          <p v-if="nameError" class="mt-1 text-xs text-red-600">{{ nameError }}</p>
        </div>

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
        <div class="mb-4">
          <label for="password" class="mb-1.5 block text-sm font-medium text-gray-700">
            Contraseña
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            autocomplete="new-password"
            :class="[
              'w-full rounded-xl border px-4 py-2.5 text-sm shadow-sm outline-none transition focus:ring-2',
              passwordError
                ? 'border-red-400 focus:ring-red-300'
                : 'border-gray-300 focus:border-yellow-400 focus:ring-yellow-300',
            ]"
            placeholder="Mínimo 8 caracteres"
            @blur="validatePassword"
          />
          <p v-if="passwordError" class="mt-1 text-xs text-red-600">{{ passwordError }}</p>
        </div>

        <!-- Password confirmation -->
        <div class="mb-6">
          <label for="password-confirmation" class="mb-1.5 block text-sm font-medium text-gray-700">
            Confirmar contraseña
          </label>
          <input
            id="password-confirmation"
            v-model="passwordConfirmation"
            type="password"
            autocomplete="new-password"
            :class="[
              'w-full rounded-xl border px-4 py-2.5 text-sm shadow-sm outline-none transition focus:ring-2',
              passwordConfirmationError
                ? 'border-red-400 focus:ring-red-300'
                : 'border-gray-300 focus:border-yellow-400 focus:ring-yellow-300',
            ]"
            placeholder="Repite tu contraseña"
            @blur="validatePasswordConfirmation"
          />
          <p v-if="passwordConfirmationError" class="mt-1 text-xs text-red-600">
            {{ passwordConfirmationError }}
          </p>
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
          {{ isLoading ? 'Creando cuenta…' : 'Crear cuenta' }}
        </button>
      </form>

      <!-- Login link -->
      <p class="mt-6 text-center text-sm text-gray-500">
        ¿Ya tienes cuenta?
        <NuxtLink to="/login" class="font-medium text-yellow-600 hover:text-yellow-700 hover:underline">
          Inicia sesión
        </NuxtLink>
      </p>
    </div>
  </div>
</template>
