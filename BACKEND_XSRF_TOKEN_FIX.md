# Backend XSRF-TOKEN Configuration Fix

## Critical Issue Identified

If you're seeing **new cart records created on every "Agregar al carrito" click**, the root cause is likely that Laravel is setting the `XSRF-TOKEN` cookie with `HttpOnly=true`, making it **inaccessible to JavaScript**.

### How to Identify This Issue

Check your browser console. If you see:

```
[CSRF Check] XSRF-TOKEN exists: false
[CSRF Check] Session cookie exists: true
[CSRF Check] ⚠️ WARNING: Session cookie exists but XSRF-TOKEN is missing!
```

And in DevTools → Application → Cookies, you can SEE the `XSRF-TOKEN` cookie but JavaScript can't read it, then **the cookie is HttpOnly**.

## The Problem

When `XSRF-TOKEN` is HttpOnly:
1. Frontend JavaScript cannot detect the cookie exists
2. `hasXsrfToken()` returns `false` even though cookie exists
3. Frontend calls `/sanctum/csrf-cookie` again
4. Backend creates a **NEW session** with a **NEW cart**
5. Previous cart is abandoned

## The Solution

### Option 1: Fix Laravel Sanctum Cookie Configuration (RECOMMENDED)

Laravel Sanctum **should NOT** set `XSRF-TOKEN` with HttpOnly. Check your backend:

**File: `config/session.php`**

```php
<?php

return [
    // ... other config ...

    /*
    |--------------------------------------------------------------------------
    | HTTP Only Cookies
    |--------------------------------------------------------------------------
    |
    | By setting this option to true, session cookies will ONLY be accessible
    | through the HTTP protocol. This is for the SESSION cookie, NOT XSRF-TOKEN.
    |
    */

    'http_only' => true,  // ← This is OK (session cookie security)

    // ... rest of config ...
];
```

**File: `config/sanctum.php`**

Make sure you're NOT overriding the default Sanctum behavior. Sanctum's XSRF-TOKEN should be accessible to JavaScript.

Check if you have any middleware or cookie settings that might be affecting this.

### Option 2: Check Laravel Version and Sanctum Version

Ensure you're using compatible versions:

```bash
cd megasorpresa-back
composer show laravel/sanctum
```

Laravel Sanctum should set `XSRF-TOKEN` without HttpOnly by default. If it's not working correctly, you might need to update:

```bash
composer update laravel/sanctum
php artisan config:clear
php artisan cache:clear
```

### Option 3: Verify Cookie Middleware

Check if you have any custom middleware modifying cookies:

**File: `app/Http/Middleware/*`**

Look for any middleware that might be setting `HttpOnly=true` on **all** cookies instead of just the session cookie.

## How to Test the Fix

### 1. Clear Everything

**Browser:**
- Delete all cookies (DevTools → Application → Cookies)

**Backend:**
- Clear config cache: `php artisan config:clear`
- Clear application cache: `php artisan cache:clear`
- Restart Laravel server

**Frontend:**
- Restart Nuxt dev server

### 2. Test with Debug Tool

Visit: `http://localhost:3000/debug-cart`

1. Click "Refresh Cookies" - should show no cookies
2. Click "1. Initialize CSRF Token"
3. Click "Refresh Cookies" again
4. Check the "Cookie Analysis" section:
   - ✅ XSRF-TOKEN: Present (should be GREEN)
   - ✅ Session Cookie: Present (should be GREEN)

### 3. Check Console Logs

You should see:

```
[CSRF Init] No valid session found - initializing new session
[CSRF Init] Session initialized successfully
[CSRF Check] XSRF-TOKEN exists: true  ← MUST BE TRUE
[CSRF Check] Session cookie exists: true
```

**If XSRF-TOKEN is still `false`, the cookie is HttpOnly** - go back to Laravel backend and fix the configuration.

### 4. Test Cart Operations

1. Click "3. Add Product to Cart"
2. Check console - should see:
   ```
   [CSRF Check] XSRF-TOKEN exists: true
   [CSRF Check] Session cookie exists: true
   [CSRF Init] Skipping - valid session already exists  ← KEY MESSAGE
   ```

3. Check the activity log on the debug page:
   ```
   ✅ Add to cart completed - Cart Items: 1
   ✅ Cookies remained consistent  ← CRITICAL
   ```

### 5. Verify Database

Check the `carts` table - should only have **1 record** after all operations.

## Expected Cookie Attributes

When you inspect cookies in DevTools → Application → Cookies, you should see:

| Cookie Name | HttpOnly | Secure | SameSite | Accessible to JS |
|-------------|----------|--------|----------|------------------|
| `XSRF-TOKEN` | **❌ false** | ✅ true (production) | Lax | **✅ YES** |
| `megasorpresa_session` | ✅ true | ✅ true (production) | Lax | ❌ NO |

**The XSRF-TOKEN MUST be accessible to JavaScript!**

## Additional Backend Checks

### Check CORS Configuration

**File: `config/cors.php`**

```php
<?php

return [
    'paths' => [
        'api/*',
        'sanctum/csrf-cookie',  // ← Must be here
    ],

    'supports_credentials' => true,  // ← MUST be true

    'allowed_origins' => [
        'http://localhost:3000',  // ← Your frontend URL
    ],

    // ... rest of config ...
];
```

### Check Sanctum Configuration

**File: `config/sanctum.php`**

```php
<?php

return [
    'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', 'localhost,localhost:3000,127.0.0.1,127.0.0.1:3000')),

    // Don't override these unless necessary
    // 'guard' => ['web'],
    // 'expiration' => null,
];
```

**File: `.env`**

```env
SESSION_DRIVER=cookie
SESSION_LIFETIME=120
SESSION_DOMAIN=localhost  # ← Match your frontend domain
SESSION_SECURE_COOKIE=false  # ← false for local development
SESSION_SAME_SITE=lax

SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000
```

## Common Mistakes

### ❌ Mistake 1: Setting ALL Cookies as HttpOnly

```php
// DON'T DO THIS in middleware or config
Cookie::queue('name', 'value', 120, '/', null, false, true);  // ← Last param is HttpOnly
```

Only the **session** cookie should be HttpOnly, NOT the XSRF-TOKEN.

### ❌ Mistake 2: Custom Cookie Middleware

If you have custom middleware that modifies cookies, ensure it doesn't set HttpOnly on XSRF-TOKEN:

```php
// app/Http/Middleware/SomeMiddleware.php
public function handle($request, Closure $next)
{
    $response = $next($request);

    // DON'T apply HttpOnly to ALL cookies
    // Be selective about which cookies get HttpOnly
    return $response;
}
```

### ❌ Mistake 3: Wrong Session Domain

If your frontend is `localhost:3000` but SESSION_DOMAIN is `127.0.0.1`, cookies won't work:

```env
# ❌ WRONG if frontend uses localhost
SESSION_DOMAIN=127.0.0.1

# ✅ CORRECT - match your frontend URL domain
SESSION_DOMAIN=localhost
```

## Need More Help?

If the issue persists after following this guide:

1. Share the output of the `/debug-cart` page
2. Share a screenshot of DevTools → Application → Cookies showing all cookies and their attributes (HttpOnly, Secure, SameSite)
3. Share the console logs when adding a product to cart
4. Share the relevant Laravel configuration files (config/session.php, config/sanctum.php, config/cors.php)

## Related Documentation

- [BACKEND_CORS_SETUP.md](./BACKEND_CORS_SETUP.md) - General CORS configuration
- [CART_SESSION_FIX.md](./CART_SESSION_FIX.md) - Frontend session persistence fix
- [Laravel Sanctum Docs](https://laravel.com/docs/sanctum) - Official Laravel Sanctum documentation
