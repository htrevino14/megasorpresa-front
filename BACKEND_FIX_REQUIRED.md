# Backend Fix Required - XSRF-TOKEN HttpOnly Issue

## ✅ Confirmed Issue

Based on your Laravel configuration files, I've identified the exact problem:

**The `XSRF-TOKEN` cookie is being set with `HttpOnly=true` by Laravel's middleware.**

## Your Current Configuration

### session.php (CORRECT ✅)
```php
'http_only' => env('SESSION_HTTP_ONLY', false),
```
This is correct, but it only controls the **session cookie**, not XSRF-TOKEN.

### sanctum.php (NEEDS FIX ⚠️)
```php
'middleware' => [
    'authenticate_session' => Laravel\Sanctum\Http\Middleware\AuthenticateSession::class,
    'encrypt_cookies' => Illuminate\Cookie\Middleware\EncryptCookies::class,  // ← This is the problem
    'validate_csrf_token' => Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class,
],
```

The `EncryptCookies` middleware is setting **all** cookies as HttpOnly by default.

## The Solution

You need to configure the `EncryptCookies` middleware to NOT set HttpOnly on the `XSRF-TOKEN` cookie.

### Option 1: Modify EncryptCookies Middleware (RECOMMENDED)

**File: `app/Http/Middleware/EncryptCookies.php`**

Add this method to your EncryptCookies class:

```php
<?php

namespace App\Http\Middleware;

use Illuminate\Cookie\Middleware\EncryptCookies as Middleware;
use Symfony\Component\HttpFoundation\Cookie;

class EncryptCookies extends Middleware
{
    /**
     * The names of the cookies that should not be encrypted.
     *
     * @var array<int, string>
     */
    protected $except = [
        //
    ];

    /**
     * Handle the given cookie after it has been made.
     *
     * @param  \Symfony\Component\HttpFoundation\Cookie  $cookie
     * @return \Symfony\Component\HttpFoundation\Cookie
     */
    protected function makeHttpOnlyIfShould(Cookie $cookie): Cookie
    {
        // XSRF-TOKEN must be accessible to JavaScript for Sanctum SPA authentication
        if ($cookie->getName() === 'XSRF-TOKEN') {
            return Cookie::create(
                $cookie->getName(),
                $cookie->getValue(),
                $cookie->getExpiresTime(),
                $cookie->getPath(),
                $cookie->getDomain(),
                $cookie->isSecure(),
                false,  // ← HttpOnly = false for XSRF-TOKEN
                $cookie->isRaw(),
                $cookie->getSameSite()
            );
        }

        // All other cookies remain HttpOnly
        return $cookie;
    }
}
```

### Option 2: Use Laravel's Built-in Cookie Configuration

**File: `config/session.php`**

Ensure XSRF-TOKEN is explicitly configured:

```php
// After the session configuration, add:
'xsrf_cookie' => [
    'http_only' => false,  // ← Must be false for JavaScript access
],
```

**However**, Laravel doesn't have this built-in configuration by default, so **Option 1 is recommended**.

### Option 3: Override in Sanctum Configuration (Laravel 10+)

If you're using Laravel 10+, you can configure this in `config/sanctum.php`:

```php
'cookie' => [
    'name' => 'XSRF-TOKEN',
    'http_only' => false,  // ← Must be false
],
```

**Note:** This depends on your Laravel version. Check Laravel Sanctum documentation for your version.

## How to Apply the Fix

### Step 1: Modify EncryptCookies Middleware

1. Open `megasorpresa-back/app/Http/Middleware/EncryptCookies.php`
2. Add the `makeHttpOnlyIfShould()` method shown above
3. Save the file

### Step 2: Clear Laravel Caches

```bash
cd megasorpresa-back
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

### Step 3: Restart Laravel Server

```bash
php artisan serve
```

### Step 4: Test the Fix

1. **Clear browser cookies** (DevTools → Application → Cookies → Delete all)
2. **Visit the frontend**: `http://localhost:3000`
3. **Open DevTools** → Application → Cookies
4. **Check XSRF-TOKEN cookie attributes:**
   - HttpOnly should be **☑️ false** (currently it's true)
   - Secure can be true or false (depends on environment)
   - SameSite should be "Lax"

### Step 5: Verify with Debug Page

Visit: `http://localhost:3000/debug-cart`

**Expected output:**
```
Cookie Analysis
✅ XSRF-TOKEN: Present
✅ Session Cookie: Present
```

**Console logs should show:**
```
[CSRF Check] XSRF-TOKEN exists: true  ← Must be true!
[CSRF Check] Session cookie exists: true
```

If you still see `XSRF-TOKEN exists: false`, the cookie is still HttpOnly.

## Alternative Quick Test

**In browser DevTools Console, run:**

```javascript
console.log('All cookies:', document.cookie)
console.log('Has XSRF-TOKEN:', document.cookie.includes('XSRF-TOKEN'))
```

**Expected:**
```
All cookies: XSRF-TOKEN=...; megasorpresa_session=...
Has XSRF-TOKEN: true  ← Must be true!
```

**If you see:**
```
Has XSRF-TOKEN: false  ← Cookie is HttpOnly (bad)
```

Then the middleware fix hasn't been applied correctly.

## Why This Fixes the Cart Duplication Issue

Currently:
1. User loads page → Laravel sets `XSRF-TOKEN` with HttpOnly=true
2. JavaScript cannot read the cookie
3. `hasXsrfToken()` returns `false`
4. Frontend calls `/sanctum/csrf-cookie` again
5. Laravel creates **new session** → **new cart record**
6. Repeat for every cart operation

After fix:
1. User loads page → Laravel sets `XSRF-TOKEN` with HttpOnly=**false**
2. JavaScript **can** read the cookie
3. `hasXsrfToken()` returns `true`
4. Frontend skips CSRF initialization
5. Uses existing session → **updates same cart record** ✅

## Security Note

**Q: Is it safe to set HttpOnly=false on XSRF-TOKEN?**

**A: Yes!** This is actually **required** by Laravel Sanctum's SPA authentication design:

- **XSRF-TOKEN** is meant to be read by JavaScript (it's the CSRF token for API requests)
- **Session cookie** (`megasorpresa_session`) should remain HttpOnly=true for security
- This is the standard Sanctum configuration for SPAs

See: [Laravel Sanctum SPA Authentication](https://laravel.com/docs/sanctum#spa-authentication)

## Expected Cookie Attributes After Fix

| Cookie Name | HttpOnly | Secure | SameSite | Purpose |
|-------------|----------|--------|----------|---------|
| **XSRF-TOKEN** | ❌ **false** | ✅ true (prod) | Lax | CSRF token for SPA |
| **megasorpresa_session** | ✅ true | ✅ true (prod) | Lax | Session identifier |

## Testing Checklist

After applying the backend fix:

- [ ] Clear browser cookies
- [ ] Clear Laravel caches (`php artisan config:clear`)
- [ ] Restart Laravel server
- [ ] Visit frontend and check DevTools → Cookies
- [ ] Verify `XSRF-TOKEN` has HttpOnly=false
- [ ] Visit `/debug-cart` page
- [ ] Run console test: `document.cookie.includes('XSRF-TOKEN')`
- [ ] Add product to cart
- [ ] Check database - should have only 1 cart record
- [ ] Add another product
- [ ] Check database - should still have only 1 cart record ✅

## Need Help?

If the issue persists after applying the fix:

1. Share the modified `EncryptCookies.php` file
2. Share a screenshot of DevTools → Cookies showing XSRF-TOKEN attributes
3. Share the output from the `/debug-cart` page
4. Share console logs from adding a product

## Related Files

- **Frontend diagnostic page:** `/debug-cart`
- **Frontend documentation:** `BACKEND_XSRF_TOKEN_FIX.md`
- **Session fix documentation:** `CART_SESSION_FIX.md`
- **CORS configuration:** `BACKEND_CORS_SETUP.md`
