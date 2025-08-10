import { api } from '@/lib/api';

export interface PaystackConfig {
  publicKey: string;
  email: string;
  amount: number;
  currency: string;
  reference: string;
  callback_url: string;
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  status: 'success' | 'error';
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  display_name: string;
  price_weekly: number;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  features: Record<string, any>;
  limits: Record<string, any>;
  is_active: boolean;
}

export interface UserSubscription {
  subscription: {
    id: string;
    status: 'active' | 'inactive' | 'cancelled' | 'trial';
    current_period_start: string;
    current_period_end: string;
    trial_end?: string;
  };
  plan: SubscriptionPlan;
  usage: Record<string, any>;
}

export interface TrialStatus {
  isInTrial: boolean;
  trialDaysLeft: number;
  trialEndDate: string;
  isExpired: boolean;
}

class PaystackService {
  private publicKey: string;

  constructor() {
    // Initialize with your Paystack public key
    this.publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_...';
  }

  /**
   * Initialize a payment transaction
   */
  async initializePayment(config: PaystackConfig): Promise<PaymentResponse> {
    try {
      const response = await api.post('/payment/initialize-payment', {
        email: config.email,
        amount: config.amount,
        currency: config.currency,
        reference: config.reference,
        callback_url: config.callback_url,
        metadata: config.metadata
      });

      return response;
    } catch (error) {
      console.error('Error initializing payment:', error);
      throw new Error('Failed to initialize payment');
    }
  }

  /**
   * Verify a payment transaction
   */
  async verifyPayment(reference: string): Promise<any> {
    try {
      const response = await api.get(`/payment/verify-payment/${reference}`);
      return response;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw new Error('Failed to verify payment');
    }
  }

  /**
   * Get subscription plans
   */
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      const response = await api.get('/payment/plans');
      if (response.status === 'success') {
        return response.plans || [];
      }
      throw new Error(response.message || 'Failed to load plans');
    } catch (error) {
      console.error('Error loading subscription plans:', error);
      throw new Error('Failed to load subscription plans');
    }
  }

  /**
   * Get user subscription status
   */
  async getUserSubscription(): Promise<UserSubscription | null> {
    try {
      const response = await api.get('/payment/subscription');
      if (response.status === 'success') {
        return response.subscription;
      }
      return null;
    } catch (error) {
      console.error('Error loading user subscription:', error);
      return null;
    }
  }

  /**
   * Check feature usage
   */
  async checkFeatureUsage(featureName: string): Promise<any> {
    try {
      const response = await api.get(`/payment/check-usage/${featureName}`);
      return response;
    } catch (error) {
      console.error('Error checking feature usage:', error);
      throw new Error('Failed to check feature usage');
    }
  }

  /**
   * Record feature usage
   */
  async recordFeatureUsage(featureName: string): Promise<any> {
    try {
      const response = await api.post(`/payment/record-usage/${featureName}`);
      return response;
    } catch (error) {
      console.error('Error recording feature usage:', error);
      throw new Error('Failed to record feature usage');
    }
  }

  /**
   * Calculate trial status
   */
  calculateTrialStatus(createdAt: string): TrialStatus {
    const createdDate = new Date(createdAt);
    const trialEndDate = new Date(createdDate.getTime() + (3 * 24 * 60 * 60 * 1000)); // 3 days
    const now = new Date();
    
    const isInTrial = now < trialEndDate;
    const trialDaysLeft = Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));
    const isExpired = !isInTrial;

    return {
      isInTrial,
      trialDaysLeft,
      trialEndDate: trialEndDate.toISOString(),
      isExpired
    };
  }

  /**
   * Check if user can use a feature
   */
  async canUseFeature(featureName: string): Promise<boolean> {
    try {
      const usageResponse = await this.checkFeatureUsage(featureName);
      return usageResponse.can_use || false;
    } catch (error) {
      console.error('Error checking feature access:', error);
      return false;
    }
  }

  /**
   * Get Paystack public key
   */
  getPublicKey(): string {
    return this.publicKey;
  }

  /**
   * Format currency amount
   */
  formatAmount(amount: number, currency: string = 'NGN'): string {
    const formatter = new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return formatter.format(amount);
  }

  /**
   * Generate payment reference
   */
  generateReference(): string {
    return `ML_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const paystackService = new PaystackService();
export default paystackService; 