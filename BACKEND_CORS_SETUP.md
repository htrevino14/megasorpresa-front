# Backend CORS Configuration Guide

## Problem
The frontend is getting CORS errors when trying to access the Laravel backend's `/sanctum/csrf-cookie` endpoint. This prevents the shopping cart from working properly.

## Solution
The Laravel backend (megasorpresa-back) needs to be configured to allow cross-origin requests with credentials from the frontend.

### Step 1: Update `config/cors.php`

Make sure your Laravel backend has the following CORS configuration:

```php
<?php

return [
    'paths' => [
        'api/*',
        'sanctum/csrf-cookie',  // ← Important: Allow CSRF endpoint
    ],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:3000',  // ← Add your frontend URL
        'http://localhost:8080',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:8080',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,  // ← Important: Must be true for sessions
];
```

### Step 2: Update `.env` in Backend

Make sure your backend `.env` has the correct frontend URL:

```env
SESSION_DRIVER=cookie
SESSION_DOMAIN=localhost
SANCTUM_STATEFUL_DOMAINS=localhost:3000,localhost:8080,127.0.0.1:3000,127.0.0.1:8080
```

### Step 3: Clear Laravel Configuration Cache

After making changes, run these commands in the backend:

```bash
cd megasorpresa-back
php artisan config:clear
php artisan cache:clear
```

### Step 4: Verify Frontend Configuration

Make sure your frontend `.env` file has:

```env
NUXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

## Testing

After making these changes:

1. Restart the Laravel backend server
2. Restart the Nuxt frontend server
3. Try adding a product to the cart
4. Check the browser console - CORS errors should be gone

## Common Issues

### Issue: "Access-Control-Allow-Origin" error
**Solution**: Make sure `supports_credentials` is `true` in `config/cors.php`

### Issue: "Session store not set on request"
**Solution**: Check that `SESSION_DRIVER=cookie` in backend `.env`

### Issue: CSRF token not persisting
**Solution**: Verify `SESSION_DOMAIN` matches your domain (use `localhost` not `127.0.0.1`)
