# Verify Payment System Setup

## Step 1: Setup Database Tables

1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `SETUP_PAYMENT_DATABASE.sql`
4. Click **Run** to create all payment tables

## Step 2: Verify Environment Variables

Make sure these are set in your **Render** backend environment:

```bash
PAYSTACK_SECRET_KEY=sk_live_your_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_live_your_public_key_here
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

And in your **Netlify** frontend environment:

```bash
VITE_PAYSTACK_PUBLIC_KEY=pk_live_your_public_key_here
VITE_API_URL=https://meallens-ai-cmps.onrender.com
```

## Step 3: Restart Backend

After setting up the database tables, restart your Render backend service.

## Step 4: Test Payment Endpoints

Test these endpoints to verify payment system is working:

```bash
# Test payment plans endpoint
curl https://meallens-ai-cmps.onrender.com/api/payment/plans

# Should return subscription plans, not an error
```

## Step 5: Test Frontend Payment

1. Go to your deployed frontend
2. Navigate to `/payment` page
3. Select a plan and click "Subscribe Now"
4. You should be redirected to Paystack payment page

## Expected Behavior

- **Mobile devices**: Redirect directly to Paystack
- **Desktop devices**: Open popup or redirect to Paystack
- **Both**: Use the same live Paystack integration
- **No simulation**: All payments go through live Paystack

## Troubleshooting

If payment endpoints still return errors:

1. Check Render logs for payment service initialization
2. Verify all environment variables are set correctly
3. Ensure database tables were created successfully
4. Check that Paystack keys are valid and active

## Test Payment

Use Paystack test card: `4084084084084085`
- CVV: Any 3 digits
- Expiry: Any future date
- PIN: 1234