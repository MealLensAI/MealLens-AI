# Test Payment System

## Step 1: Run Database Setup

1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `SETUP_PAYMENT_DATABASE.sql`
4. Click **Run** to create/update payment tables

## Step 2: Test Payment Endpoints

After the database setup, test these endpoints:

```bash
# Test payment plans endpoint
curl https://meallens-ai-cmps.onrender.com/api/payment/plans

# Should return subscription plans JSON, not an error
```

## Step 3: Test Frontend Payment

1. Go to your deployed frontend
2. Navigate to `/payment` page
3. Select a plan and click "Subscribe Now"
4. You should be redirected to Paystack payment page

## Expected Results

- **Payment Plans**: Should return 4 plans (Free, Weekly, Two Weeks, Monthly)
- **Payment Flow**: Should redirect to live Paystack for all devices
- **No Simulation**: All payments go through live Paystack integration

## Troubleshooting

If you still get errors:

1. **Check Render Logs**: Look for payment service initialization messages
2. **Verify Environment Variables**: Ensure Paystack keys are set correctly
3. **Database Tables**: Make sure all tables were created successfully
4. **Restart Backend**: After database changes, restart your Render service

## Test Payment Card

Use Paystack test card: `4084084084084085`
- CVV: Any 3 digits
- Expiry: Any future date
- PIN: 1234