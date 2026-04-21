<script setup lang="ts">
/**
 * ZipCodeMap – Client-side Leaflet map that shows same-day delivery coverage
 * zones around Monterrey.  Must be rendered inside a <ClientOnly> block so
 * that this component's onMounted fires only after the DOM element exists.
 *
 * Coverage polygons:
 *   - Cumbres (yellow)
 *   - San Pedro Garza García (blue)
 *   - Carretera Nacional (green)
 */
import type * as LeafletTypes from 'leaflet'

/** Approximate bounding polygons for each delivery zone around Monterrey. */
const coverageZones: Array<{
  name: string
  color: string
  coords: [number, number][]
}> = [
  {
    name: 'Cumbres',
    color: '#F59E0B',
    coords: [
      [25.756, -100.420],
      [25.762, -100.373],
      [25.730, -100.360],
      [25.718, -100.390],
      [25.718, -100.420],
    ],
  },
  {
    name: 'San Pedro Garza García',
    color: '#3B82F6',
    coords: [
      [25.668, -100.425],
      [25.668, -100.360],
      [25.630, -100.355],
      [25.620, -100.415],
    ],
  },
  {
    name: 'Carretera Nacional',
    color: '#10B981',
    coords: [
      [25.620, -100.270],
      [25.640, -100.195],
      [25.595, -100.180],
      [25.580, -100.250],
    ],
  },
]

const mapContainerRef = ref<HTMLDivElement | null>(null)

onMounted(async () => {
  // mapContainerRef.value is guaranteed to be available here because
  // this component is only mounted inside <ClientOnly>.
  if (!mapContainerRef.value) return

  const L = (await import('leaflet')).default as typeof LeafletTypes

  const map = L.map(mapContainerRef.value, {
    center: [25.686, -100.316],
    zoom: 11,
    zoomControl: true,
    scrollWheelZoom: false,
  })

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
  <div
    ref="mapContainerRef"
    class="h-full w-full"
    style="min-height: 300px;"
    aria-label="Mapa de zonas de cobertura en Monterrey"
  />
</template>
