# Arquitectura Base – Megasorpresa Web Frontend

> Documento de referencia para el equipo de desarrollo y para GitHub Copilot.
> Describe el stack tecnológico, la estructura de directorios, los estándares
> de código y los patrones que deben seguirse en todo el proyecto.

---

## 1. Contexto del Proyecto

**Megasorpresa** es una plataforma de ecommerce de juguetes para el mercado mexicano.
Este repositorio alberga el **Frontend Web** y actúa como espejo funcional del backend
`megasorpresa-back` (desarrollado en Laravel).

---

## 2. Stack Tecnológico

| Herramienta       | Tecnología                 | Notas                                           |
|-------------------|----------------------------|-------------------------------------------------|
| Framework         | Nuxt.js 4 (Vue.js 3)       | Composition API, `<script setup>` estricto      |
| Build Tool        | Vite (integrado en Nuxt)   | Hot Module Replacement en desarrollo            |
| State Management  | Pinia (`@pinia/nuxt`)      | Reemplazo de Vuex; stores tipados con TS        |
| Routing           | Nuxt File Router           | Rutas dinámicas; guards vía Nuxt Middleware     |
| Estilos           | Tailwind CSS 3             | Utility-first; clases reutilizables en `main.css` |
| HTTP Client       | Axios                      | Instancia centralizada en `app/api/index.ts`   |
| CMS / Contenido   | Nuxt Content v3            | Páginas estáticas y blog en Markdown            |
| Lenguaje          | TypeScript (strict)        | Interfaces en `types/index.ts`                 |

---

## 3. Estructura de Directorios

```
megasorpresa-front/
├── app/
│   ├── api/            # Instancia Axios + llamadas a endpoints del backend
│   ├── assets/
│   │   └── styles/     # main.css – estilos globales Tailwind
│   ├── components/     # Componentes reutilizables (Atoms, Molecules, Organisms)
│   ├── composables/    # Lógica de negocio extraíble y hooks personalizados
│   ├── layouts/        # Plantillas de página (default, auth, checkout)
│   ├── middleware/     # Guards de ruta (ej. auth.ts)
│   ├── pages/          # Rutas file-based de Nuxt
│   ├── plugins/        # Plugins Nuxt (ej. axios.ts para baseURL)
│   ├── stores/         # Estados de Pinia (auth, cart, products…)
│   └── utils/          # Funciones de ayuda (formatPrice, formatDate…)
├── content/            # Páginas en Markdown (Nuxt Content)
├── public/             # Archivos estáticos (favicon, robots.txt…)
├── types/
│   └── index.ts        # Interfaces TypeScript alineadas con modelos del backend
├── nuxt.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## 4. Estándares de Código

### Nomenclatura

| Artefacto                    | Convención       | Ejemplo                        |
|------------------------------|------------------|--------------------------------|
| Componentes Vue              | `PascalCase`     | `ProductCard.vue`              |
| Archivos de utilidad/store   | `camelCase`      | `auth.ts`, `formatPrice.ts`    |
| Páginas y layouts            | `kebab-case`     | `product-detail.vue`           |
| Variables y funciones        | `camelCase`      | `const cartTotal = …`          |
| Constantes globales          | `UPPER_SNAKE`    | `const MAX_CART_ITEMS = 20`    |

### TypeScript

- **Tipado estricto**: Todo componente debe declarar tipos explícitos en sus `props` y `emits`.
- **Interfaces**: Definidas en `types/index.ts`; deben coincidir con los modelos Laravel del backend.
- **No usar `any`**: Preferir `unknown` cuando el tipo no se puede determinar.

### Componentes

Cada componente debe incluir un bloque JSDoc describiendo su propósito, props y emits:

```vue
<script setup lang="ts">
/**
 * ProductCard – Muestra la información resumida de un producto.
 *
 * @prop {Product} product - Objeto producto a mostrar.
 * @emits add-to-cart - Se emite cuando el usuario pulsa "Agregar al carrito".
 */
import type { Product } from '@@/types/index'

const props = defineProps<{ product: Product }>()
const emit = defineEmits<{ 'add-to-cart': [product: Product] }>()
</script>
```

### Patrón de API

- **Todas** las llamadas HTTP deben realizarse a través de la instancia de Axios en `~/api/index.ts`.
- Cada dominio del negocio puede tener su propio módulo de API:
  ```
  app/api/
  ├── index.ts        # Instancia base con interceptores
  ├── products.ts     # queryProducts(), getProduct(slug)
  ├── orders.ts       # createOrder(), getOrders()
  └── auth.ts         # login(), logout(), me()
  ```
- El manejo de errores centralizado y la renovación de tokens ocurren en los interceptores.

---

## 5. Patrones de Diseño

### Layouts

| Layout      | Uso                                          |
|-------------|----------------------------------------------|
| `default`   | Todas las páginas públicas (Navbar + Footer)  |
| `auth`      | Páginas de login / registro (sin nav)        |
| `checkout`  | Flujo de compra (navegación simplificada)    |

Para aplicar un layout en una página:

```vue
<script setup lang="ts">
definePageMeta({ layout: 'auth' })
</script>
```

### Middleware de Autenticación

```vue
<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
</script>
```

### Stores Pinia

```ts
// app/stores/cart.ts
export const useCartStore = defineStore('cart', {
  state: (): Cart => ({ items: [], total: 0, item_count: 0 }),
  actions: {
    addItem(product: Product, quantity = 1) { … },
    removeItem(productId: number) { … },
  },
})
```

---

## 6. Variables de Entorno

| Variable                     | Descripción                          | Default                       |
|------------------------------|--------------------------------------|-------------------------------|
| `NUXT_PUBLIC_API_BASE_URL`   | URL base de la API de megasorpresa-back | `http://localhost:8000/api` |

Crea un archivo `.env` en la raíz del proyecto para desarrollo local:

```dotenv
NUXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

---

## 7. Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo (http://localhost:3000)
npm run dev

# Build de producción
npm run build

# Previsualizar build de producción
npm run preview

# Generar sitio estático
npm run generate
```

---

## 8. Definición de Hecho (DoD)

- [ ] El proyecto compila sin errores de TypeScript (`nuxt typecheck`).
- [ ] Todos los componentes nuevos siguen el estándar JSDoc.
- [ ] Las interfaces TypeScript están alineadas con los modelos del backend.
- [ ] Las llamadas a la API pasan por `~/api/`.
- [ ] Existe cobertura de prueba unitaria para composables y stores críticos.
- [ ] El código pasa el linter (`eslint`) sin errores.
