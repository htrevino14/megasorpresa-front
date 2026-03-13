<script setup lang="ts">
/**
 * index – Home page (Landing Page) for Megasorpresa.
 *
 * Orchestrates all landing page components:
 *   TheHeader → HeroSection → CategoryCarousel → AgeSelector → TheFooter
 *
 * Uses the "landing" layout which renders without the default site header/footer.
 */
definePageMeta({ layout: 'landing' })
</script>

<template>
  <div class="flex min-h-screen flex-col bg-white">
    <LandingTheHeader />

    <main class="flex-1">
      <LandingHeroSection />
      <LandingCategoryCarousel />
      <LandingAgeSelector />
    </main>

    <LandingTheFooter />
  </div>
</template>
