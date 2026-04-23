<script setup lang="ts">
/**
 * Test page for WrapperSelector component
 */
const selectedWrapping = ref<number | null>(null)
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="mx-auto max-w-4xl px-4">
      <h1 class="mb-8 text-center text-3xl font-bold text-gray-900">
        Selector de Envoltura - Demo
      </h1>

      <WrapperSelector v-model="selectedWrapping" />

      <div v-if="selectedWrapping" class="mt-8 text-center">
        <p class="text-lg text-gray-700">
          Envoltura seleccionada: <strong>ID {{ selectedWrapping }}</strong>
        </p>
      </div>
    </div>
  </div>
</template>
