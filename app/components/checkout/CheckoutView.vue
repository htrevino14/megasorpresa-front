<script setup lang="ts">
/**
 * CheckoutView – Contenedor principal del checkout en dos columnas.
 *
 * Columna izquierda (70%): wizard/acordeón secuencial con 5 pasos.
 * Columna derecha (30% sticky): resumen del carrito.
 *
 * El estado del wizard se maneja localmente; los pasos sólo se activan
 * uno a la vez y los anteriores quedan en modo "completado" colapsado.
 * Aún no se conecta al backend.
 */

const TOTAL_STEPS = 5

/** Paso actualmente expandido (1-5). */
const currentStep = ref(1)

/** Pasos marcados como completados. */
const completedSteps = ref<Set<number>>(new Set())

interface StepDescriptor {
  id: number
  title: string
  component: string
}

const steps: StepDescriptor[] = [
  { id: 1, title: 'Confirma tu teléfono', component: 'CheckoutStepPhone' },
  { id: 2, title: 'Elige a quién enviarlo', component: 'CheckoutStepRecipient' },
  { id: 3, title: 'Escoge un horario', component: 'CheckoutStepSchedule' },
  { id: 4, title: 'Agrega una dedicatoria', component: 'CheckoutStepDedication' },
  { id: 5, title: 'Completa el pago', component: 'CheckoutStepPayment' },
]

function goToStep(step: number) {
  // Sólo permitir ir a un paso si está completado o es el actual/siguiente disponible
  if (step <= currentStep.value || completedSteps.value.has(step - 1)) {
    currentStep.value = step
  }
}

function handleStepCompleted(step: number) {
  completedSteps.value.add(step)
  if (step < TOTAL_STEPS) {
    currentStep.value = step + 1
  }
}
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <h1 class="mb-8 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
      Proceso de compra
    </h1>

    <div class="grid grid-cols-1 gap-8 lg:grid-cols-10">
      <!-- ── Columna izquierda (70%) — Wizard ────────────────────────── -->
      <section class="space-y-4 lg:col-span-7" aria-label="Pasos del checkout">
        <div
          v-for="step in steps"
          :key="step.id"
          class="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100"
        >
          <!-- Header del paso (clicable cuando aplica) -->
          <button
            type="button"
            class="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            :disabled="step.id > currentStep && !completedSteps.has(step.id - 1)"
            @click="goToStep(step.id)"
          >
            <!-- Indicador numérico -->
            <span
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors"
              :class="[
                completedSteps.has(step.id)
                  ? 'border-green-500 bg-green-500 text-white'
                  : currentStep === step.id
                    ? 'border-yellow-400 bg-yellow-400 text-white'
                    : 'border-gray-300 bg-white text-gray-400',
              ]"
            >
              <svg
                v-if="completedSteps.has(step.id)"
                class="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
              </svg>
              <template v-else>{{ step.id }}</template>
            </span>

            <!-- Título -->
            <span
              class="flex-1 text-base font-semibold sm:text-lg"
              :class="currentStep === step.id || completedSteps.has(step.id) ? 'text-gray-900' : 'text-gray-400'"
            >
              {{ step.title }}
            </span>

            <!-- Chevron sólo cuando es accesible -->
            <svg
              v-if="currentStep === step.id"
              class="h-5 w-5 text-gray-400 transition-transform"
              :class="{ 'rotate-180': currentStep === step.id }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Body del paso -->
          <Transition name="step">
            <div v-if="currentStep === step.id" class="border-t border-gray-100 px-5 py-6">
              <component
                :is="step.component"
                @next="handleStepCompleted(step.id)"
              />
            </div>
          </Transition>
        </div>
      </section>

      <!-- ── Columna derecha (30%) — Resumen ─────────────────────────── -->
      <aside class="lg:col-span-3">
        <CheckoutOrderSummary />
      </aside>
    </div>
  </div>
</template>

<style scoped>
.step-enter-active,
.step-leave-active {
  transition: opacity 0.2s ease, max-height 0.3s ease;
  overflow: hidden;
}
.step-enter-from,
.step-leave-to {
  opacity: 0;
  max-height: 0;
}
.step-enter-to,
.step-leave-from {
  opacity: 1;
  max-height: 2000px;
}
</style>
