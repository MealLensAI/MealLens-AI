# Enable Live Paystack Payments

## Issue: Payment System Disabled

The payment system is currently **disabled** because the `PAYSTACK_SECRET_KEY` environment variable is not set. This is why you're seeing different behavior on mobile vs desktop.

## Solution: Enable Live Paystack Integration

### Step 1: Get Your Paystack Keys

1. Go to [Paystack Dashboard](https://dashboard.paystack.com)
2. Sign up/Login to your account
3. Go to **Settings → API Keys**
4. Copy your **Secret Key** (starts with `sk_live_` for production or `sk_test_` for testing)

### Step 2: Set Environment Variables

Add these to your backend environment (`.env` file or deployment environment):

```bash
# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_live_your_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_live_your_public_key_here

# Frontend Environment (for deployment)
VITE_PAYSTACK_PUBLIC_KEY=pk_live_your_public_key_here
```

### Step 3: Restart Backend

After setting the environment variables, restart your backend server.

### Step 4: Verify Payment System

1. Check backend logs for: `"Payment service initialized successfully"`
2. Test payment flow on both mobile and desktop
3. Both should now use the same live Paystack integration

## Current Behavior

- **Without Paystack keys**: Payment system is disabled, showing fallback messages
- **With Paystack keys**: All devices use the same live Paystack integration

## Mobile vs Desktop

The difference you're seeing is likely because:
- **Mobile**: Redirects directly to Paystack (correct behavior)
- **Desktop**: Tries to open popup, falls back to redirect if blocked

Both should work the same way once Paystack keys are configured.

## Test Payment Flow

1. Go to `/payment` page
2. Select a plan
3. Click "Subscribe Now"
4. You should be redirected to Paystack payment page
5. Complete payment with test card: `4084084084084085`

## Production Keys

For production, use live keys:
- `sk_live_...` (Secret Key)
- `pk_live_...` (Public Key)

For testing, use test keys:
- `sk_test_...` (Secret Key)  
- `pk_test_...` (Public Key)