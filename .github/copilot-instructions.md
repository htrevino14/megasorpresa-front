# Instrucciones Personalizadas para GitHub Copilot – Megasorpresa Web

## Contexto del Proyecto

Estás trabajando en el **frontend web de Megasorpresa**, una tienda de ecommerce de
juguetes para el mercado mexicano. El backend es `megasorpresa-back` (Laravel API REST).

## Stack Tecnológico

- **Framework**: Nuxt.js 4 con Vue.js 3 (Composition API, `<script setup>` siempre)
- **State Management**: Pinia – usa `defineStore` y tipado TypeScript
- **Estilos**: Tailwind CSS 3 – clases utility-first; clases reutilizables en `app/assets/styles/main.css`
- **HTTP**: Axios – usa siempre la instancia de `~/api/index.ts`, nunca `fetch` directamente
- **Lenguaje**: TypeScript estricto – no uses `any`

## Reglas de Generación de Código

### 1. Estructura de Componentes

Siempre genera componentes Vue con este formato:

```vue
<script setup lang="ts">
/**
 * NombreComponente – Descripción breve del propósito.
 *
 * @prop {Tipo} nombre - Descripción de la prop.
 * @emits nombre-evento - Descripción de cuándo se emite.
 */
import type { TipoRelevante } from '@@/types/index'

const props = defineProps<{ /* props tipadas */ }>()
const emit = defineEmits<{ /* emits tipados */ }>()
</script>

<template>
  <!-- Usa clases de Tailwind CSS -->
</template>
```

### 2. Nomenclatura

- Componentes: `PascalCase` → `ProductCard.vue`, `NavBar.vue`
- Páginas y layouts: `kebab-case` → `product-detail.vue`
- Stores, utils, composables: `camelCase` → `useCartStore`, `formatPrice`

### 3. Llamadas a la API

Centraliza TODAS las llamadas HTTP en `app/api/`:

```ts
// app/api/products.ts
import api from '~/api/index'
import type { Product, PaginatedResponse } from '@@/types/index'

export const getProducts = () => api.get<PaginatedResponse<Product>>('/products')
export const getProduct = (slug: string) => api.get<Product>(`/products/${slug}`)
```

### 4. Stores Pinia

```ts
// app/stores/example.ts
import { defineStore } from 'pinia'
import type { TipoRelevante } from '@@/types/index'

export const useExampleStore = defineStore('example', {
  state: (): { items: TipoRelevante[] } => ({ items: [] }),
  getters: { /* getters tipados */ },
  actions: { /* actions async con try/catch */ },
})
```

### 5. Middleware de Autenticación

Para proteger páginas que requieren login:

```vue
<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
</script>
```

### 6. Interfaces TypeScript

Todos los tipos se definen en `types/index.ts` y deben coincidir con los modelos Laravel:

- `Product` → tabla `products`
- `Order` → tabla `orders`
- `User` → tabla `users`
- `Category` → tabla `categories`
- `Cart`, `CartItem`, `Address`, `OrderItem`

### 7. Layouts

- `default` → páginas públicas con Navbar y Footer
- `auth` → login/registro (sin navegación principal)
- `checkout` → flujo de compra

```vue
<script setup lang="ts">
definePageMeta({ layout: 'auth' })
</script>
```

## Convenciones de UX / Estilos

- Colores principales: `yellow-400` (acento), `gray-800` (texto oscuro), `gray-50` (fondo)
- Botones primarios: clase `btn-primary` (definida en `main.css`)
- Tarjetas: clase `card` (definida en `main.css`)
- Responsivo: diseña siempre mobile-first con breakpoints `sm:`, `md:`, `lg:`

## Lo que debes evitar

- ❌ No uses `fetch` directamente – usa la instancia Axios
- ❌ No uses `any` en TypeScript
- ❌ No crees estilos inline en plantillas (usa Tailwind)
- ❌ No accedas a `localStorage` directamente fuera de stores/plugins (SSR safety)
- ❌ No importes tipos desde otros archivos que no sean `types/index.ts`
