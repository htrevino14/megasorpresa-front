<script setup lang="ts">
/**
 * AuthModal – Global auth overlay that renders on top of any page.
 *
 * Controlled by `useAuthModalStore`. Supports switching between the login and
 * register forms inline.  After a successful auth action the modal closes and
 * the user stays on the page they were on.
 *
 * Place this component once in app.vue wrapped in <ClientOnly> so it is only
 * mounted in the browser (avoids SSR Teleport mismatches).
 *
 * @emits none
 */
import { useAuthModalStore } from '~/stores/authModal'
import { useAuthStore } from '~/stores/auth'

const authModal = useAuthModalStore()
const auth = useAuthStore()

// ── Login form state ──────────────────────────────────────────────────────────
const loginEmail = ref('')
const loginPassword = ref('')
const loginLoading = ref(false)
const loginApiError = ref<string | null>(null)
const loginEmailError = ref<string | null>(null)
const loginPasswordError = ref<string | null>(null)

// ── Register form state ───────────────────────────────────────────────────────
const regName = ref('')
const regEmail = ref('')
const regPassword = ref('')
const regPasswordConfirmation = ref('')
const regLoading = ref(false)
const regApiError = ref<string | null>(null)
const regNameError = ref<string | null>(null)
const regEmailError = ref<string | null>(null)
const regPasswordError = ref<string | null>(null)
const regPasswordConfirmationError = ref<string | null>(null)

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// ── Reset forms when modal closes ─────────────────────────────────────────────
watch(
  () => authModal.isOpen,
  (isOpen) => {
    if (!isOpen) resetAll()
  },
)

function resetAll() {
  loginEmail.value = ''
  loginPassword.value = ''
  loginLoading.value = false
  loginApiError.value = null
  loginEmailError.value = null
  loginPasswordError.value = null

  regName.value = ''
  regEmail.value = ''
  regPassword.value = ''
  regPasswordConfirmation.value = ''
  regLoading.value = false
  regApiError.value = null
  regNameError.value = null
  regEmailError.value = null
  regPasswordError.value = null
  regPasswordConfirmationError.value = null
}

// ── Keyboard: close on Escape ─────────────────────────────────────────────────
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') authModal.close()
}
onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))

// ── Login validation ──────────────────────────────────────────────────────────
function validateLoginEmail(): boolean {
  if (!loginEmail.value.trim()) { loginEmailError.value = 'El correo electrónico es requerido.'; return false }
  if (!emailRegex.test(loginEmail.value.trim())) { loginEmailError.value = 'Ingresa un correo electrónico válido.'; return false }
  loginEmailError.value = null; return true
}

function validateLoginPassword(): boolean {
  if (!loginPassword.value) { loginPasswordError.value = 'La contraseña es requerida.'; return false }
  loginPasswordError.value = null; return true
}

// ── Register validation ───────────────────────────────────────────────────────
function validateRegName(): boolean {
  if (!regName.value.trim()) { regNameError.value = 'El nombre es requerido.'; return false }
  if (regName.value.trim().length < 2) { regNameError.value = 'El nombre debe tener al menos 2 caracteres.'; return false }
  regNameError.value = null; return true
}

function validateRegEmail(): boolean {
  if (!regEmail.value.trim()) { regEmailError.value = 'El correo electrónico es requerido.'; return false }
  if (!emailRegex.test(regEmail.value.trim())) { regEmailError.value = 'Ingresa un correo electrónico válido.'; return false }
  regEmailError.value = null; return true
}

function validateRegPassword(): boolean {
  if (!regPassword.value) { regPasswordError.value = 'La contraseña es requerida.'; return false }
  if (regPassword.value.length < 8) { regPasswordError.value = 'La contraseña debe tener al menos 8 caracteres.'; return false }
  regPasswordError.value = null; return true
}

function validateRegConfirmation(): boolean {
  if (!regPasswordConfirmation.value) { regPasswordConfirmationError.value = 'Confirma tu contraseña.'; return false }
  if (regPasswordConfirmation.value !== regPassword.value) { regPasswordConfirmationError.value = 'Las contraseñas no coinciden.'; return false }
  regPasswordConfirmationError.value = null; return true
}

// ── Submit: login ─────────────────────────────────────────────────────────────
async function handleLogin() {
  loginApiError.value = null
  const valid = validateLoginEmail() && validateLoginPassword()
  if (!valid) return

  loginLoading.value = true
  try {
    await auth.login(loginEmail.value.trim(), loginPassword.value)
    authModal.close()
  } catch (err: unknown) {
    const axiosError = err as { response?: { status?: number; data?: { message?: string } } }
    if (axiosError.response?.status === 401 || axiosError.response?.status === 422) {
      loginApiError.value = 'Correo o contraseña incorrectos.'
    } else if (axiosError.response?.data?.message) {
      loginApiError.value = axiosError.response.data.message
    } else {
      loginApiError.value = 'Ocurrió un error al iniciar sesión. Intenta de nuevo más tarde.'
    }
  } finally {
    loginLoading.value = false
  }
}

// ── Submit: register ──────────────────────────────────────────────────────────
async function handleRegister() {
  regApiError.value = null
  const ok1 = validateRegName()
  const ok2 = validateRegEmail()
  const ok3 = validateRegPassword()
  const ok4 = validateRegConfirmation()
  if (!ok1 || !ok2 || !ok3 || !ok4) return

  regLoading.value = true
  try {
    await auth.register(
      regName.value.trim(),
      regEmail.value.trim(),
      regPassword.value,
      regPasswordConfirmation.value,
    )
    authModal.close()
  } catch (err: unknown) {
    const axiosError = err as {
      response?: { status?: number; data?: { message?: string; errors?: Record<string, string[]> } }
    }
    if (axiosError.response?.status === 422) {
      const errors = axiosError.response.data?.errors
      if (errors) {
        const firstKey = Object.keys(errors)[0]
        regApiError.value = (firstKey ? errors[firstKey][0] : null) ?? 'Los datos ingresados no son válidos.'
      } else {
        regApiError.value = axiosError.response.data?.message ?? 'Los datos ingresados no son válidos.'
      }
    } else if (axiosError.response?.data?.message) {
      regApiError.value = axiosError.response.data.message
    } else {
      regApiError.value = 'Ocurrió un error al crear tu cuenta. Intenta de nuevo más tarde.'
    }
  } finally {
    regLoading.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="authModal.isOpen"
        class="fixed inset-0 z-[9999] flex items-center justify-center px-4"
        role="dialog"
        aria-modal="true"
        :aria-label="authModal.mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/60 backdrop-blur-sm"
          aria-hidden="true"
          @click="authModal.close()"
        />

        <!-- Modal card -->
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-2"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-2"
          mode="out-in"
        >
          <!-- ── LOGIN FORM ─────────────────────────────────────────────────── -->
          <div
            v-if="authModal.mode === 'login'"
            key="login"
            class="relative z-10 w-full max-w-md"
          >
            <div class="card px-8 py-10 shadow-2xl">
              <!-- Close button -->
              <button
                class="absolute right-4 top-4 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                aria-label="Cerrar"
                @click="authModal.close()"
              >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <!-- Heading -->
              <div class="mb-7 text-center">
                <span class="text-4xl" aria-hidden="true">🎁</span>
                <h2 class="mt-3 text-2xl font-bold text-gray-800">Iniciar sesión</h2>
                <p class="mt-1 text-sm text-gray-500">Bienvenido de vuelta a Megasorpresa</p>
              </div>

              <!-- API error -->
              <Transition
                enter-active-class="transition-all duration-200 ease-out"
                enter-from-class="opacity-0 -translate-y-1"
                enter-to-class="opacity-100 translate-y-0"
              >
                <div
                  v-if="loginApiError"
                  role="alert"
                  class="mb-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  <svg class="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{{ loginApiError }}</span>
                </div>
              </Transition>

              <!-- Form -->
              <form novalidate @submit.prevent="handleLogin">
                <div class="mb-4">
                  <label for="modal-login-email" class="mb-1.5 block text-sm font-medium text-gray-700">
                    Correo electrónico
                  </label>
                  <input
                    id="modal-login-email"
                    v-model="loginEmail"
                    type="email"
                    autocomplete="email"
                    :class="[
                      'w-full rounded-xl border px-4 py-2.5 text-sm shadow-sm outline-none transition focus:ring-2',
                      loginEmailError
                        ? 'border-red-400 focus:ring-red-300'
                        : 'border-gray-300 focus:border-yellow-400 focus:ring-yellow-300',
                    ]"
                    placeholder="tu@correo.com"
                    @blur="validateLoginEmail"
                  />
                  <p v-if="loginEmailError" class="mt-1 text-xs text-red-600">{{ loginEmailError }}</p>
                </div>

                <div class="mb-6">
                  <div class="mb-1.5 flex items-center justify-between">
                    <label for="modal-login-password" class="text-sm font-medium text-gray-700">
                      Contraseña
                    </label>
                    <NuxtLink
                      to="/forgot-password"
                      class="text-xs text-yellow-600 hover:text-yellow-700 hover:underline"
                      @click="authModal.close()"
                    >
                      ¿Olvidaste tu contraseña?
                    </NuxtLink>
                  </div>
                  <input
                    id="modal-login-password"
                    v-model="loginPassword"
                    type="password"
                    autocomplete="current-password"
                    :class="[
                      'w-full rounded-xl border px-4 py-2.5 text-sm shadow-sm outline-none transition focus:ring-2',
                      loginPasswordError
                        ? 'border-red-400 focus:ring-red-300'
                        : 'border-gray-300 focus:border-yellow-400 focus:ring-yellow-300',
                    ]"
                    placeholder="••••••••"
                    @blur="validateLoginPassword"
                  />
                  <p v-if="loginPasswordError" class="mt-1 text-xs text-red-600">{{ loginPasswordError }}</p>
                </div>

                <button
                  type="submit"
                  :disabled="loginLoading"
                  class="btn-primary flex w-full items-center justify-center gap-2 py-3 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <svg v-if="loginLoading" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  {{ loginLoading ? 'Iniciando sesión…' : 'Iniciar sesión' }}
                </button>
              </form>

              <p class="mt-6 text-center text-sm text-gray-500">
                ¿No tienes cuenta?
                <button
                  type="button"
                  class="font-medium text-yellow-600 hover:text-yellow-700 hover:underline"
                  @click="authModal.switchMode()"
                >
                  Regístrate gratis
                </button>
              </p>
            </div>
          </div>

          <!-- ── REGISTER FORM ──────────────────────────────────────────────── -->
          <div
            v-else
            key="register"
            class="relative z-10 w-full max-w-md"
          >
            <div class="card px-8 py-10 shadow-2xl">
              <!-- Close button -->
              <button
                class="absolute right-4 top-4 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                aria-label="Cerrar"
                @click="authModal.close()"
              >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <!-- Heading -->
              <div class="mb-7 text-center">
                <span class="text-4xl" aria-hidden="true">🎁</span>
                <h2 class="mt-3 text-2xl font-bold text-gray-800">Crear cuenta</h2>
                <p class="mt-1 text-sm text-gray-500">Únete a Megasorpresa y disfruta compras sin complicaciones</p>
              </div>

              <!-- API error -->
              <Transition
                enter-active-class="transition-all duration-200 ease-out"
                enter-from-class="opacity-0 -translate-y-1"
                enter-to-class="opacity-100 translate-y-0"
              >
                <div
                  v-if="regApiError"
                  role="alert"
                  class="mb-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  <svg class="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{{ regApiError }}</span>
                </div>
              </Transition>

              <!-- Form -->
              <form novalidate @submit.prevent="handleRegister">
                <div class="mb-4">
                  <label for="modal-reg-name" class="mb-1.5 block text-sm font-medium text-gray-700">
                    Nombre completo
                  </label>
                  <input
                    id="modal-reg-name"
                    v-model="regName"
                    type="text"
                    autocomplete="name"
                    :class="[
                      'w-full rounded-xl border px-4 py-2.5 text-sm shadow-sm outline-none transition focus:ring-2',
                      regNameError
                        ? 'border-red-400 focus:ring-red-300'
                        : 'border-gray-300 focus:border-yellow-400 focus:ring-yellow-300',
                    ]"
                    placeholder="Juan Pérez"
                    @blur="validateRegName"
                  />
                  <p v-if="regNameError" class="mt-1 text-xs text-red-600">{{ regNameError }}</p>
                </div>

                <div class="mb-4">
                  <label for="modal-reg-email" class="mb-1.5 block text-sm font-medium text-gray-700">
                    Correo electrónico
                  </label>
                  <input
                    id="modal-reg-email"
                    v-model="regEmail"
                    type="email"
                    autocomplete="email"
                    :class="[
                      'w-full rounded-xl border px-4 py-2.5 text-sm shadow-sm outline-none transition focus:ring-2',
                      regEmailError
                        ? 'border-red-400 focus:ring-red-300'
                        : 'border-gray-300 focus:border-yellow-400 focus:ring-yellow-300',
                    ]"
                    placeholder="tu@correo.com"
                    @blur="validateRegEmail"
                  />
                  <p v-if="regEmailError" class="mt-1 text-xs text-red-600">{{ regEmailError }}</p>
                </div>

                <div class="mb-4">
                  <label for="modal-reg-password" class="mb-1.5 block text-sm font-medium text-gray-700">
                    Contraseña
                  </label>
                  <input
                    id="modal-reg-password"
                    v-model="regPassword"
                    type="password"
                    autocomplete="new-password"
                    :class="[
                      'w-full rounded-xl border px-4 py-2.5 text-sm shadow-sm outline-none transition focus:ring-2',
                      regPasswordError
                        ? 'border-red-400 focus:ring-red-300'
                        : 'border-gray-300 focus:border-yellow-400 focus:ring-yellow-300',
                    ]"
                    placeholder="Mínimo 8 caracteres"
                    @blur="validateRegPassword"
                  />
                  <p v-if="regPasswordError" class="mt-1 text-xs text-red-600">{{ regPasswordError }}</p>
                </div>

                <div class="mb-6">
                  <label for="modal-reg-confirm" class="mb-1.5 block text-sm font-medium text-gray-700">
                    Confirmar contraseña
                  </label>
                  <input
                    id="modal-reg-confirm"
                    v-model="regPasswordConfirmation"
                    type="password"
                    autocomplete="new-password"
                    :class="[
                      'w-full rounded-xl border px-4 py-2.5 text-sm shadow-sm outline-none transition focus:ring-2',
                      regPasswordConfirmationError
                        ? 'border-red-400 focus:ring-red-300'
                        : 'border-gray-300 focus:border-yellow-400 focus:ring-yellow-300',
                    ]"
                    placeholder="Repite tu contraseña"
                    @blur="validateRegConfirmation"
                  />
                  <p v-if="regPasswordConfirmationError" class="mt-1 text-xs text-red-600">
                    {{ regPasswordConfirmationError }}
                  </p>
                </div>

                <button
                  type="submit"
                  :disabled="regLoading"
                  class="btn-primary flex w-full items-center justify-center gap-2 py-3 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <svg v-if="regLoading" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  {{ regLoading ? 'Creando cuenta…' : 'Crear cuenta' }}
                </button>
              </form>

              <p class="mt-6 text-center text-sm text-gray-500">
                ¿Ya tienes cuenta?
                <button
                  type="button"
                  class="font-medium text-yellow-600 hover:text-yellow-700 hover:underline"
                  @click="authModal.switchMode()"
                >
                  Inicia sesión
                </button>
              </p>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
