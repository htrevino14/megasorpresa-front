# Cart Session Persistence Fix

## Problem Description

The frontend was generating a new `cart_token` or session every time a user clicked "Add to cart", causing products to be added to different carts instead of being grouped together in a single persistent cart.

## Root Cause

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

### Why This Caused Issues

1. **Module-level variables reset** on page navigation or reload in Nuxt's SSR/client hydration cycle
2. Each time the module was re-evaluated, `csrfInitialized` would reset to `false`
3. This caused `initCsrfToken()` to call `/sanctum/csrf-cookie` repeatedly
4. Each call to `/sanctum/csrf-cookie` could potentially create a **new session** on the Laravel backend
5. Multiple sessions meant products were added to different carts

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

## How It Works

1. **On app mount**: Cart plugin initializes CSRF token if it doesn't exist, establishing a session
2. **On subsequent cart operations**: `hasXsrfToken()` returns `true`, so no new session is created
3. **Session persistence**: The `XSRF-TOKEN` cookie persists across page navigations and reloads
4. **Single cart**: All products are added to the same cart identified by the persistent session

## Verification Steps

To verify this fix works correctly, follow these steps in your browser DevTools:

### 1. Clear Existing Cookies

1. Open Chrome/Firefox DevTools (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Under **Cookies**, select your domain
4. Delete all cookies to start fresh

### 2. Test Cart Operations

1. **First page load**:
   - Open the site in a new incognito/private window
   - Open DevTools → Application → Cookies
   - Note the initial cookies (should see `XSRF-TOKEN` and session cookie like `megasorpresa_session`)
   - **Record the session cookie value** (e.g., `megasorpresa_session=abc123xyz`)

2. **Add first product to cart**:
   - Click "Agregar al carrito" on any product
   - Check DevTools → Network tab for the POST request to `/api/cart/add`
   - Verify the request includes cookies
   - Check Application → Cookies again
   - **The session cookie value should NOT have changed**

3. **Add second product to cart**:
   - Navigate to another product
   - Click "Agregar al carrito" again
   - Check the cookies again
   - **The session cookie value should STILL be the same**

4. **Navigate between pages**:
   - Go to different pages (catalog, product detail, home)
   - Add more products to cart
   - **Session cookies should remain constant throughout**

5. **Check cart page**:
   - Navigate to `/cart`
   - **All products should be displayed together** in a single cart

### Expected Results

✅ **Success indicators**:
- `XSRF-TOKEN` cookie is set once on first load
- Session cookie (e.g., `megasorpresa_session`) **does not change** between cart operations
- `/sanctum/csrf-cookie` is called **only once** per session (check Network tab)
- All products appear in the same cart
- Cart count badge updates correctly

❌ **Failure indicators** (old behavior):
- Session cookie changes value with each "Add to cart" click
- `/sanctum/csrf-cookie` is called multiple times
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
