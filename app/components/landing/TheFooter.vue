<script setup lang="ts">
/**
 * TheFooter – Detailed footer with newsletter subscription, social links,
 * customer-info columns, payment methods, region switcher, and legal links.
 * Data is fetched from GET /api/landing/footer and /api/landing/newsletter-categories.
 *
 * @emits none
 */
import { getFooter, getNewsletterCategories } from '~/api/landing'
import type { FooterData, NewsletterCategory } from '@@/types/index'

const { data: footerData } = await useAsyncData<FooterData>(
  'footer',
  () => getFooter().then(r => r.data.data),
)

const { data: newsletterCatsData } = await useAsyncData<NewsletterCategory[]>(
  'newsletter-categories',
  () => getNewsletterCategories().then(r => r.data.data),
)

const footerSections = computed(() => footerData.value?.sections ?? [])
const socialLinks = computed(() => footerData.value?.social_links ?? [])
const paymentMethods = computed(() => footerData.value?.payment_methods ?? [])
const newsletterCategories = computed<NewsletterCategory[]>(() => newsletterCatsData.value ?? [])

const newsletterEmail = ref('')
const selectedNewsletterSlugs = ref<string[]>([])
const newsletterError = ref('')

function submitNewsletter() {
  newsletterError.value = ''

  if (!newsletterEmail.value.trim()) {
    newsletterError.value = 'Por favor ingresa tu correo electrónico.'
    return
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailPattern.test(newsletterEmail.value)) {
    newsletterError.value = 'Por favor ingresa un correo electrónico válido.'
    return
  }

  // TODO: connect to the Laravel newsletter subscription endpoint once auth is available
  newsletterEmail.value = ''
  selectedNewsletterSlugs.value = []
}
</script>

<template>
  <footer class="bg-gradient-to-b from-[#0072E3] to-[#005bb5] text-white">
    <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <!-- ── Newsletter + Social ────────────────────────────────────────── -->
      <div class="grid grid-cols-1 gap-10 md:grid-cols-2">
        <!-- Newsletter form -->
        <div>
          <h3 class="text-xl font-semibold">Recibe nuestro boletín de correo</h3>
          <input
            v-model="newsletterEmail"
            type="email"
            placeholder="Tu correo electrónico"
            class="mt-4 w-full rounded-lg bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-300"
          />
          <div class="mt-3 flex flex-wrap gap-5 text-sm">
            <label
              v-for="cat in newsletterCategories"
              :key="cat.slug"
              class="flex cursor-pointer items-center gap-2"
            >
              <input
                v-model="selectedNewsletterSlugs"
                type="checkbox"
                :value="cat.slug"
                class="rounded"
              />
              {{ cat.label }}
            </label>
          </div>
          <p v-if="newsletterError" class="mt-2 text-xs text-yellow-300">
            {{ newsletterError }}
          </p>
          <p class="mt-3 text-xs leading-relaxed text-blue-200">
            Usaremos los datos ingresados para enviarte comunicaciones por correo. Procesaremos tus
            datos según nuestra Política de Privacidad. Debes tener 18 años o más.
          </p>
          <button
            class="mt-5 rounded-full border-2 border-white bg-transparent px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-[#0072E3]"
            @click="submitNewsletter"
          >
            Suscribirme
          </button>
        </div>

        <!-- Social links -->
        <div class="md:text-right">
          <h3 class="text-xl font-semibold">Encuéntranos en</h3>
          <div class="mt-4 flex flex-wrap gap-3 md:justify-end">
            <a
              v-for="social in socialLinks"
              :key="social.id"
              :href="social.url"
              :aria-label="social.platform"
              target="_blank"
              rel="noopener noreferrer"
              class="flex h-10 w-10 items-center justify-center rounded-full border border-white/50 text-sm font-bold text-white transition-colors hover:bg-white hover:text-[#0072E3]"
            >
              {{ social.initial }}
            </a>
          </div>
        </div>
      </div>

      <hr class="my-10 border-white/30" />

      <!-- ── Info columns ───────────────────────────────────────────────── -->
      <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="section in footerSections" :key="section.id">
          <h4 class="text-base font-semibold">{{ section.title }}</h4>
          <ul class="mt-4 space-y-2 text-sm text-blue-100">
            <li v-for="link in section.links" :key="link.id">
              <a
                :href="link.url"
                :target="link.open_in_new_tab ? '_blank' : undefined"
                :rel="link.open_in_new_tab ? 'noopener noreferrer' : undefined"
                class="transition-colors hover:text-white"
              >
                {{ link.label }}
              </a>
            </li>
          </ul>
        </div>

        <!-- Payment Methods -->
        <div>
          <h4 class="text-base font-semibold">Nuestros métodos de pago</h4>
          <div class="mt-4 flex flex-wrap gap-2">
            <span
              v-for="method in paymentMethods"
              :key="method.id"
              class="rounded bg-white px-2.5 py-1 text-xs font-semibold text-gray-800"
            >
              {{ method.name }}
            </span>
          </div>
        </div>
      </div>

      <hr class="my-8 border-white/30" />

      <!-- ── Copyright ──────────────────────────────────────────────────── -->
      <div class="flex flex-col items-center justify-center gap-4">
        <p class="text-xs text-blue-200">
          © {{ new Date().getFullYear() }} Megasorpresa. Todos los derechos reservados.
        </p>
      </div>
    </div>
  </footer>
</template>
