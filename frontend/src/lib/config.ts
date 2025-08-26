// Centralized configuration for MealLens AI
export const APP_CONFIG = {
  // App Information
  name: 'MealLens AI',
  description: 'Your AI-powered food detection and meal planning assistant',
  version: '1.0.0',
  
  // Brand Colors
  colors: {
    primary: '#FF6B35', // Orange
    secondary: '#1A1A1A', // Black
    white: '#FFFFFF',
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827'
    }
  },

  // Subscription Plans - Centralized pricing
  subscriptionPlans: [
    {
      id: 'weekly',
      name: 'weekly',
      display_name: 'Weekly',
      price_weekly: 2.50,
      price_two_weeks: 5.00,
      price_monthly: 10.00,
      currency: 'USD',
      features: [
        'Unlimited Food Detection',
        'Unlimited AI Kitchen Assistant',
        'Unlimited Meal Planning',
        'Full History Access',
        'Priority Support'
      ],
      limits: {
        detections_per_day: -1, // Unlimited
        meal_plans_per_month: -1, // Unlimited
        ai_kitchen_requests: -1 // Unlimited
      },
      is_active: true,
      duration_days: 7,
      billing_cycle: 'weekly'
    },
    {
      id: 'two_weeks',
      name: 'two_weeks',
      display_name: 'Two Weeks',
      price_weekly: 2.50,
      price_two_weeks: 5.00,
      price_monthly: 10.00,
      currency: 'USD',
      features: [
        'Unlimited Food Detection',
        'Unlimited AI Kitchen Assistant',
        'Unlimited Meal Planning',
        'Full History Access',
        'Priority Support'
      ],
      limits: {
        detections_per_day: -1, // Unlimited
        meal_plans_per_month: -1, // Unlimited
        ai_kitchen_requests: -1 // Unlimited
      },
      is_active: true,
      duration_days: 14,
      billing_cycle: 'two_weeks'
    },
    {
      id: 'monthly',
      name: 'monthly',
      display_name: 'Monthly',
      price_weekly: 2.50,
      price_two_weeks: 5.00,
      price_monthly: 10.00,
      currency: 'USD',
      features: [
        'Unlimited Food Detection',
        'Unlimited AI Kitchen Assistant',
        'Unlimited Meal Planning',
        'Full History Access',
        'Priority Support'
      ],
      limits: {
        detections_per_day: -1, // Unlimited
        meal_plans_per_month: -1, // Unlimited
        ai_kitchen_requests: -1 // Unlimited
      },
      is_active: true,
      duration_days: 30,
      billing_cycle: 'monthly'
    }
  ],

  // Features
  features: {
    food_detection: {
      name: 'Food Detection',
      description: 'Identify food items from photos instantly',
      icon: 'Camera',
      trial_limit: 5
    },
    ingredient_detection: {
      name: 'AI Kitchen Assistant',
      description: 'Get recipe suggestions and cooking instructions',
      icon: 'ChefHat',
      trial_limit: 5
    },
    meal_planning: {
      name: 'Meal Planning',
      description: 'Create personalized meal plans',
      icon: 'Calendar',
      trial_limit: 3
    },
    history: {
      name: 'History',
      description: 'Track your food discoveries and recipes',
      icon: 'History',
      trial_limit: -1 // Unlimited during trial
    }
  },

  // Trial Configuration
  trial: {
    duration_days: 7, // Updated from 3 to 7 days
    features_unlocked: true
  },

  // API Configuration
  api: {
    base_url: import.meta.env.VITE_API_URL || 'https://meallens-ai-cmps.onrender.com',
    timeout: 30000
  },

  // Paystack Configuration
  paystack: {
    public_key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_...',
    currency: 'USD'
  }
};

// Helper functions
export const getPlanPrice = (planId: string, billingCycle: string): number => {
  const plan = APP_CONFIG.subscriptionPlans.find(p => p.id === planId);
  if (!plan) return 0;
  
  switch (billingCycle) {
    case 'weekly':
      return plan.price_weekly;
    case 'two_weeks':
      return plan.price_two_weeks;
    case 'monthly':
      return plan.price_monthly;
    default:
      return plan.price_weekly;
  }
};

export const getPlanDisplayName = (planId: string): string => {
  const plan = APP_CONFIG.subscriptionPlans.find(p => p.id === planId);
  return plan?.display_name || planId;
};

export const getPlanDurationText = (billingCycle: string): string => {
  switch (billingCycle) {
    case 'weekly':
      return 'per week';
    case 'two_weeks':
      return 'per 2 weeks';
    case 'monthly':
      return 'per month';
    default:
      return 'per week';
  }
};

export const getPlanFeatures = (planId: string): string[] => {
  const plan = APP_CONFIG.subscriptionPlans.find(p => p.id === planId);
  return plan?.features || [];
};
