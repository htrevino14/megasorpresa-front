<script setup lang="ts">
/**
 * Account / Mi Perfil – Vista principal del área de cuenta del cliente.
 *
 * Usa `AccountLayout` para reutilizar el sidebar de navegación. Aquí solo
 * se inyecta el contenido específico (datos del perfil) en el slot.
 */
import type { User } from '@@/types/index'
import { getProfile } from '~/api/auth'
import EditProfileModal from '~/components/account/EditProfileModal.vue'

definePageMeta({
  layout: 'landing',
  middleware: 'auth',
})

const userData = ref<User | null>(null)
const isLoading = ref(true)
const isEditModalOpen = ref(false)
const successMessage = ref<string | null>(null)

/** Carga los datos del perfil al montar el componente. */
onMounted(async () => {
  isLoading.value = true
  try {
    const { data } = await getProfile()
    userData.value = data.data
  }
  catch {
    userData.value = null
  }
  finally {
    isLoading.value = false
  }
})

/** Devuelve el valor del campo o un guion si está vacío. */
function displayValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—'
  return String(value)
}

/** Nombre completo a partir de first_name/last_name, con fallback a name. */
const fullName = computed(() => {
  if (!userData.value) return ''
  const composed = [userData.value.first_name, userData.value.last_name]
    .filter(Boolean)
    .join(' ')
    .trim()
  return composed || userData.value.name
})

interface ProfileField {
  label: string
  value: string
  editable: boolean
}

const profileFields = computed<ProfileField[]>(() => [
  { label: 'Nombre', value: displayValue(fullName.value), editable: true },
  { label: 'Género', value: displayValue(userData.value?.gender), editable: true },
  { label: 'Número de teléfono', value: displayValue(userData.value?.phone), editable: true },
  { label: 'Correo electrónico', value: displayValue(userData.value?.email), editable: false },
])

function openEditModal(): void {
  isEditModalOpen.value = true
}

function handleProfileUpdated(updatedUser: User): void {
  userData.value = updatedUser
  isEditModalOpen.value = false
  successMessage.value = 'Informacion actualizada con exito.'

  setTimeout(() => {
    successMessage.value = null
  }, 3000)
}
</script>

<template>
  <AccountLayout active-tab="profile">
    <Head>
      <Title>Mi perfil · MegaSorpresa</Title>
    </Head>

    <!-- Datos de la cuenta -->
    <div class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8">
      <h2 class="text-xl font-bold text-gray-900">Mi perfil</h2>
      <p class="mt-1 text-sm text-gray-500">Datos de la cuenta</p>

      <div
        v-if="successMessage"
        class="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
      >
        {{ successMessage }}
      </div>

      <!-- Estado de carga -->
      <div v-if="isLoading" class="mt-6 space-y-4">
        <div v-for="n in 4" :key="n" class="animate-pulse border-b border-gray-100 pb-4">
          <div class="h-3 w-32 rounded bg-gray-200" />
          <div class="mt-2 h-4 w-48 rounded bg-gray-100" />
        </div>
      </div>

      <!-- Lista de campos de solo lectura -->
      <ul v-else class="mt-6 divide-y divide-gray-100">
        <li
          v-for="field in profileFields"
          :key="field.label"
          class="flex items-start justify-between gap-4 py-4"
        >
          <div class="min-w-0">
            <p class="text-sm font-medium text-gray-500">{{ field.label }}</p>
            <p class="mt-0.5 truncate text-sm font-semibold text-gray-900">
              {{ field.value }}
            </p>
          </div>
          <button
            v-if="field.editable"
            type="button"
            class="shrink-0 text-sm font-semibold text-pink-600 transition-colors hover:text-pink-700"
            @click="openEditModal"
          >
            Editar
          </button>
        </li>
      </ul>
    </div>

    <!-- Inicio de sesión y seguridad -->
    <div class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8">
      <h2 class="text-xl font-bold text-gray-900">Inicio de sesión y seguridad</h2>

      <div class="mt-4">
        <button
          type="button"
          class="flex w-full items-center justify-between border-b border-gray-100 py-4 text-left transition-colors hover:bg-gray-50"
        >
          <span class="text-sm font-semibold text-gray-900">Contraseña</span>
          <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <button
          type="button"
          class="flex w-full items-center justify-between border-b border-gray-100 py-4 text-left transition-colors hover:bg-gray-50"
        >
          <span class="text-sm font-semibold text-red-600">Eliminar mi cuenta</span>
          <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>

    <EditProfileModal
      :is-open="isEditModalOpen"
      :user="userData"
      @close="isEditModalOpen = false"
      @updated="handleProfileUpdated"
    />
  </AccountLayout>
</template>
