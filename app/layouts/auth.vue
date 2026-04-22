<script setup lang="ts">
/**
 * Auth layout – minimal centered layout for login and register pages.
 * No main navbar or footer; only the brand logo and the page slot.
 *
 * @emits none
 */
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gray-50">
    <!-- Minimal brand header -->
    <header class="bg-white shadow-sm">
      <div class="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <NuxtLink to="/" class="inline-flex items-center gap-2">
          <span class="text-2xl font-bold text-yellow-500">🎁</span>
          <span class="text-xl font-bold text-gray-800">Megasorpresa</span>
        </NuxtLink>
      </div>
    </header>

    <!-- Page content -->
    <main class="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <slot />
    </main>

    <!-- Minimal footer -->
    <footer class="py-4 text-center text-xs text-gray-400">
      © {{ new Date().getFullYear() }} Megasorpresa. Todos los derechos reservados.
    </footer>
  </div>
</template>
