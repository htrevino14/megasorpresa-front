<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <ClientOnly>
    <AuthModal />
    <CitySelectionModal />
  </ClientOnly>
</template>