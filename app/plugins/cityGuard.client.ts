/**
 * City-selection navigation guard.
 *
 * Centralizes the "a city must be selected before browsing the catalog" rule so
 * that every entry point (banners, megamenu, category links, direct URLs) is
 * covered by a single `router.beforeEach` hook instead of per-page checks.
 *
 * Behaviour:
 *  - Navigation to any `/catalog` route is always ALLOWED (we never block it).
 *  - If no city is selected, it flips `showCityModal` on so the forced
 *    CitySelectionModal overlays and blocks the catalog until the user chooses.
 *  - Leaving the catalog (to a route that does not require a city) closes the
 *    modal so it never leaks onto other pages.
 *
 * Runs on the client only (the modal is client-only and the city lives in
 * localStorage). `dependsOn: ['location-restore']` guarantees this runs AFTER
 * the persisted city has been rehydrated, so refreshing on `/catalog` with a
 * previously chosen city does not wrongly trigger the modal.
 */
import { useLocationStore } from '~/stores/location'

export default defineNuxtPlugin({
  name: 'city-selection-guard',
  dependsOn: ['location-restore'],
  setup() {
    const router = useRouter()
    const location = useLocationStore()

    /** Routes that require a selected city before they are useful. */
    const requiresCity = (path: string): boolean => path.includes('/catalog')

    /** Show or hide the forced modal based on the target route + city state. */
    const evaluate = (path: string): void => {
      if (requiresCity(path) && !location.hasCitySelected()) {
        location.openCityModal()
      } else {
        location.closeCityModal()
      }
    }

    router.beforeEach((to) => {
      evaluate(to.path)
      // Always allow the navigation; the modal blocks the UI when needed.
      return true
    })

    // Cover the initial load / hard refresh on a catalog URL.
    evaluate(router.currentRoute.value.path)
  },
})
