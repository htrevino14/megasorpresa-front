<script setup lang="ts">
/**
 * AddressModal - Modal para crear una nueva direccion de envio.
 *
 * @prop {boolean} modelValue - Controla apertura/cierre del modal.
 * @emits update:modelValue - Sincroniza el estado abierto/cerrado con el padre.
 * @emits saved - Notifica al padre para refrescar el listado de direcciones.
 */
import { createAddress, type DwellingTypeOption, type StoreAddressPayload } from '~/api/addresses'
import { getStates, getCitiesByState } from '~/api/locations'
import type { CatalogCity, CatalogState } from '@@/types/index'

type ValidationErrors = Partial<Record<keyof StoreAddressPayload, string[]>>

const props = defineProps<{ modelValue: boolean }>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'saved': []
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const dwellingOptions: { value: DwellingTypeOption, label: string }[] = [
  { value: 'casa', label: 'Casa' },
  { value: 'departamento', label: 'Departamento' },
  { value: 'oficina', label: 'Oficina' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'restaurante', label: 'Restaurante' },
  { value: 'escuela', label: 'Escuela' },
  { value: 'hospital', label: 'Hospital' },
  { value: 'teatro', label: 'Teatro' },
  { value: 'plaza comercial', label: 'Plaza comercial' },
  { value: 'otro', label: 'Otro' },
]

const form = reactive<StoreAddressPayload>({
  recipient_name: '',
  phone_code: '+52',
  phone: '',
  address_search: '',
  street: '',
  ext_number: '',
  neighborhood: '',
  dwelling_type: 'casa',
  zip_code: '',
  state_id: 0,
  city_id: 0,
  references: '',
})

const states = ref<CatalogState[]>([])
const cities = ref<CatalogCity[]>([])
const loadingStates = ref(false)
const loadingCities = ref(false)
const isSubmitting = ref(false)
const apiError = ref<string | null>(null)
const validationErrors = reactive<ValidationErrors>({})

function closeModal(): void {
  isOpen.value = false
}

function resetValidationErrors(): void {
  for (const key of Object.keys(validationErrors) as Array<keyof ValidationErrors>) {
    delete validationErrors[key]
  }
}

function resetForm(): void {
  form.recipient_name = ''
  form.phone_code = '+52'
  form.phone = ''
  form.address_search = ''
  form.street = ''
  form.ext_number = ''
  form.neighborhood = ''
  form.dwelling_type = 'casa'
  form.zip_code = ''
  form.state_id = 0
  form.city_id = 0
  form.references = ''
  cities.value = []
  apiError.value = null
  resetValidationErrors()
}

async function loadStates(): Promise<void> {
  loadingStates.value = true
  try {
    const { data } = await getStates()
    states.value = data.data
  }
  catch {
    states.value = []
  }
  finally {
    loadingStates.value = false
  }
}

async function loadCities(stateId: number): Promise<void> {
  loadingCities.value = true
  try {
    const { data } = await getCitiesByState(stateId)
    cities.value = data.data
  }
  catch {
    cities.value = []
  }
  finally {
    loadingCities.value = false
  }
}

watch(
  () => form.state_id,
  (stateId, previous) => {
    if (previous !== undefined) {
      form.city_id = 0
    }
    if (stateId > 0) {
      void loadCities(stateId)
    }
    else {
      cities.value = []
    }
  },
)

watch(
  () => isOpen.value,
  (open) => {
    if (open) {
      if (states.value.length === 0) {
        void loadStates()
      }
      return
    }

    resetForm()
  },
)

async function handleSubmit(): Promise<void> {
  if (isSubmitting.value) return

  isSubmitting.value = true
  apiError.value = null
  resetValidationErrors()

  try {
    await createAddress({
      ...form,
      recipient_name: form.recipient_name.trim(),
      phone: form.phone.trim(),
      street: form.street.trim(),
      ext_number: form.ext_number.trim(),
      neighborhood: form.neighborhood.trim(),
      zip_code: form.zip_code.trim(),
      references: form.references?.trim() ?? '',
      address_search: form.address_search?.trim() ?? '',
    })

    emit('saved')
    closeModal()
  }
  catch (error: unknown) {
    const axiosError = error as {
      response?: { status?: number, data?: { message?: string, errors?: Record<string, string[]> } }
    }

    if (axiosError.response?.status === 422) {
      Object.assign(validationErrors, axiosError.response.data?.errors ?? {})
      apiError.value = axiosError.response.data?.message ?? 'Revisa los campos marcados.'
    }
    else {
      apiError.value = axiosError.response?.data?.message ?? 'No se pudo guardar la direccion. Intenta de nuevo.'
    }
  }
  finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  if (isOpen.value) {
    void loadStates()
  }
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
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/35 px-4 py-6"
        role="dialog"
        aria-modal="true"
        aria-label="Agregar direccion"
      >
        <div class="absolute inset-0" @click="closeModal" />

        <div class="relative z-10 w-full max-w-4xl rounded-xl bg-white p-6 shadow-2xl sm:p-7">
          <button
            type="button"
            class="absolute right-4 top-4 rounded-full p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Cerrar"
            @click="closeModal"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h2 class="mb-5 text-3xl font-bold text-gray-900">Nuevo destinatario</h2>

          <p
            v-if="apiError"
            class="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {{ apiError }}
          </p>

          <form class="space-y-3" @submit.prevent="handleSubmit">
            <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <input
                  v-model="form.recipient_name"
                  type="text"
                  placeholder="Nombre y apellido"
                  class="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
                  :class="validationErrors.recipient_name?.[0] ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-gray-300'"
                >
                <p v-if="validationErrors.recipient_name?.[0]" class="mt-1 text-xs text-red-600">{{ validationErrors.recipient_name[0] }}</p>
              </div>

              <div>
                <div class="grid grid-cols-[104px_1fr] gap-2">
                  <div>
                    <select
                      v-model="form.phone_code"
                      class="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
                      :class="validationErrors.phone_code?.[0] ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-gray-300'"
                    >
                      <option value="+52">+52</option>
                    </select>
                    <p v-if="validationErrors.phone_code?.[0]" class="mt-1 text-xs text-red-600">{{ validationErrors.phone_code[0] }}</p>
                  </div>

                  <div>
                    <input
                      v-model="form.phone"
                      type="tel"
                      placeholder="Telefono del destinatario"
                      class="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
                      :class="validationErrors.phone?.[0] ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-gray-300'"
                    >
                    <p v-if="validationErrors.phone?.[0]" class="mt-1 text-xs text-red-600">{{ validationErrors.phone[0] }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div class="relative">
                <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-4.35-4.35m1.85-5.15a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
                  </svg>
                </span>
                <input
                  v-model="form.address_search"
                  type="text"
                  placeholder="Buscar direccion"
                  class="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
                >
              </div>
              <p v-if="validationErrors.address_search?.[0]" class="mt-1 text-xs text-red-600">{{ validationErrors.address_search[0] }}</p>
            </div>

            <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <input
                  v-model="form.street"
                  type="text"
                  placeholder="Calle"
                  class="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
                  :class="validationErrors.street?.[0] ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-gray-300'"
                >
                <p v-if="validationErrors.street?.[0]" class="mt-1 text-xs text-red-600">{{ validationErrors.street[0] }}</p>
              </div>
              <div>
                <input
                  v-model="form.ext_number"
                  type="text"
                  placeholder="Numero"
                  class="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
                  :class="validationErrors.ext_number?.[0] ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-gray-300'"
                >
                <p v-if="validationErrors.ext_number?.[0]" class="mt-1 text-xs text-red-600">{{ validationErrors.ext_number[0] }}</p>
              </div>
            </div>

            <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <input
                  v-model="form.neighborhood"
                  type="text"
                  placeholder="Colonia"
                  class="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
                  :class="validationErrors.neighborhood?.[0] ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-gray-300'"
                >
                <p v-if="validationErrors.neighborhood?.[0]" class="mt-1 text-xs text-red-600">{{ validationErrors.neighborhood[0] }}</p>
              </div>

              <div>
                <select
                  v-model="form.dwelling_type"
                  class="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
                  :class="validationErrors.dwelling_type?.[0] ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-gray-300'"
                >
                  <option v-for="option in dwellingOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
                <p v-if="validationErrors.dwelling_type?.[0]" class="mt-1 text-xs text-red-600">{{ validationErrors.dwelling_type[0] }}</p>
              </div>
            </div>

            <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <input
                  v-model="form.zip_code"
                  type="text"
                  inputmode="numeric"
                  maxlength="10"
                  placeholder="Codigo postal"
                  class="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
                  :class="validationErrors.zip_code?.[0] ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-gray-300'"
                >
                <p v-if="validationErrors.zip_code?.[0]" class="mt-1 text-xs text-red-600">{{ validationErrors.zip_code[0] }}</p>
              </div>

              <div>
                <select
                  v-model.number="form.state_id"
                  class="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
                  :class="validationErrors.state_id?.[0] ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-gray-300'"
                >
                  <option :value="0" disabled>
                    {{ loadingStates ? 'Cargando estado...' : 'Estado' }}
                  </option>
                  <option v-for="state in states" :key="state.id" :value="state.id">
                    {{ state.name }}
                  </option>
                </select>
                <p v-if="validationErrors.state_id?.[0]" class="mt-1 text-xs text-red-600">{{ validationErrors.state_id[0] }}</p>
              </div>

              <div>
                <select
                  v-model.number="form.city_id"
                  :disabled="form.state_id === 0 || loadingCities"
                  class="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition disabled:cursor-not-allowed disabled:bg-gray-100 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
                  :class="validationErrors.city_id?.[0] ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-gray-300'"
                >
                  <option :value="0" disabled>
                    {{ form.state_id === 0 ? 'Ciudad' : loadingCities ? 'Cargando ciudad...' : 'Ciudad' }}
                  </option>
                  <option v-for="city in cities" :key="city.id" :value="city.id">
                    {{ city.name }}
                  </option>
                </select>
                <p v-if="validationErrors.city_id?.[0]" class="mt-1 text-xs text-red-600">{{ validationErrors.city_id[0] }}</p>
              </div>
            </div>

            <div>
              <textarea
                v-model="form.references"
                rows="4"
                placeholder="Referencias y notas para el repartidor"
                class="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
              />
              <p class="mt-1 text-xs text-gray-400">
                Incluye el color de la fachada, el numero interior si es un lugar privado o indica entre que calles esta.
              </p>
              <p v-if="validationErrors.references?.[0]" class="mt-1 text-xs text-red-600">{{ validationErrors.references[0] }}</p>
            </div>

            <button
              type="submit"
              :disabled="isSubmitting"
              class="w-full rounded-full bg-yellow-400 px-4 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {{ isSubmitting ? 'Guardando...' : 'Continuar' }}
            </button>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
