<script setup lang="ts">
/**
 * ZipCodeValidator – Coverage zone validator for Megasorpresa Same-Day delivery.
 *
 * Allows users to enter their 5-digit Código Postal (CP) to verify whether their
 * neighbourhood is covered by same-day delivery before entering the checkout flow.
 * On successful validation the CP is persisted in the zipCode Pinia store so that
 * checkout can read it without re-asking the user.
 *
 * @prop {string[]} allowedZipCodes - Array of CPs covered by same-day delivery.
 *
 * The interactive Leaflet map is rendered client-side only (via <ClientOnly>) to
 * avoid SSR mismatches.  Coverage polygons are drawn for Cumbres, San Pedro
 * Garza García and Carretera Nacional.
 */
import type * as LeafletTypes from 'leaflet'
import { useZipCodeStore } from '~/stores/zipCode'

const props = withDefaults(
  defineProps<{
    allowedZipCodes?: string[]
  }>(),
  {
    allowedZipCodes: () => [
      // Cumbres (NW Monterrey)
      '64610', '64618', '64619', '64620', '64628', '64630',
      '64638', '64640', '64650', '64660', '64670', '64680', '64690',
      // San Pedro Garza García
      '66200', '66210', '66215', '66220', '66230', '66240',
      '66250', '66260', '66265', '66266', '66267', '66269', '66278', '66281',
      // Carretera Nacional
      '64860', '64988', '64989',
    ],
  },
)

const zipCodeStore = useZipCodeStore()

const zipInput = ref('')
const validationResult = ref<'covered' | 'not-covered' | null>(null)
const hasError = ref(false)

const ONLY_DIGITS = /^\d{0,5}$/

function onInput(e: Event) {
  const raw = (e.target as HTMLInputElement).value
  if (ONLY_DIGITS.test(raw)) {
    zipInput.value = raw
  } else {
    (e.target as HTMLInputElement).value = zipInput.value
  }
  if (validationResult.value !== null) {
    validationResult.value = null
  }
  hasError.value = false
}

function validate() {
  if (zipInput.value.length !== 5) {
    hasError.value = true
    return
  }
  hasError.value = false
  if (props.allowedZipCodes.includes(zipInput.value)) {
    validationResult.value = 'covered'
    zipCodeStore.setCoveredZip(zipInput.value)
  } else {
    validationResult.value = 'not-covered'
    zipCodeStore.setUncoveredZip(zipInput.value)
  }
}

function reset() {
  zipInput.value = ''
  validationResult.value = null
  hasError.value = false
  zipCodeStore.clearZipCode()
}

// ── Leaflet map ──────────────────────────────────────────────────────────────

/** Approximate GeoJSON polygons for each delivery zone around Monterrey. */
const coverageZones = [
  {
    name: 'Cumbres',
    color: '#F59E0B',
    // Approximate bounding polygon – Cumbres sector (NW Monterrey)
    coords: [
      [25.756, -100.420],
      [25.762, -100.373],
      [25.730, -100.360],
      [25.718, -100.390],
      [25.718, -100.420],
    ] as [number, number][],
  },
  {
    name: 'San Pedro Garza García',
    color: '#3B82F6',
    // Approximate bounding polygon – San Pedro (SW Monterrey)
    coords: [
      [25.668, -100.425],
      [25.668, -100.360],
      [25.630, -100.355],
      [25.620, -100.415],
    ] as [number, number][],
  },
  {
    name: 'Carretera Nacional',
    color: '#10B981',
    // Approximate bounding polygon – Carretera Nacional (SE Monterrey)
    coords: [
      [25.620, -100.270],
      [25.640, -100.195],
      [25.595, -100.180],
      [25.580, -100.250],
    ] as [number, number][],
  },
]

const mapContainerRef = ref<HTMLDivElement | null>(null)

onMounted(async () => {
  if (!mapContainerRef.value) return

  const L = (await import('leaflet')).default as typeof LeafletTypes

  const map = L.map(mapContainerRef.value, {
    center: [25.686, -100.316],
    zoom: 11,
    zoomControl: true,
    scrollWheelZoom: false,
  })

  // Silver/minimal tile layer (OpenStreetMap)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 18,
  }).addTo(map)

  for (const zone of coverageZones) {
    L.polygon(zone.coords, {
      color: zone.color,
      fillColor: zone.color,
      fillOpacity: 0.25,
      weight: 2,
    })
      .addTo(map)
      .bindTooltip(zone.name, { permanent: false, direction: 'center' })
  }
})
</script>

<template>
  <section class="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 px-4 py-20 md:px-8">
    <!-- Decorative blurred blobs -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-yellow-400/20 blur-3xl"
    />
    <div
      aria-hidden="true"
      class="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl"
    />

    <div class="relative mx-auto max-w-6xl">
      <!-- Section heading -->
      <div class="mb-10 text-center">
        <span class="inline-flex items-center gap-2 rounded-full bg-yellow-400/20 px-4 py-1.5 text-sm font-semibold text-yellow-300">
          🚀 Entrega Same-Day
        </span>
        <h2 class="mt-4 text-3xl font-extrabold tracking-tight text-white md:text-4xl">
          ¿Llegamos a tu zona?
        </h2>
        <p class="mt-3 text-base text-blue-200 md:text-lg">
          Ingresa tu Código Postal y descubre si puedes recibir tu regalo <strong class="text-yellow-300">hoy mismo</strong>.
        </p>
      </div>

      <!-- Main card (glassmorphism) -->
      <div class="mx-auto grid max-w-5xl gap-8 rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl md:grid-cols-2 md:p-10">
        <!-- Left: validator form -->
        <div class="flex flex-col justify-center">
          <label
            for="zip-input"
            class="mb-3 block text-sm font-semibold uppercase tracking-widest text-blue-200"
          >
            Tu Código Postal
          </label>

          <!-- Input row -->
          <div class="flex gap-3">
            <input
              id="zip-input"
              :value="zipInput"
              type="text"
              inputmode="numeric"
              maxlength="5"
              placeholder="Ej. 66220"
              class="w-full rounded-xl border bg-white/10 px-4 py-3 text-lg font-bold tracking-widest text-white placeholder-white/30 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50"
              :class="hasError ? 'border-red-400' : 'border-white/20'"
              aria-describedby="zip-feedback"
              @input="onInput"
              @keyup.enter="validate"
            />
            <button
              type="button"
              class="shrink-0 rounded-xl bg-yellow-400 px-5 py-3 font-bold text-gray-900 shadow-lg transition hover:bg-yellow-300 active:scale-95 disabled:opacity-50"
              :disabled="zipInput.length !== 5"
              @click="validate"
            >
              Validar
            </button>
          </div>

          <!-- Inline error -->
          <p
            v-if="hasError"
            id="zip-feedback"
            class="mt-2 text-sm text-red-300"
          >
            Por favor ingresa exactamente 5 dígitos.
          </p>

          <!-- Feedback messages (animated) -->
          <Transition
            enter-active-class="transition-all duration-400 ease-out"
            enter-from-class="opacity-0 translate-y-3"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-3"
          >
            <div
              v-if="validationResult === 'covered'"
              class="mt-5 flex items-start gap-3 rounded-2xl bg-emerald-500/20 p-4 text-emerald-200 ring-1 ring-emerald-400/40"
            >
              <span class="text-2xl leading-none">🎉</span>
              <div>
                <p class="font-bold">¡Felicidades, llegamos a tu zona!</p>
                <p class="mt-0.5 text-sm opacity-80">
                  CP <strong>{{ zipInput }}</strong> está cubierto. Puedes recibir tu pedido hoy mismo.
                </p>
              </div>
            </div>
          </Transition>

          <Transition
            enter-active-class="transition-all duration-400 ease-out"
            enter-from-class="opacity-0 translate-y-3"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-3"
          >
            <div
              v-if="validationResult === 'not-covered'"
              class="mt-5 flex items-start gap-3 rounded-2xl bg-orange-500/20 p-4 text-orange-200 ring-1 ring-orange-400/40"
            >
              <span class="text-2xl leading-none">📍</span>
              <div>
                <p class="font-bold">Próximamente en tu colonia</p>
                <p class="mt-0.5 text-sm opacity-80">
                  Aún no cubrimos el CP <strong>{{ zipInput }}</strong>, pero seguimos expandiéndonos.
                  ¡Regresa pronto!
                </p>
              </div>
            </div>
          </Transition>

          <!-- Reset link -->
          <Transition
            enter-active-class="transition-opacity duration-300"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
          >
            <button
              v-if="validationResult !== null"
              type="button"
              class="mt-4 self-start text-sm text-blue-300 underline transition hover:text-white"
              @click="reset"
            >
              Verificar otro CP
            </button>
          </Transition>

          <!-- Coverage zones legend -->
          <ul class="mt-8 space-y-2">
            <li class="flex items-center gap-2 text-sm text-blue-200">
              <span class="h-3 w-3 shrink-0 rounded-full bg-yellow-400" />
              Cumbres
            </li>
            <li class="flex items-center gap-2 text-sm text-blue-200">
              <span class="h-3 w-3 shrink-0 rounded-full bg-blue-400" />
              San Pedro Garza García
            </li>
            <li class="flex items-center gap-2 text-sm text-blue-200">
              <span class="h-3 w-3 shrink-0 rounded-full bg-emerald-400" />
              Carretera Nacional
            </li>
          </ul>
        </div>

        <!-- Right: interactive map -->
        <div class="relative overflow-hidden rounded-2xl">
          <ClientOnly>
            <div
              ref="mapContainerRef"
              class="h-72 w-full md:h-full"
              style="min-height: 300px;"
              aria-label="Mapa de zonas de cobertura en Monterrey"
            />
            <template #fallback>
              <div class="flex h-72 items-center justify-center rounded-2xl bg-white/5 md:h-full">
                <p class="text-sm text-blue-300">Cargando mapa…</p>
              </div>
            </template>
          </ClientOnly>
        </div>
      </div>
    </div>
  </section>
</template>
