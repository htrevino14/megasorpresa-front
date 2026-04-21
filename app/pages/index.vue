<script setup lang="ts">
/**
 * index – Home page (Landing Page) for Megasorpresa.
 *
 * Orchestrates all landing page components:
 *   TheHeader → HeroSection → ExperienciaTotal → CategoryCarousel → AgeSelector → ZipCodeValidator → TheFooter
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
      <LandingExperienciaTotal />
      <LandingCategoryCarousel />
      <LandingAgeSelector />
      <HomeZipCodeValidator />
    </main>

    <LandingTheFooter />
  </div>
</template>
