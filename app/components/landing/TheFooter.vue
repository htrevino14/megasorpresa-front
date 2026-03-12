<script setup lang="ts">
/**
 * TheFooter – Detailed footer with newsletter subscription, social links,
 * customer-info columns, payment methods, region switcher, and legal links.
 *
 * @emits none
 */

interface SocialLink {
  name: string
  href: string
  initial: string
}

interface FooterLink {
  label: string
  href: string
}

const newsletterEmail = ref('')
const newsletterCategories = ref<string[]>([])

const socialLinks: SocialLink[] = [
  { name: 'Facebook', href: 'https://facebook.com', initial: 'f' },
  { name: 'Instagram', href: 'https://instagram.com', initial: 'in' },
  { name: 'YouTube', href: 'https://youtube.com', initial: '▶' },
  { name: 'TikTok', href: 'https://tiktok.com', initial: 'tt' },
  { name: 'X', href: 'https://x.com', initial: '𝕏' },
  { name: 'Snapchat', href: 'https://snapchat.com', initial: '👻' },
]

const customerInfoLinks: FooterLink[] = [
  { label: 'Solicitar catálogo', href: '/catalogue' },
  { label: 'Tarjetas de regalo', href: '/gift-cards' },
  { label: 'Acerca de nosotros', href: '/about' },
  { label: 'Eventos en tienda', href: '/events' },
  { label: 'Socios benéficos', href: '/charity' },
  { label: 'Trabaja con nosotros', href: '/careers' },
]

const helpLinks: FooterLink[] = [
  { label: 'Centro de ayuda', href: '/help' },
  { label: 'Devoluciones', href: '/returns' },
  { label: 'Envíos y entregas', href: '/shipping' },
]

const paymentMethods: string[] = ['Visa', 'Mastercard', 'Google Pay', 'Apple Pay', 'Amex', 'PayPal', 'Klarna']

const regionFlags: string[] = ['🇲🇽', '🇺🇸', '🇬🇧', '🇩🇪', '🇫🇷', '🇪🇸']

const legalLinks: FooterLink[] = [
  { label: 'Preferencias de cookies', href: '/cookies' },
  { label: 'Política de cookies', href: '/cookie-policy' },
  { label: 'Política de privacidad', href: '/privacy' },
  { label: 'Términos y políticas', href: '/terms' },
  { label: 'Accesibilidad', href: '/accessibility' },
]

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

  // Placeholder: connect to the Laravel newsletter API endpoint
  newsletterEmail.value = ''
  newsletterCategories.value = []
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
            <label class="flex cursor-pointer items-center gap-2">
              <input v-model="newsletterCategories" type="checkbox" value="juguetes" class="rounded" />
              Juguetes
            </label>
            <label class="flex cursor-pointer items-center gap-2">
              <input v-model="newsletterCategories" type="checkbox" value="bebes" class="rounded" />
              Bebés
            </label>
            <label class="flex cursor-pointer items-center gap-2">
              <input v-model="newsletterCategories" type="checkbox" value="gaming" class="rounded" />
              Gaming
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
              :key="social.name"
              :href="social.href"
              :aria-label="social.name"
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
        <!-- Customer Information -->
        <div>
          <h4 class="text-base font-semibold">Información al cliente</h4>
          <ul class="mt-4 space-y-2 text-sm text-blue-100">
            <li v-for="link in customerInfoLinks" :key="link.href">
              <NuxtLink :to="link.href" class="transition-colors hover:text-white">
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Help & FAQ -->
        <div>
          <h4 class="text-base font-semibold">Ayuda y FAQ</h4>
          <ul class="mt-4 space-y-2 text-sm text-blue-100">
            <li v-for="link in helpLinks" :key="link.href">
              <NuxtLink :to="link.href" class="transition-colors hover:text-white">
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Payment Methods -->
        <div>
          <h4 class="text-base font-semibold">Nuestros métodos de pago</h4>
          <div class="mt-4 flex flex-wrap gap-2">
            <span
              v-for="method in paymentMethods"
              :key="method"
              class="rounded bg-white px-2.5 py-1 text-xs font-semibold text-gray-800"
            >
              {{ method }}
            </span>
          </div>
        </div>

        <!-- Switch Region -->
        <div>
          <h4 class="text-base font-semibold">Cambiar región</h4>
          <div class="mt-4 flex flex-wrap gap-2">
            <button
              v-for="flag in regionFlags"
              :key="flag"
              class="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-lg transition-colors hover:bg-white/25"
            >
              {{ flag }}
            </button>
          </div>
        </div>
      </div>

      <hr class="my-8 border-white/30" />

      <!-- ── Legal + copyright ──────────────────────────────────────────── -->
      <div class="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div class="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-blue-200">
          <NuxtLink
            v-for="link in legalLinks"
            :key="link.href"
            :to="link.href"
            class="transition-colors hover:text-white"
          >
            {{ link.label }}
          </NuxtLink>
        </div>
        <p class="text-xs text-blue-200">
          © {{ new Date().getFullYear() }} Megasorpresa. Todos los derechos reservados.
        </p>
      </div>
    </div>
  </footer>
</template>
