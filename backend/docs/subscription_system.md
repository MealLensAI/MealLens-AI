# MealLens AI Subscription System

## Overview

The MealLens AI subscription system has been completely redesigned to provide a more flexible and user-friendly experience. The new system features duration-based subscriptions with clear trial periods and automatic expiration.

## Subscription Plans

### 1. Free Tier
- **Duration**: 3-day free trial + monthly reset cycle
- **Features**:
  - 3 food detections per week
  - Basic recipe suggestions
  - Nutritional information
  - Community support
- **Limitations**:
  - No meal planning
  - Limited to 5 recipe generations per week
  - Resets monthly

### 2. Weekly Plan
- **Duration**: 7 days
- **Price**: ₦2,500
- **Features**:
  - Unlimited food detections
  - Unlimited meal planning
  - Unlimited recipe generation
  - Priority support

### 3. Two-Week Plan
- **Duration**: 14 days
- **Price**: ₦4,500
- **Features**:
  - Unlimited food detections
  - Unlimited meal planning
  - Unlimited recipe generation
  - Priority support

### 4. Monthly Plan
- **Duration**: 30 days
- **Price**: ₦8,000
- **Features**:
  - Unlimited food detections
  - Unlimited meal planning
  - Unlimited recipe generation
  - Priority support

## Configuration Variables

The subscription system is highly configurable through environment variables and configuration files:

### Frontend Configuration (`frontend/src/config/subscription.ts`)

```typescript
export const SUBSCRIPTION_CONFIG = {
  // Free tier configuration
  FREE_TRIAL_DAYS: 3,
  FREE_RESET_PERIOD: 'monthly', // 'monthly' | 'weekly' | 'yearly'
  
  // Paid plan durations (in days)
  PAID_PLANS: {
    weekly: 7,
    two_weeks: 14,
    monthly: 30
  },
  
  // Feature limits for free tier
  FREE_FEATURE_LIMITS: {
    food_detection: 3,
    meal_planning: 0,
    recipe_generation: 5
  }
}
```

### Backend Configuration (`backend/config/subscription.py`)

```python
# Free tier configuration
FREE_TRIAL_DAYS = int(os.getenv('FREE_TRIAL_DAYS', '3'))
FREE_RESET_PERIOD = os.getenv('FREE_RESET_PERIOD', 'monthly')

# Paid plan durations (in days)
PAID_PLANS = {
    'weekly': 7,
    'two_weeks': 14,
    'monthly': 30
}
```

## Database Schema

### Subscription Plans Table

```sql
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE, -- 'free', 'weekly', 'two_weeks', 'monthly'
    display_name TEXT NOT NULL,
    price_monthly DECIMAL(10,2) DEFAULT 0.00,
    price_yearly DECIMAL(10,2) DEFAULT 0.00,
    features JSONB,
    limits JSONB,
    duration_days INTEGER DEFAULT 30,
    billing_cycle TEXT DEFAULT 'monthly'
);
```

### User Subscriptions Table

```sql
CREATE TABLE user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    plan_id UUID REFERENCES subscription_plans(id),
    status TEXT DEFAULT 'active',
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    free_trial_start TIMESTAMP WITH TIME ZONE,
    free_trial_end TIMESTAMP WITH TIME ZONE,
    free_tier_reset_date TIMESTAMP WITH TIME ZONE,
    free_usage_count INTEGER DEFAULT 0,
    subscription_duration_days INTEGER DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Key Features

### 1. Free Trial Management
- 3-day free trial for new users
- Full access to all features during trial
- Automatic transition to free tier after trial

### 2. Free Tier Reset
- Monthly reset cycle (configurable)
- Usage counters reset automatically
- Clear countdown display

### 3. Duration-Based Subscriptions
- Fixed duration periods (7, 14, 30 days)
- Automatic expiration
- No recurring billing (user must manually renew)

### 4. Feature Access Control
- Granular feature permissions
- Usage tracking and limits
- Automatic feature locking/unlocking

### 5. Currency Support
- Nigerian Naira (₦) pricing
- Local currency formatting
- Automatic currency conversion

## API Endpoints

### Get Subscription Plans
```
GET /api/payment/plans
```

### Get User Subscription
```
GET /api/payment/subscription
```

### Check Feature Usage
```
GET /api/payment/check-usage/{feature_name}
```

### Record Feature Usage
```
POST /api/payment/record-usage/{feature_name}
```

### Initialize Payment
```
POST /api/payment/initialize-payment
```

## Usage Tracking

### Free Tier Usage
- Weekly limits for each feature
- Automatic reset on monthly cycle
- Real-time usage display

### Paid Tier Usage
- Unlimited access during subscription period
- No usage tracking required
- Automatic access restoration on renewal

## Implementation Notes

### Frontend Integration
- React Context for subscription state management
- Real-time status updates
- Automatic feature locking/unlocking
- User-friendly status displays

### Backend Integration
- Paystack payment processing
- Automatic subscription management
- Usage tracking and enforcement
- Webhook handling for payment events

### Security Features
- JWT-based authentication
- Secure payment processing
- Usage limit enforcement
- Subscription status validation

## Migration Guide

### From Old System
1. Run database migration script
2. Update frontend configuration
3. Update backend configuration
4. Test subscription flows
5. Verify payment processing

### Environment Variables
```bash
# Free trial configuration
FREE_TRIAL_DAYS=3
FREE_RESET_PERIOD=monthly

# Payment configuration
PAYSTACK_SECRET_KEY=your_secret_key
PAYSTACK_PUBLIC_KEY=your_public_key

# Currency configuration
DEFAULT_CURRENCY=NGN
```

## Troubleshooting

### Common Issues
1. **Subscription not updating**: Check webhook configuration
2. **Usage limits not working**: Verify database triggers
3. **Payment failures**: Check Paystack configuration
4. **Feature access issues**: Verify subscription status

### Debug Endpoints
- `/api/payment/test` - Test payment system
- `/api/payment/debug/subscription/{user_id}` - Debug user subscription
- `/api/payment/debug/usage/{user_id}` - Debug usage tracking

## Future Enhancements

1. **Recurring Subscriptions**: Automatic renewal options
2. **Family Plans**: Multi-user subscriptions
3. **Usage Analytics**: Detailed usage reports
4. **Promotional Codes**: Discount and trial extensions
5. **Referral System**: User referral rewards 