<script setup lang="ts">
/**
 * CheckoutOrderSummary – Resumen sticky del pedido (columna derecha).
 *
 * Consume el `cartStore` para mostrar productos, subtotal y total.
 * El envío se calcula al ingresar la dirección (lógica posterior).
 */
import { formatPrice } from '~/utils/index'

const cart = useCartStore()

// Hidratar/refrescar el carrito al montar la vista de checkout.
onMounted(() => {
  cart.refreshCart()
})
</script>

<template>
  <div class="sticky top-28 space-y-4">
    <!-- Totales -->
    <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
      <h2 class="mb-4 text-lg font-bold text-gray-900">Resumen del pedido</h2>

      <div class="space-y-3 border-b border-gray-100 pb-4">
        <div class="flex items-center justify-between text-sm text-gray-600">
          <span>Subtotal</span>
          <span class="font-semibold text-gray-900">{{ formatPrice(cart.cartSubtotal) }}</span>
        </div>
        <div class="flex items-center justify-between text-sm text-gray-600">
          <span>Envío</span>
          <span class="text-xs italic text-gray-400">Al ingresar la dirección</span>
        </div>
      </div>

      <div class="flex items-center justify-between pt-4">
        <span class="text-base font-bold text-gray-900">Total</span>
        <span class="text-xl font-bold text-gray-900">{{ formatPrice(cart.cartTotal) }}</span>
      </div>
    </div>

    <!-- Productos -->
    <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="text-base font-bold text-gray-900">Tus productos</h3>
        <NuxtLink
          to="/cart"
          class="text-xs font-semibold text-yellow-600 hover:text-yellow-700 hover:underline"
        >
          Ir al carrito
        </NuxtLink>
      </div>

      <!-- Lista de productos -->
      <ul v-if="cart.hasItems" class="space-y-4">
        <li
          v-for="item in cart.cartItems"
          :key="item.id"
          class="flex gap-3"
        >
          <img
            :src="item.product.primary_image ?? '/images/placeholder-toy.png'"
            :alt="item.product.name"
            class="h-16 w-16 shrink-0 rounded-lg object-cover ring-1 ring-gray-100"
            loading="lazy"
          />
          <div class="flex flex-1 flex-col justify-between">
            <div>
              <p class="line-clamp-2 text-sm font-semibold text-gray-900">
                {{ item.product.name }}
              </p>
              <p class="mt-0.5 text-xs text-gray-500">
                Cantidad: {{ item.quantity }}
              </p>
              <p class="text-xs text-gray-400">
                SKU: {{ item.product.sku }}
              </p>
            </div>
          </div>
          <p class="shrink-0 text-sm font-bold text-gray-900">
            {{ formatPrice(item.subtotal) }}
          </p>
        </li>
      </ul>

      <!-- Estado vacío -->
      <p v-else class="py-6 text-center text-sm text-gray-400">
        No hay productos en tu carrito.
      </p>
    </div>
  </div>
</template>
