/**
 * Location restoration plugin.
 *
 * Rehydrates the selected city from localStorage on client-side startup so the
 * mandatory city selection survives full page reloads without causing SSR
 * hydration mismatches (state is only read on the client).
 */
import { useLocationStore } from '~/stores/location'

export default defineNuxtPlugin({
  name: 'location-restore',
  setup() {
    const location = useLocationStore()
    location.restoreLocation()
  },
})
