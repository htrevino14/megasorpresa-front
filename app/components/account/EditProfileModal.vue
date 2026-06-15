<script setup lang="ts">
/**
 * EditProfileModal - Modal para editar la informacion personal del usuario.
 *
 * @prop {User | null} user - Datos actuales del usuario autenticado.
 * @prop {boolean} isOpen - Controla la visibilidad del modal.
 * @emits close - Solicita cerrar el modal.
 * @emits updated - Notifica que el perfil se actualizo correctamente.
 */
import type { User } from '@@/types/index'
import { updateProfile, type UpdateProfilePayload } from '~/api/auth'

type GenderOption = 'Ella' | 'Él'

type ProfileForm = {
  first_name: string
  last_name: string
  gender: GenderOption | ''
  phone_code: string
  phone: string
}

type ValidationErrors = Partial<Record<keyof ProfileForm, string[]>>

const props = defineProps<{
  user: User | null
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
  updated: [user: User]
}>()

const form = reactive<ProfileForm>({
  first_name: '',
  last_name: '',
  gender: '',
  phone_code: '+52',
  phone: '',
})

const ladaOptions = ['+52', '+1', '+34', '+57']
const isSubmitting = ref(false)
const apiError = ref<string | null>(null)
const validationErrors = reactive<ValidationErrors>({})

function resetValidationErrors(): void {
  for (const key of Object.keys(validationErrors) as Array<keyof ValidationErrors>) {
    delete validationErrors[key]
  }
}

function splitPhoneValue(rawPhone: string | null | undefined): { phone_code: string, phone: string } {
  const value = (rawPhone ?? '').trim()
  for (const code of ladaOptions) {
    if (value.startsWith(code)) {
      return {
        phone_code: code,
        phone: value.slice(code.length),
      }
    }
  }

  return {
    phone_code: '+52',
    phone: value,
  }
}

function initializeFormFromUser(): void {
  if (!props.user) {
    form.first_name = ''
    form.last_name = ''
    form.gender = ''
    form.phone_code = '+52'
    form.phone = ''
    return
  }

  const { phone_code, phone } = splitPhoneValue(props.user.phone)

  form.first_name = props.user.first_name ?? ''
  form.last_name = props.user.last_name ?? ''
  form.gender = (props.user.gender === 'Ella' || props.user.gender === 'Él')
    ? props.user.gender
    : ''
  form.phone_code = phone_code
  form.phone = phone
}

function closeModal(): void {
  emit('close')
}

async function submitUpdate(): Promise<void> {
  if (isSubmitting.value) return

  isSubmitting.value = true
  apiError.value = null
  resetValidationErrors()

  try {
    if (!form.gender) {
      validationErrors.gender = ['Selecciona una opcion de genero.']
      apiError.value = 'Revisa los campos marcados.'
      return
    }

    const payload: UpdateProfilePayload = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      gender: form.gender,
      phone_code: form.phone_code.trim(),
      phone: form.phone.trim(),
    }

    const { data } = await updateProfile(payload)

    emit('updated', data.data)
    closeModal()
  }
  catch (error: unknown) {
    const axiosError = error as {
      response?: {
        status?: number
        data?: { message?: string, errors?: Record<string, string[]> }
      }
    }

    if (axiosError.response?.status === 422) {
      Object.assign(validationErrors, axiosError.response.data?.errors ?? {})
      apiError.value = axiosError.response.data?.message ?? 'Revisa los campos marcados.'
      return
    }

    apiError.value = axiosError.response?.data?.message ?? 'No se pudo actualizar tu informacion. Intenta de nuevo.'
  }
  finally {
    isSubmitting.value = false
  }
}

watch(
  () => props.user,
  () => {
    initializeFormFromUser()
  },
  { deep: true },
)

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      initializeFormFromUser()
      apiError.value = null
      resetValidationErrors()
    }
  },
)

onMounted(() => {
  initializeFormFromUser()
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/55 px-4 py-6"
        role="dialog"
        aria-modal="true"
        aria-label="Editar informacion personal"
      >
        <div class="absolute inset-0" @click="closeModal" />

        <div class="relative z-10 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl sm:p-7">
          <h2 class="mb-6 text-2xl font-bold text-gray-900">
            Editar informacion personal
          </h2>

          <p
            v-if="apiError"
            class="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {{ apiError }}
          </p>

          <form class="space-y-5" @submit.prevent="submitUpdate">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label for="profile-first-name" class="mb-1.5 block text-sm font-medium text-gray-700">Nombre</label>
                <input
                  id="profile-first-name"
                  v-model="form.first_name"
                  type="text"
                  class="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2"
                  :class="validationErrors.first_name?.[0]
                    ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                    : 'border-gray-300 focus:border-pink-400 focus:ring-pink-100'"
                >
                <p v-if="validationErrors.first_name?.[0]" class="mt-1 text-xs text-red-600">{{ validationErrors.first_name[0] }}</p>
              </div>

              <div>
                <label for="profile-last-name" class="mb-1.5 block text-sm font-medium text-gray-700">Apellido</label>
                <input
                  id="profile-last-name"
                  v-model="form.last_name"
                  type="text"
                  class="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2"
                  :class="validationErrors.last_name?.[0]
                    ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                    : 'border-gray-300 focus:border-pink-400 focus:ring-pink-100'"
                >
                <p v-if="validationErrors.last_name?.[0]" class="mt-1 text-xs text-red-600">{{ validationErrors.last_name[0] }}</p>
              </div>
            </div>

            <div>
              <p class="mb-2 text-sm font-medium text-gray-700">Genero</p>
              <div class="flex flex-wrap items-center gap-6 rounded-xl border border-gray-200 px-4 py-3">
                <label class="inline-flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                  <input
                    v-model="form.gender"
                    type="radio"
                    value="Ella"
                    class="h-4 w-4 border-gray-300 text-pink-600 focus:ring-pink-500"
                  >
                  <span>Ella</span>
                </label>

                <label class="inline-flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                  <input
                    v-model="form.gender"
                    type="radio"
                    value="Él"
                    class="h-4 w-4 border-gray-300 text-pink-600 focus:ring-pink-500"
                  >
                  <span>Él</span>
                </label>
              </div>
              <p v-if="validationErrors.gender?.[0]" class="mt-1 text-xs text-red-600">{{ validationErrors.gender[0] }}</p>
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-[120px_1fr]">
              <div>
                <label for="profile-phone-code" class="mb-1.5 block text-sm font-medium text-gray-700">Lada</label>
                <select
                  id="profile-phone-code"
                  v-model="form.phone_code"
                  class="w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:ring-2"
                  :class="validationErrors.phone_code?.[0]
                    ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                    : 'border-gray-300 focus:border-pink-400 focus:ring-pink-100'"
                >
                  <option v-for="code in ladaOptions" :key="code" :value="code">
                    {{ code }}
                  </option>
                </select>
                <p v-if="validationErrors.phone_code?.[0]" class="mt-1 text-xs text-red-600">{{ validationErrors.phone_code[0] }}</p>
              </div>

              <div>
                <label for="profile-phone" class="mb-1.5 block text-sm font-medium text-gray-700">Numero de telefono</label>
                <input
                  id="profile-phone"
                  v-model="form.phone"
                  type="tel"
                  class="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2"
                  :class="validationErrors.phone?.[0]
                    ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                    : 'border-gray-300 focus:border-pink-400 focus:ring-pink-100'"
                >
                <p v-if="validationErrors.phone?.[0]" class="mt-1 text-xs text-red-600">{{ validationErrors.phone[0] }}</p>
              </div>
            </div>

            <div class="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
              <button
                type="button"
                class="inline-flex items-center justify-center rounded-xl bg-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-300"
                @click="closeModal"
              >
                Cancelar
              </button>

              <button
                type="submit"
                class="inline-flex items-center justify-center rounded-xl bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="isSubmitting"
              >
                {{ isSubmitting ? 'Guardando...' : 'Guardar cambios' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
