<script setup lang="ts">
/**
 * Debug page for diagnosing cart session issues.
 * Displays cookie information and allows testing cart operations.
 */
import { useCartStore } from '~/stores/cart'
import { initCsrfToken } from '~/api/index'

const cart = useCartStore()
const logs = ref<string[]>([])
const cookies = ref<string>('')
const isLoading = ref(false)

const addLog = (message: string) => {
  const timestamp = new Date().toLocaleTimeString()
  logs.value.push(`[${timestamp}] ${message}`)
}

const updateCookies = () => {
  if (import.meta.client) {
    cookies.value = document.cookie || 'No cookies found'
  }
}

const testInitCsrf = async () => {
  isLoading.value = true
  addLog('Testing CSRF initialization...')
  try {
    await initCsrfToken()
    updateCookies()
    addLog('✅ CSRF initialization completed')
  } catch (error: any) {
    addLog(`❌ CSRF initialization failed: ${error.message}`)
  } finally {
    isLoading.value = false
  }
}

const testFetchCart = async () => {
  isLoading.value = true
  addLog('Testing fetch cart...')
  try {
    await cart.fetchCart()
    updateCookies()
    addLog(`✅ Fetch cart completed - Cart ID: ${(cart as any).$state.id || 'unknown'}, Items: ${cart.total_items}`)
  } catch (error: any) {
    addLog(`❌ Fetch cart failed: ${error.message}`)
  } finally {
    isLoading.value = false
  }
}

const testAddToCart = async () => {
  isLoading.value = true
  addLog('Testing add to cart (product ID: 1)...')
  const cookiesBefore = document.cookie
  try {
    await cart.addItem(1, 1)
    const cookiesAfter = document.cookie
    updateCookies()
    addLog(`✅ Add to cart completed - Cart Items: ${cart.total_items}`)

    if (cookiesBefore !== cookiesAfter) {
      addLog('⚠️ WARNING: Cookies changed after add to cart!')
      addLog(`   Before: ${cookiesBefore.substring(0, 100)}...`)
      addLog(`   After:  ${cookiesAfter.substring(0, 100)}...`)
    } else {
      addLog('✅ Cookies remained consistent')
    }
  } catch (error: any) {
    addLog(`❌ Add to cart failed: ${error.message}`)
  } finally {
    isLoading.value = false
  }
}

const clearLogs = () => {
  logs.value = []
}

onMounted(() => {
  updateCookies()
  addLog('Debug page loaded')
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <h1 class="text-3xl font-bold mb-6">Cart Session Debug Tool</h1>

    <div class="card mb-6">
      <h2 class="text-xl font-semibold mb-4">Current Cookies</h2>
      <div class="bg-gray-100 p-4 rounded font-mono text-sm break-all">
        {{ cookies }}
      </div>
      <button
        @click="updateCookies"
        class="btn-secondary mt-4"
      >
        Refresh Cookies
      </button>
    </div>

    <div class="card mb-6">
      <h2 class="text-xl font-semibold mb-4">Cookie Analysis</h2>
      <div class="space-y-2">
        <div>
          <strong>XSRF-TOKEN:</strong>
          <span
            :class="cookies.includes('XSRF-TOKEN=') ? 'text-green-600' : 'text-red-600'"
          >
            {{ cookies.includes('XSRF-TOKEN=') ? '✅ Present' : '❌ Missing' }}
          </span>
        </div>
        <div>
          <strong>Session Cookie:</strong>
          <span
            :class="cookies.includes('_session=') ? 'text-green-600' : 'text-red-600'"
          >
            {{ cookies.includes('_session=') ? '✅ Present' : '❌ Missing' }}
          </span>
        </div>
      </div>
    </div>

    <div class="card mb-6">
      <h2 class="text-xl font-semibold mb-4">Test Actions</h2>
      <div class="space-y-3">
        <button
          @click="testInitCsrf"
          :disabled="isLoading"
          class="btn-primary w-full"
        >
          1. Initialize CSRF Token
        </button>
        <button
          @click="testFetchCart"
          :disabled="isLoading"
          class="btn-primary w-full"
        >
          2. Fetch Cart
        </button>
        <button
          @click="testAddToCart"
          :disabled="isLoading"
          class="btn-primary w-full"
        >
          3. Add Product to Cart (ID: 1)
        </button>
      </div>
    </div>

    <div class="card mb-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">Activity Log</h2>
        <button
          @click="clearLogs"
          class="btn-secondary text-sm"
        >
          Clear Logs
        </button>
      </div>
      <div class="bg-gray-100 p-4 rounded max-h-96 overflow-y-auto">
        <div
          v-if="logs.length === 0"
          class="text-gray-500 italic"
        >
          No logs yet. Click a test button above to start.
        </div>
        <div
          v-for="(log, index) in logs"
          :key="index"
          class="font-mono text-sm mb-1"
          :class="{
            'text-green-600': log.includes('✅'),
            'text-red-600': log.includes('❌'),
            'text-yellow-600': log.includes('⚠️'),
          }"
        >
          {{ log }}
        </div>
      </div>
    </div>

    <div class="card">
      <h2 class="text-xl font-semibold mb-4">Instructions</h2>
      <ol class="list-decimal list-inside space-y-2 text-gray-700">
        <li>Open browser DevTools (F12) and go to the Console tab</li>
        <li>Clear all cookies: DevTools → Application → Cookies → Delete all</li>
        <li>Click "Refresh Cookies" above to verify cookies are cleared</li>
        <li>Click buttons 1-3 in order and observe the logs</li>
        <li>Check if cookies remain the same after step 3</li>
        <li>Watch the Console for detailed Axios request/response logs</li>
        <li>Compare cookie values before and after each operation</li>
      </ol>
    </div>
  </div>
</template>
