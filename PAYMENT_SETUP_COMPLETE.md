# 🚀 Complete Payment System Setup Guide

## Overview
This guide will help you enable the complete payment system with Paystack integration, including database updates and redirect handling.

## ✅ What's Already Implemented

### Backend:
- ✅ Payment routes (`/api/payment/*`)
- ✅ Paystack integration service
- ✅ Webhook handler for payment verification
- ✅ Database update methods
- ✅ Subscription management

### Frontend:
- ✅ Payment modal with Apple-style animations
- ✅ Mobile-responsive design
- ✅ Payment success page for redirects
- ✅ Subscription context integration

## 🔧 Step-by-Step Setup

### Step 1: Get Paystack Account & API Keys

1. **Sign up at Paystack:**
   - Go to [Paystack Dashboard](https://dashboard.paystack.com/)
   - Create an account and complete verification

2. **Get your API Keys:**
   - Go to Settings → API Keys & Webhooks
   - Copy your **Secret Key** (starts with `sk_`)
   - Copy your **Public Key** (starts with `pk_`)

### Step 2: Set Environment Variables

#### Backend (.env file):
```bash
# Payment System Configuration
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
FRONTEND_URL=https://your-frontend-domain.com

# Other required variables
DATABASE_URL=your_database_url
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

#### Frontend (.env file):
```bash
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
```

### Step 3: Setup Database Tables

Run the database setup script:
```bash
cd backend
python scripts/setup_payment_tables.py
```

This creates:
- `subscription_plans` - Available plans
- `user_subscriptions` - User subscriptions
- `payment_transactions` - Payment history
- `usage_tracking` - Feature usage
- `paystack_webhooks` - Webhook events

### Step 4: Configure Paystack Webhooks

1. **Go to Paystack Dashboard:**
   - Settings → API Keys & Webhooks
   - Click "Add Webhook"

2. **Add Webhook URL:**
   ```
   https://your-backend-domain.com/api/payment/webhook
   ```

3. **Select Events:**
   - `charge.success`
   - `subscription.create`
   - `subscription.disable`

4. **Save the webhook**

### Step 5: Add Payment Success Route

Add this route to your frontend router:

```tsx
// In your router configuration
import PaymentSuccess from '@/pages/PaymentSuccess';

// Add the route
{
  path: '/payment/success',
  element: <PaymentSuccess />
}
```

### Step 6: Test the Payment System

1. **Start your backend:**
   ```bash
   cd backend
   python app.py
   ```

2. **Start your frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test payment flow:**
   - Go to payment page
   - Select a plan
   - Click "Pay Securely"
   - Complete payment on Paystack
   - Should redirect back to success page

## 🔄 Payment Flow Explained

### 1. Payment Initiation
```
User clicks "Pay" → Frontend calls /api/payment/initialize-payment → 
Backend creates Paystack transaction → Returns authorization_url
```

### 2. Payment Processing
```
User redirected to Paystack → Completes payment → 
Paystack sends webhook to /api/payment/webhook → 
Backend verifies and updates database
```

### 3. Payment Verification
```
User redirected back to /payment/success → 
Frontend calls /api/payment/verify-payment → 
Backend confirms payment and updates subscription
```

### 4. Database Updates
```
✅ user_subscriptions table updated with active subscription
✅ payment_transactions table records the payment
✅ usage_tracking resets for new subscription period
```

## 🛠️ Troubleshooting

### Common Issues:

1. **"Payment System Unavailable"**
   - Check if PAYSTACK_SECRET_KEY is set
   - Verify Paystack API keys are correct

2. **Webhook not receiving events**
   - Check webhook URL is accessible
   - Verify webhook signature verification

3. **Database errors**
   - Run database setup script
   - Check Supabase connection

4. **Redirect not working**
   - Verify FRONTEND_URL is set correctly
   - Check payment success route is added

### Testing with Paystack Test Cards:

- **Card Number:** 4084 0840 8408 4081
- **CVV:** Any 3 digits
- **Expiry:** Any future date
- **PIN:** Any 4 digits

## 📊 Monitoring

### Check Payment Status:
```bash
# Check webhook logs
tail -f backend/logs/app.log

# Check database
SELECT * FROM payment_transactions ORDER BY created_at DESC;
SELECT * FROM user_subscriptions WHERE status = 'active';
```

### Verify Webhook Events:
- Go to Paystack Dashboard → Settings → API Keys & Webhooks
- Check webhook delivery status

## 🎉 Success Indicators

✅ Payment modal opens without errors  
✅ Paystack redirect works  
✅ Payment success page loads  
✅ Database shows active subscription  
✅ User can access premium features  
✅ Webhook events are received  

## 🔐 Security Notes

- Never commit API keys to version control
- Use environment variables for all sensitive data
- Verify webhook signatures
- Implement proper error handling
- Monitor for failed payments

## 📞 Support

If you encounter issues:
1. Check the logs for error messages
2. Verify all environment variables are set
3. Test with Paystack test cards first
4. Contact Paystack support if needed

---

**🎉 Your payment system is now live and ready to process real payments!** 