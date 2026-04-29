# Cart Session Persistence Fix

## Problem Description

The frontend was generating multiple cart records in the database every time a user navigated to pages like `/catalog`, causing confusion and data duplication. The browser's session cookie remained constant, but the backend was creating new cart entries.

## Root Causes

This issue had **two distinct causes** that were both addressed:

### Cause 1: CSRF Token Module-Level Variable

The issue was in `app/api/index.ts` where the CSRF token initialization used a **module-level variable** (`csrfInitialized`) to track whether the CSRF endpoint had been called:

```typescript
// OLD IMPLEMENTATION (PROBLEMATIC)
let csrfInitialized = false  // ❌ Module-level variable resets on navigation/reload

export async function initCsrfToken(): Promise<void> {
  if (!import.meta.client) return
  if (csrfInitialized) return  // ❌ This flag resets, causing repeated calls

  await axios.get(`${baseURL}/sanctum/csrf-cookie`, { withCredentials: true })
  csrfInitialized = true
}
```

**Why This Caused Issues:**
1. **Module-level variables reset** on page navigation or reload in Nuxt's SSR/client hydration cycle
2. Each time the module was re-evaluated, `csrfInitialized` would reset to `false`
3. This caused `initCsrfToken()` to call `/sanctum/csrf-cookie` repeatedly
4. Each call to `/sanctum/csrf-cookie` could potentially create a **new session** on the Laravel backend

### Cause 2: Duplicate Cart Fetches on Navigation

The cart plugin was calling `fetchCart()` on **every page navigation**, not just once per session:

```typescript
// OLD IMPLEMENTATION (PROBLEMATIC)
export default defineNuxtPlugin(async () => {
  const cart = useCartStore()
  cart.restoreCart()

  if (import.meta.client) {
    await initCsrfToken()
    cart.fetchCart()  // ❌ Called on EVERY page navigation
  }
})
```

**Why This Caused Issues:**
1. Every time user navigated to a new page (e.g., `/catalog`), the plugin ran again
2. `fetchCart()` was called without any guards
3. The `GET /cart` request to the backend caused Laravel to create a new cart record
4. Multiple cart records accumulated in the database with different `session_id` values

## Solution

### 1. Check for Existing CSRF Cookie

Instead of relying on a module-level flag, we now check if the `XSRF-TOKEN` cookie already exists:

```typescript
// NEW IMPLEMENTATION (FIXED)
function hasXsrfToken(): boolean {
  if (!import.meta.client) return false

  try {
    const cookies = document.cookie.split(';')
    return cookies.some(cookie => cookie.trim().startsWith('XSRF-TOKEN='))
  } catch {
    return false
  }
}

export async function initCsrfToken(): Promise<void> {
  if (!import.meta.client) return

  // ✅ Check if CSRF token already exists - prevents creating new sessions
  if (hasXsrfToken()) {
    return
  }

  await axios.get(`${baseURL}/sanctum/csrf-cookie`, { withCredentials: true })
}
```

### 2. Early CSRF Initialization in Cart Plugin

Updated `app/plugins/cart.client.ts` to initialize the CSRF token early when the app mounts:

```typescript
export default defineNuxtPlugin(async () => {
  const cart = useCartStore()

  cart.restoreCart()

  if (import.meta.client) {
    // ✅ Initialize CSRF token early to establish session
    await initCsrfToken()

    // Then fetch cart from backend
    cart.fetchCart()
  }
})
```

### 3. Prevent Duplicate Cart Fetches with isInitialized Flag

Added an `isInitialized` state flag to the cart store to prevent redundant `fetchCart()` calls:

```typescript
// NEW IMPLEMENTATION (FIXED)
export const useCartStore = defineStore('cart', {
  state: (): CartState => ({
    items: [],
    subtotal: 0,
    total_items: 0,
    isLoading: false,
    isInitialized: false,  // ✅ Track if cart has been fetched
  }),

  actions: {
    async fetchCart(): Promise<void> {
      // ✅ Skip if already initialized to prevent duplicate fetches
      if (this.isInitialized) {
        return
      }

      try {
        this.isLoading = true
        const response = await getCart()
        const cart = response.data.data

        this.items = cart.items
        this.subtotal = cart.subtotal
        this.total_items = cart.total_items

        this.persistCart()
        this.isInitialized = true  // ✅ Mark as initialized
      } catch (error) {
        console.error('Failed to fetch cart:', error)
      } finally {
        this.isLoading = false
      }
    },

    clearCart(): void {
      this.items = []
      this.subtotal = 0
      this.total_items = 0
      this.isInitialized = false  // ✅ Reset on clear
      safeRemoveItem(STORAGE_KEY)
    },
  },
})
```

## How It Works

### First Page Load (Initial Session Establishment)
1. **User visits site** → Cart plugin runs
2. **CSRF token check** → `hasXsrfToken()` returns `false` (no cookie yet)
3. **Initialize CSRF** → Calls `/sanctum/csrf-cookie` → Backend creates session and sets cookies
4. **Fetch cart** → `fetchCart()` called for first time → `isInitialized = true`
5. **Result**: Single session established, single cart record in database

### Subsequent Page Navigation (e.g., to /catalog)
1. **User navigates to `/catalog`** → Cart plugin runs again
2. **CSRF token check** → `hasXsrfToken()` returns `true` (cookie exists) → Skip `/sanctum/csrf-cookie`
3. **Fetch cart check** → `isInitialized = true` → Skip `fetchCart()`
4. **Result**: No new session created, no new cart record, same cart persists

### Adding Products to Cart
1. **User clicks "Agregar al carrito"** → `cart.addItem()` called
2. **CSRF token check** → `hasXsrfToken()` returns `true` → Skip `/sanctum/csrf-cookie`
3. **POST /cart/add** → Uses existing session cookies → Product added to same cart
4. **Update state** → Cart items updated in store and localStorage
5. **Result**: Product added to the single persistent cart

## Verification Steps

To verify this fix works correctly, follow these steps:

### 1. Clear Existing Data

**Browser:**
1. Open Chrome/Firefox DevTools (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Under **Cookies**, select your domain
4. Delete all cookies to start fresh

**Database:**
1. Open your Laravel database
2. Truncate or delete records from the `carts` table
3. This ensures you're starting with a clean slate

### 2. Test Cart Operations

1. **First page load**:
   - Open the site in a new incognito/private window
   - Open DevTools → Application → Cookies
   - Note the initial cookies (should see `XSRF-TOKEN` and session cookie like `megasorpresa_session`)
   - **Record the session cookie value** (e.g., `megasorpresa_session=abc123xyz`)
   - Check database → Should see **1 cart record** created

2. **Navigate to /catalog**:
   - Click on catalog or navigate to `/catalog` page
   - Check DevTools → Network tab
   - **Should NOT see** a new `GET /cart` request (or if present, no new cart in DB)
   - Check database → Should **still only have 1 cart record**
   - Check cookies → Session cookie value **should NOT have changed**

3. **Navigate between pages**:
   - Go to home, then catalog, then product detail, then back to catalog
   - Check database after each navigation
   - **Should still only have 1 cart record throughout**
   - Session cookie remains constant

4. **Add first product to cart**:
   - Click "Agregar al carrito" on any product
   - Check DevTools → Network tab for the POST request to `/api/cart/add`
   - Verify the request includes cookies
   - Check database → Cart record should be **updated** (not created new)
   - Check cookies → Session cookie value **should NOT have changed**

5. **Add second product to cart**:
   - Navigate to another product
   - Click "Agregar al carrito" again
   - Check cookies → Session cookie value **should STILL be the same**
   - Check database → **Still only 1 cart record** with 2 items

6. **Check cart page**:
   - Navigate to `/cart`
   - **All products should be displayed together** in a single cart
   - Database should **still only have 1 cart record**

### Expected Results

✅ **Success indicators**:
- `XSRF-TOKEN` cookie is set once on first load
- Session cookie (e.g., `megasorpresa_session`) **does not change** between operations
- `/sanctum/csrf-cookie` is called **only once** per session (check Network tab)
- Database has **only 1 cart record** throughout the entire session
- All products appear in the same cart
- Cart count badge updates correctly
- No duplicate `GET /cart` requests on page navigation

❌ **Failure indicators** (old behavior):
- Session cookie changes value with each page navigation or cart operation
- `/sanctum/csrf-cookie` is called multiple times
- Database accumulates multiple cart records with different `session_id` values
- Products appear in different carts or cart is empty
- Inconsistent cart count

## Technical Details

### Laravel Sanctum Session Flow

1. **Initial request**: Frontend calls `/sanctum/csrf-cookie`
2. **Backend response**: Laravel sets two cookies:
   - `XSRF-TOKEN`: CSRF token (readable by JavaScript)
   - `{APP_NAME}_session`: Session ID (HTTP-only, secure)
3. **Subsequent requests**: Axios sends both cookies automatically via `withCredentials: true`
4. **Backend validation**: Laravel validates CSRF token and maintains session

### Cookie Properties

- **XSRF-TOKEN**:
  - Readable by JavaScript (not HTTP-only)
  - Used for CSRF protection
  - Set by Laravel Sanctum

- **{APP_NAME}_session** (e.g., `megasorpresa_session`):
  - HTTP-only (not readable by JavaScript)
  - Contains session ID
  - Identifies the user's cart

## Backend Requirements

Ensure your Laravel backend (`megasorpresa-back`) has proper CORS configuration:

```php
// config/cors.php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'supports_credentials' => true,
'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:3000')],
```

```php
// config/session.php
'driver' => env('SESSION_DRIVER', 'cookie'),
'http_only' => true,
'secure' => env('SESSION_SECURE_COOKIE', false),
'same_site' => 'lax',
```

## Additional Notes

- This fix follows Laravel Sanctum best practices for SPA authentication
- The solution is SSR-safe with proper `import.meta.client` checks
- Cookie checks are wrapped in try-catch for security error resilience
- The fix maintains backward compatibility with existing code

## Related Files

- `app/api/index.ts` - CSRF token initialization logic
- `app/plugins/cart.client.ts` - Cart plugin with early CSRF init
- `app/stores/cart.ts` - Cart store that calls `initCsrfToken()` before mutations
- `app/api/cart.ts` - Cart API endpoints

## Memory for Future Reference

Store this fix pattern for similar session-based features:

- Always check for existing cookies/sessions before initialization
- Never rely on module-level variables for session state in Nuxt/SSR apps
- Use Nuxt's `useCookie` or direct cookie checks for persistent state
- Initialize sessions early in client-side plugins
- Verify cookie persistence in browser DevTools during testing
