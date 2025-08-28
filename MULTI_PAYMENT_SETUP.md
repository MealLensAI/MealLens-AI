# 💳 Multi-Payment Provider Setup Guide

## Overview

MealLens now supports multiple payment providers including **M-Pesa**, **Paystack**, and **Stripe** for global payment processing. This guide will help you set up all payment providers.

## 🚀 Supported Payment Providers

### 1. **Paystack** (Africa & Global)
- **Regions**: Nigeria, Ghana, South Africa, Kenya, Uganda, Tanzania, West Africa, Central Africa, Egypt
- **Currencies**: NGN, USD, GHS, ZAR, KES, UGX, TZS, XOF, XAF, EGP
- **Features**: Card Payments, Bank Transfers, Mobile Money, USSD
- **Best for**: African markets

### 2. **M-Pesa** (East Africa)
- **Regions**: Kenya, Tanzania, Uganda, Mozambique, Lesotho, Ghana, Egypt
- **Currencies**: KES (Kenyan Shilling)
- **Features**: Mobile Money, SMS Payments, USSD
- **Best for**: East African mobile money users

### 3. **Stripe** (Global)
- **Regions**: Global
- **Currencies**: USD, EUR, GBP, CAD, AUD, JPY, CHF, SEK, NOK, DKK
- **Features**: Card Payments, Digital Wallets, Bank Transfers, Buy Now Pay Later
- **Best for**: International markets

## 🔧 Environment Variables Setup

### Backend Environment Variables

Add these to your `.env` file or deployment environment:

```bash
# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key

# M-Pesa Configuration
MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
MPESA_PASSKEY=your_mpesa_passkey
MPESA_BUSINESS_SHORTCODE=your_business_shortcode
MPESA_ENVIRONMENT=sandbox  # or 'live' for production

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key

# Other Required Variables
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret
```

### Frontend Environment Variables

Add these to your frontend `.env` file:

```bash
# Payment Provider Public Keys
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key

# API URLs
VITE_API_URL=https://your-backend-url.com
```

## 📋 Provider-Specific Setup

### 1. Paystack Setup

#### Step 1: Create Paystack Account
1. Go to [Paystack Dashboard](https://dashboard.paystack.com/)
2. Sign up for a new account
3. Complete the verification process

#### Step 2: Get API Keys
1. In your Paystack dashboard, go to **Settings** → **API Keys & Webhooks**
2. Copy your **Secret Key** (for backend)
3. Copy your **Public Key** (for frontend)

#### Step 3: Configure Webhooks (Optional)
1. In Paystack dashboard, go to **Settings** → **API Keys & Webhooks**
2. Add webhook URL: `https://your-backend-url.com/api/payment/webhook/paystack`
3. Select events: `charge.success`, `subscription.create`, `subscription.disable`

### 2. M-Pesa Setup

#### Step 1: Register with Safaricom
1. Go to [Safaricom Developer Portal](https://developer.safaricom.co.ke/)
2. Create a developer account
3. Register your application

#### Step 2: Get API Credentials
1. In your developer dashboard, create a new app
2. Get your **Consumer Key** and **Consumer Secret**
3. Generate your **Passkey**
4. Get your **Business Shortcode**

#### Step 3: Configure Webhooks
1. Set up webhook URL: `https://your-backend-url.com/api/payment/webhook/mpesa`
2. Configure for STK push callbacks

#### Step 4: Test with Sandbox
1. Use sandbox environment for testing
2. Test with sandbox phone numbers
3. Switch to live environment for production

### 3. Stripe Setup

#### Step 1: Create Stripe Account
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Sign up for a new account
3. Complete the verification process

#### Step 2: Get API Keys
1. In your Stripe dashboard, go to **Developers** → **API Keys**
2. Copy your **Secret Key** (for backend)
3. Copy your **Publishable Key** (for frontend)

#### Step 3: Configure Webhooks
1. In Stripe dashboard, go to **Developers** → **Webhooks**
2. Add endpoint: `https://your-backend-url.com/api/payment/webhook/stripe`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`

## 🗄️ Database Setup

### Required Tables

The system uses these database tables:

```sql
-- Subscription Plans
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  price_weekly DECIMAL(10,2) DEFAULT 0,
  price_two_weeks DECIMAL(10,2) DEFAULT 0,
  price_monthly DECIMAL(10,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  features JSONB,
  limits JSONB,
  is_active BOOLEAN DEFAULT true,
  duration_days INTEGER DEFAULT 30,
  billing_cycle VARCHAR(20) DEFAULT 'monthly',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  reference VARCHAR(100) UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  plan_id VARCHAR(50) NOT NULL,
  provider VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  plan_id VARCHAR(50) NOT NULL,
  plan_name VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Usage Tracking
CREATE TABLE usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  feature_name VARCHAR(50) NOT NULL,
  month VARCHAR(7) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔄 Payment Flow

### 1. Provider Selection
- System automatically selects the best provider based on user's currency
- Users can manually select their preferred provider
- Priority: Paystack > M-Pesa > Stripe

### 2. Payment Initialization
```typescript
// Frontend sends payment request
const paymentData = {
  email: user.email,
  amount: convertedAmount,
  currency: userCurrency,
  plan_id: plan.name,
  provider: selectedProvider,
  metadata: { ... }
};

// Backend initializes payment with selected provider
const result = await paymentService.initialize_payment(
  email, amount, currency, reference, callback_url, provider, metadata
);
```

### 3. Payment Processing
- **Paystack**: Redirects to Paystack payment page
- **M-Pesa**: Sends STK push to user's phone
- **Stripe**: Redirects to Stripe payment page

### 4. Payment Verification
- **Webhook**: Providers send webhook notifications
- **Manual**: Frontend can verify payment status
- **Database**: Transaction status updated automatically

## 🧪 Testing

### Test Cards

#### Paystack Test Cards
- **Success**: 4084 0840 8408 4081
- **Declined**: 4084 0840 8408 4082
- **Expired**: 4084 0840 8408 4083

#### Stripe Test Cards
- **Success**: 4242 4242 4242 4242
- **Declined**: 4000 0000 0000 0002
- **Requires Authentication**: 4000 0025 0000 3155

#### M-Pesa Test Numbers
- **Sandbox**: Use sandbox phone numbers from Safaricom
- **Test Amounts**: Use small amounts (KES 1-10)

### Testing Checklist

- [ ] All providers initialize payments correctly
- [ ] Currency conversion works properly
- [ ] Webhooks are received and processed
- [ ] Transaction status updates correctly
- [ ] User subscriptions are created/updated
- [ ] Error handling works for failed payments
- [ ] Provider selection works based on currency
- [ ] M-Pesa STK push works correctly

## 🚀 Deployment

### Backend Deployment

1. **Set Environment Variables**
   ```bash
   # Add all required environment variables to your deployment platform
   PAYSTACK_SECRET_KEY=sk_live_...
   MPESA_CONSUMER_KEY=your_live_key
   STRIPE_SECRET_KEY=sk_live_...
   ```

2. **Update Webhook URLs**
   - Paystack: `https://your-domain.com/api/payment/webhook/paystack`
   - M-Pesa: `https://your-domain.com/api/payment/webhook/mpesa`
   - Stripe: `https://your-domain.com/api/payment/webhook/stripe`

3. **Database Migration**
   ```bash
   # Run database migrations
   python scripts/apply_migrations.py
   ```

### Frontend Deployment

1. **Set Environment Variables**
   ```bash
   VITE_PAYSTACK_PUBLIC_KEY=pk_live_...
   VITE_STRIPE_PUBLIC_KEY=pk_live_...
   VITE_API_URL=https://your-backend-domain.com
   ```

2. **Update Callback URLs**
   - Update all callback URLs to use production domain
   - Test payment flow in production

## 🔒 Security Considerations

### 1. API Key Security
- Never expose secret keys in frontend code
- Use environment variables for all sensitive data
- Rotate keys regularly

### 2. Webhook Security
- Verify webhook signatures (implemented in code)
- Use HTTPS for all webhook URLs
- Validate webhook data before processing

### 3. Payment Validation
- Always verify payments server-side
- Don't trust frontend payment status
- Implement proper error handling

### 4. Data Protection
- Encrypt sensitive user data
- Follow GDPR/CCPA compliance
- Implement proper logging

## 🆘 Troubleshooting

### Common Issues

1. **Provider Not Available**
   - Check environment variables are set
   - Verify API keys are correct
   - Check provider service status

2. **Currency Not Supported**
   - Verify currency is in provider's supported list
   - Check currency conversion rates
   - Update provider configuration

3. **Webhook Not Received**
   - Check webhook URL is correct
   - Verify webhook endpoint is accessible
   - Check webhook signature verification

4. **Payment Verification Failed**
   - Check transaction reference
   - Verify provider API response
   - Check database connection

### Debug Mode

Enable debug logging:

```python
# In backend/app.py
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Support

For payment provider specific issues:
- **Paystack**: [Paystack Support](https://paystack.com/support)
- **M-Pesa**: [Safaricom Developer Support](https://developer.safaricom.co.ke/support)
- **Stripe**: [Stripe Support](https://support.stripe.com/)

## 📈 Monitoring

### Key Metrics to Monitor

1. **Payment Success Rate**
   - Track successful vs failed payments
   - Monitor by provider and currency

2. **Provider Performance**
   - Response times
   - Error rates
   - Availability

3. **Revenue Tracking**
   - Monthly recurring revenue
   - Payment provider fees
   - Currency conversion costs

### Logging

Implement comprehensive logging:

```python
# Log all payment events
logger.info(f"Payment initialized: {reference}, provider: {provider}")
logger.error(f"Payment failed: {reference}, error: {error}")
```

## 🎯 Best Practices

1. **Provider Selection**
   - Use local providers when possible
   - Consider user preferences
   - Monitor provider performance

2. **Currency Handling**
   - Always convert to user's local currency
   - Show USD equivalent for transparency
   - Update exchange rates regularly

3. **Error Handling**
   - Provide clear error messages
   - Implement retry mechanisms
   - Log all errors for debugging

4. **User Experience**
   - Show payment method selection
   - Provide clear instructions
   - Handle edge cases gracefully

## 🚀 Next Steps

1. **Set up your preferred payment providers**
2. **Configure environment variables**
3. **Test the payment flow**
4. **Deploy to production**
5. **Monitor and optimize**

The multi-payment system is now ready to handle payments from users worldwide with their preferred payment methods! 