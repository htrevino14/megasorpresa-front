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
type RegisterForm = {
  first_name: string
  last_name: string
  gender: 'Ella' | 'Él' | ''
  email: string
  phone_code: string
  phone: string
  password: string
}

type ValidationErrors = Partial<Record<keyof RegisterForm, string[]>>

const form = reactive<RegisterForm>({
  first_name: '',
  last_name: '',
  gender: '',
  email: '',
  phone_code: '+52',
  phone: '',
  password: '',
})

const showPassword = ref(false)
const regLoading = ref(false)
const regApiError = ref<string | null>(null)
const validationErrors = reactive<ValidationErrors>({})

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

  form.first_name = ''
  form.last_name = ''
  form.gender = ''
  form.email = ''
  form.phone_code = '+52'
  form.phone = ''
  form.password = ''
  showPassword.value = false
  regLoading.value = false
  regApiError.value = null
  resetValidationErrors()
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

// ── Register helpers ──────────────────────────────────────────────────────────
function resetValidationErrors(): void {
  for (const key of Object.keys(validationErrors) as Array<keyof ValidationErrors>) {
    delete validationErrors[key]
  }
}

function togglePasswordVisibility(): void {
  showPassword.value = !showPassword.value
}

function validatePassword(): boolean {
  if (!form.password) {
    validationErrors.password = ['La contraseña es requerida.']
    return false
  }

  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(form.password)) {
    validationErrors.password = ['Ingresa mínimo 8 caracteres con mayúsculas, minúsculas, números y un carácter especial.']
    return false
  }

  return true
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
  resetValidationErrors()

  const passwordIsValid = validatePassword()
  if (!passwordIsValid) return

  regLoading.value = true
  try {
    await auth.register(
      form.first_name.trim(),
      form.last_name.trim(),
      form.gender as 'Ella' | 'Él',
      form.email.trim(),
      form.phone_code,
      form.phone.trim(),
      form.password,
    )
    authModal.close()
  } catch (err: unknown) {
    const axiosError = err as {
      response?: { status?: number; data?: { message?: string; errors?: Record<string, string[]> } }
    }
    if (axiosError.response?.status === 422) {
      resetValidationErrors()
      const backendErrors = axiosError.response.data?.errors ?? {}
      Object.assign(validationErrors, backendErrors)
      regApiError.value = axiosError.response.data?.message ?? 'Los datos ingresados no son válidos.'
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
              <div class="mb-6 text-center">
                <h2 class="text-2xl font-bold text-gray-800">Crea una cuenta</h2>
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
                <div class="mb-4 grid grid-cols-2 gap-3">
                  <div>
                    <input
                      id="modal-reg-first-name"
                      v-model="form.first_name"
                      type="text"
                      autocomplete="given-name"
                      :class="[
                        'w-full rounded-xl border px-4 py-2.5 text-sm shadow-sm outline-none transition focus:ring-2',
                        validationErrors.first_name?.[0]
                          ? 'border-red-400 focus:ring-red-300'
                          : 'border-gray-300 focus:border-yellow-400 focus:ring-yellow-300',
                      ]"
                      placeholder="Nombre"
                    />
                    <p v-if="validationErrors.first_name?.[0]" class="mt-1 text-xs text-red-600">
                      {{ validationErrors.first_name[0] }}
                    </p>
                  </div>
                  <div>
                    <input
                      id="modal-reg-last-name"
                      v-model="form.last_name"
                      type="text"
                      autocomplete="family-name"
                      :class="[
                        'w-full rounded-xl border px-4 py-2.5 text-sm shadow-sm outline-none transition focus:ring-2',
                        validationErrors.last_name?.[0]
                          ? 'border-red-400 focus:ring-red-300'
                          : 'border-gray-300 focus:border-yellow-400 focus:ring-yellow-300',
                      ]"
                      placeholder="Apellido"
                    />
                    <p v-if="validationErrors.last_name?.[0]" class="mt-1 text-xs text-red-600">
                      {{ validationErrors.last_name[0] }}
                    </p>
                  </div>
                </div>

                <div class="mb-4">
                  <p class="mb-2 text-sm font-medium text-gray-700">¿Cómo nos referimos a ti?</p>
                  <div class="flex items-center gap-6">
                    <label class="inline-flex items-center gap-2 text-sm text-gray-700">
                      <input
                        v-model="form.gender"
                        type="radio"
                        name="modal-reg-gender"
                        value="Ella"
                        class="h-4 w-4 border-gray-300 text-yellow-500 focus:ring-yellow-300"
                      >
                      Ella
                    </label>
                    <label class="inline-flex items-center gap-2 text-sm text-gray-700">
                      <input
                        v-model="form.gender"
                        type="radio"
                        name="modal-reg-gender"
                        value="Él"
                        class="h-4 w-4 border-gray-300 text-yellow-500 focus:ring-yellow-300"
                      >
                      Él
                    </label>
                  </div>
                  <p v-if="validationErrors.gender?.[0]" class="mt-1 text-xs text-red-600">
                    {{ validationErrors.gender[0] }}
                  </p>
                </div>

                <div class="mb-4">
                  <input
                    id="modal-reg-email"
                    v-model="form.email"
                    type="email"
                    autocomplete="email"
                    :class="[
                      'w-full rounded-xl border px-4 py-2.5 text-sm shadow-sm outline-none transition focus:ring-2',
                      validationErrors.email?.[0]
                        ? 'border-red-400 focus:ring-red-300'
                        : 'border-gray-300 focus:border-yellow-400 focus:ring-yellow-300',
                    ]"
                    placeholder="Correo electrónico"
                  />
                  <p v-if="validationErrors.email?.[0]" class="mt-1 text-xs text-red-600">{{ validationErrors.email[0] }}</p>
                  <p class="mt-1 text-xs text-gray-500">
                    Recibirás promociones y correos sobre el estatus de tus pedidos.
                  </p>
                </div>

                <div class="mb-4">
                  <div class="flex gap-2">
                    <select
                      id="modal-reg-phone-code"
                      v-model="form.phone_code"
                      :class="[
                        'w-24 rounded-xl border px-2 text-sm shadow-sm outline-none transition focus:ring-2',
                        validationErrors.phone_code?.[0]
                          ? 'border-red-400 focus:ring-red-300'
                          : 'border-gray-300 focus:border-yellow-400 focus:ring-yellow-300',
                      ]"
                    >
                      <option value="+52">+52</option>
                      <option value="+1">+1</option>
                      <option value="+34">+34</option>
                      <option value="+57">+57</option>
                    </select>
                    <input
                      id="modal-reg-phone"
                      v-model="form.phone"
                      type="tel"
                      autocomplete="tel-national"
                      :class="[
                        'w-full rounded-xl border px-4 py-2.5 text-sm shadow-sm outline-none transition focus:ring-2',
                        validationErrors.phone?.[0]
                          ? 'border-red-400 focus:ring-red-300'
                          : 'border-gray-300 focus:border-yellow-400 focus:ring-yellow-300',
                      ]"
                      placeholder="Número de teléfono"
                    />
                  </div>
                  <p v-if="validationErrors.phone_code?.[0]" class="mt-1 text-xs text-red-600">
                    {{ validationErrors.phone_code[0] }}
                  </p>
                  <p v-if="validationErrors.phone?.[0]" class="mt-1 text-xs text-red-600">{{ validationErrors.phone[0] }}</p>
                </div>

                <div class="mb-6">
                  <div class="relative">
                    <input
                      id="modal-reg-password"
                      v-model="form.password"
                      :type="showPassword ? 'text' : 'password'"
                      autocomplete="new-password"
                      :class="[
                        'w-full rounded-xl border px-4 py-2.5 pr-11 text-sm shadow-sm outline-none transition focus:ring-2',
                        validationErrors.password?.[0]
                          ? 'border-red-400 focus:ring-red-300'
                          : 'border-gray-300 focus:border-yellow-400 focus:ring-yellow-300',
                      ]"
                      placeholder="Contraseña"
                    />
                    <button
                      type="button"
                      class="absolute inset-y-0 right-0 inline-flex items-center px-3 text-gray-500 hover:text-gray-700"
                      :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                      @click="togglePasswordVisibility"
                    >
                      <svg v-if="!showPassword" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0Z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.27 2.943 9.543 7-1.273 4.057-5.065 7-9.543 7-4.477 0-8.268-2.943-9.542-7Z" />
                      </svg>
                      <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="m3 3 18 18" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M10.58 10.58a2 2 0 1 0 2.83 2.83" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9.88 5.09A9.96 9.96 0 0 1 12 4.88c4.5 0 8.32 2.96 9.57 7.12a10.8 10.8 0 0 1-4.04 5.41" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M6.61 6.61A10.8 10.8 0 0 0 2.43 12c.66 2.21 2.04 4.1 3.88 5.39" />
                      </svg>
                    </button>
                  </div>
                  <p v-if="validationErrors.password?.[0]" class="mt-1 text-xs text-red-600">{{ validationErrors.password[0] }}</p>
                  <p class="mt-1 text-xs text-gray-500">
                    Ingresa mínimo 8 caracteres con mayúsculas, minúsculas, números y un carácter especial.
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

              <div class="mt-6">
                <div class="mb-4 flex items-center gap-3">
                  <span class="h-px flex-1 bg-gray-200" />
                  <span class="text-xs font-medium uppercase tracking-wide text-gray-500">O</span>
                  <span class="h-px flex-1 bg-gray-200" />
                </div>

                <div class="mb-4 flex items-center justify-center gap-3">
                  <button type="button" class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-sm font-semibold text-gray-700 transition hover:bg-gray-50" aria-label="Registrarse con Google">
                    G
                  </button>
                  <button type="button" class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-sm font-semibold text-gray-700 transition hover:bg-gray-50" aria-label="Registrarse con Facebook">
                    f
                  </button>
                  <button type="button" class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-sm font-semibold text-gray-700 transition hover:bg-gray-50" aria-label="Registrarse con Apple">
                    A
                  </button>
                </div>

                <p class="text-center text-sm text-gray-500">
                  ¿Ya tienes una cuenta?
                  <button
                    type="button"
                    class="font-medium text-yellow-600 hover:text-yellow-700 hover:underline"
                    @click="authModal.switchMode()"
                  >
                    Iniciar sesión
                  </button>
                </p>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
