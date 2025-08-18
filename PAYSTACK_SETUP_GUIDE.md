# Paystack Payment Integration Setup Guide

## Overview
The MealLens app now uses real Paystack payment processing instead of the simulated service. This guide will help you set up the Paystack integration properly.

## Required Environment Variables

### Backend (Render)
Add these environment variables to your Render backend service:

1. **PAYSTACK_SECRET_KEY** - Your Paystack secret key (starts with `sk_`)
2. **PAYSTACK_PUBLIC_KEY** - Your Paystack public key (starts with `pk_`)

### Frontend (Netlify)
Add this environment variable to your Netlify frontend:

1. **VITE_PAYSTACK_PUBLIC_KEY** - Your Paystack public key (starts with `pk_`)

## Setting Up Paystack Account

### 1. Create Paystack Account
1. Go to [Paystack Dashboard](https://dashboard.paystack.com/)
2. Sign up for a new account
3. Complete the verification process

### 2. Get Your API Keys
1. In your Paystack dashboard, go to **Settings** → **API Keys & Webhooks**
2. Copy your **Secret Key** (for backend)
3. Copy your **Public Key** (for frontend)

### 3. Configure Webhooks (Optional but Recommended)
1. In Paystack dashboard, go to **Settings** → **API Keys & Webhooks**
2. Add a new webhook with URL: `https://your-backend-url.onrender.com/api/payment/webhook`
3. Select events: `charge.success`, `subscription.create`, `subscription.disable`

## Environment Variable Setup

### Render Backend Setup
1. Go to your Render dashboard
2. Select your backend service
3. Go to **Environment** tab
4. Add these variables:
   ```
   PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
   PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
   ```

### Netlify Frontend Setup
1. Go to your Netlify dashboard
2. Select your site
3. Go to **Site settings** → **Environment variables**
4. Add this variable:
   ```
   VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
   ```

## Testing the Integration

### 1. Test Payment Flow
1. Deploy the changes to both frontend and backend
2. Go to the payment page in your app
3. Select a plan and click "Pay Securely"
4. You should be redirected to Paystack's payment page
5. Use Paystack's test card numbers for testing:
   - **Card Number**: 4084 0840 8408 4081
   - **Expiry**: Any future date
   - **CVV**: Any 3 digits
   - **PIN**: Any 4 digits

### 2. Test Webhook (Optional)
1. Make a test payment
2. Check your backend logs for webhook processing
3. Verify that subscription is created in your database

## Troubleshooting

### Common Issues

1. **"PAYSTACK_SECRET_KEY environment variable is required"**
   - Make sure you've set the `PAYSTACK_SECRET_KEY` in Render
   - Redeploy the backend after adding the environment variable

2. **"Failed to initialize payment"**
   - Check that your Paystack keys are correct
   - Verify that your Paystack account is active
   - Check backend logs for detailed error messages

3. **Payment page not loading**
   - Ensure `VITE_PAYSTACK_PUBLIC_KEY` is set in Netlify
   - Redeploy the frontend after adding the environment variable

4. **Webhook not working**
   - Verify the webhook URL is correct
   - Check that your backend is accessible from Paystack
   - Review webhook logs in Paystack dashboard

### Debug Steps

1. **Check Backend Logs**
   ```bash
   # In Render dashboard, check the logs for:
   [Paystack] PAYSTACK_SECRET_KEY loaded. Attempting to connect...
   [Paystack] Connected to Paystack API successfully!
   ```

2. **Check Frontend Console**
   - Open browser developer tools
   - Look for any JavaScript errors related to Paystack
   - Check network requests to see if API calls are working

3. **Test API Endpoints**
   ```bash
   # Test payment initialization
   curl -X POST https://your-backend.onrender.com/api/payment/initialize-payment \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer your_jwt_token" \
     -d '{"email":"test@example.com","amount":1000,"currency":"USD","reference":"test_ref"}'
   ```

## Security Notes

1. **Never expose your secret key** in frontend code
2. **Use environment variables** for all sensitive data
3. **Enable webhook signature verification** for production
4. **Use HTTPS** for all webhook URLs
5. **Regularly rotate your API keys**

## Production Checklist

- [ ] Set up Paystack account
- [ ] Configure environment variables in Render
- [ ] Configure environment variables in Netlify
- [ ] Set up webhooks (optional)
- [ ] Test payment flow with test cards
- [ ] Verify subscription creation
- [ ] Test webhook processing (if enabled)
- [ ] Switch to live Paystack keys (when ready for production)

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Paystack's [API documentation](https://paystack.com/docs/)
3. Check your backend and frontend logs
4. Verify all environment variables are set correctly 