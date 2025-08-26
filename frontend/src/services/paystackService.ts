import { api } from '@/lib/api';
import { APP_CONFIG, getPlanPrice, getPlanDisplayName, getPlanDurationText, getPlanFeatures } from '@/lib/config';

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
  price_two_weeks: number;
  price_monthly: number;
  currency: string;
  features: string[];
  limits: Record<string, any>;
  is_active: boolean;
  duration_days: number;
  billing_cycle: 'trial' | 'weekly' | 'two_weeks' | 'monthly';
}

export interface UserSubscription {
  subscription: {
    id: string;
    status: 'active' | 'inactive' | 'cancelled' | 'trial' | 'expired';
    current_period_start: string;
    current_period_end: string;
    trial_end?: string;
  };
  plan: SubscriptionPlan;
  usage: Record<string, any>;
  free_trial_start?: string;
  free_trial_end?: string;
  free_tier_reset_date?: string;
  free_usage_count?: number;
  subscription_duration_days?: number;
}

export interface TrialStatus {
  isInTrial: boolean;
  trialDaysLeft: number;
  trialEndDate: string;
  isExpired: boolean;
}

class PaystackService {
  private publicKey: string;

  // Use centralized subscription plans configuration
  private get subscriptionPlans(): SubscriptionPlan[] {
    return APP_CONFIG.subscriptionPlans;
  }

  constructor() {
    // Initialize with your Paystack public key
    this.publicKey = APP_CONFIG.paystack.public_key;
  }

  /**
   * Initialize a payment transaction with retry mechanism
   */
  async initializePayment(config: PaystackConfig): Promise<PaymentResponse> {
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await api.post('/payment/initialize-payment', {
        email: config.email,
        amount: config.amount,
        currency: config.currency,
        reference: config.reference,
        callback_url: config.callback_url,
        plan_id: config.metadata?.plan_id,
        metadata: config.metadata
      });

      return response;
      } catch (error: any) {
        lastError = error;
        console.warn(`Payment initialization attempt ${attempt} failed:`, error.message);
        
        // If it's the last attempt, throw the error
        if (attempt === maxRetries) {
          break;
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }

    console.error('All payment initialization attempts failed');
    throw new Error('Failed to initialize payment after multiple attempts');
  }

  /**
   * Process payment in-app (without external redirects)
   */
  async processInAppPayment(paymentData: {
    plan_id: string;
    amount: number;
    currency: string;
    billing_cycle: string;
    payment_method: string;
    card_data: any;
    customer: any;
  }): Promise<any> {
    try {
      const response = await api.post('/payment/process-in-app', paymentData);
      return response;
    } catch (error) {
      console.error('Error processing in-app payment:', error);
      throw new Error('Failed to process payment');
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
   * Get currency conversion rate from USD to local currency
   */
  async getCurrencyConversion(fromCurrency: string = 'USD', toCurrency: string): Promise<number> {
    try {
      // For now, return a fixed conversion rate
      // In production, this would call a currency conversion API
      const conversionRates: Record<string, number> = {
        'NGN': 1500, // 1 USD = 1500 NGN (approximate)
        'EUR': 0.85,
        'GBP': 0.75,
        'CAD': 1.35,
        'AUD': 1.50,
        'JPY': 150,
        'INR': 83,
        'BRL': 5.0,
        'MXN': 17.0,
        'ZAR': 18.0,
        'KRW': 1300,
        'SGD': 1.35,
        'HKD': 7.8,
        'CHF': 0.9,
        'SEK': 10.5,
        'NOK': 10.8,
        'DKK': 6.9,
        'PLN': 4.0,
        'CZK': 23.0,
        'HUF': 350,
        'RON': 4.6,
        'BGN': 1.8,
        'HRK': 6.7,
        'RUB': 95,
        'TRY': 30,
        'ILS': 3.7,
        'AED': 3.67,
        'SAR': 3.75,
        'QAR': 3.64,
        'KWD': 0.31,
        'BHD': 0.38,
        'OMR': 0.38,
        'JOD': 0.71,
        'LBP': 15000,
        'EGP': 31,
        'MAD': 10.0,
        'TND': 3.1,
        'DZD': 135,
        'LYD': 4.8,
        'SDG': 600,
        'ETB': 55,
        'KES': 160,
        'UGX': 3800,
        'TZS': 2500,
        'MWK': 1700,
        'ZMW': 25,
        'BWP': 13.5,
        'NAD': 18,
        'SZL': 18,
        'LSL': 18,
        'MUR': 45,
        'SCR': 13.5,
        'CDF': 2500,
        'GMD': 65,
        'GHS': 12,
        'XOF': 600,
        'XAF': 600,
        'XPF': 110,
        'KMF': 450,
        'MGA': 4500,
        'BIF': 2000,
        'RWF': 1200,
        'DJF': 180,
        'SOS': 570,
        'ERN': 15,
        'STD': 22000,
        'CVE': 100
      };
      
      return conversionRates[toCurrency] || 1;
    } catch (error) {
      console.error('Error getting currency conversion:', error);
      return 1; // Fallback to 1:1 conversion
    }
  }

  /**
   * Get user's local currency based on browser locale or IP
   */
  async getUserLocalCurrency(): Promise<string> {
    try {
      // Try to get currency from browser locale
      const locale = navigator.language || 'en-US';
      const currencyMap: Record<string, string> = {
        'en-US': 'USD',
        'en-GB': 'GBP',
        'en-CA': 'CAD',
        'en-AU': 'AUD',
        'fr-FR': 'EUR',
        'fr-CA': 'CAD',
        'de-DE': 'EUR',
        'es-ES': 'EUR',
        'es-MX': 'MXN',
        'pt-BR': 'BRL',
        'pt-PT': 'EUR',
        'it-IT': 'EUR',
        'nl-NL': 'EUR',
        'sv-SE': 'SEK',
        'no-NO': 'NOK',
        'da-DK': 'DKK',
        'fi-FI': 'EUR',
        'pl-PL': 'PLN',
        'cs-CZ': 'CZK',
        'hu-HU': 'HUF',
        'ro-RO': 'RON',
        'bg-BG': 'BGN',
        'hr-HR': 'HRK',
        'ru-RU': 'RUB',
        'tr-TR': 'TRY',
        'he-IL': 'ILS',
        'ar-SA': 'SAR',
        'ar-AE': 'AED',
        'ar-QA': 'QAR',
        'ar-KW': 'KWD',
        'ar-BH': 'BHD',
        'ar-OM': 'OMR',
        'ar-JO': 'JOD',
        'ar-LB': 'LBP',
        'ar-EG': 'EGP',
        'ar-MA': 'MAD',
        'ar-TN': 'TND',
        'ar-DZ': 'DZD',
        'ar-LY': 'LYD',
        'ar-SD': 'SDG',
        'ar-ET': 'ETB',
        'ar-KE': 'KES',
        'ar-UG': 'UGX',
        'ar-TZ': 'TZS',
        'ar-MW': 'MWK',
        'ar-ZM': 'ZMW',
        'ar-BW': 'BWP',
        'ar-NA': 'NAD',
        'ar-SZ': 'SZL',
        'ar-LS': 'LSL',
        'ar-MU': 'MUR',
        'ar-SC': 'SCR',
        'ar-CD': 'CDF',
        'ar-GM': 'GMD',
        'ar-GH': 'GHS',
        'ar-NG': 'NGN',
        'ar-BF': 'XOF',
        'ar-CM': 'XAF',
        'ar-PF': 'XPF',
        'ar-KM': 'KMF',
        'ar-MG': 'MGA',
        'ar-BI': 'BIF',
        'ar-RW': 'RWF',
        'ar-DJ': 'DJF',
        'ar-SO': 'SOS',
        'ar-ER': 'ERN',
        'ar-ST': 'STD',
        'ar-CV': 'CVE',
        'ar-GN': 'GNF',
        'ar-LR': 'LRD',
        'ar-SL': 'SLL',
        'ja-JP': 'JPY',
        'ko-KR': 'KRW',
        'zh-CN': 'CNY',
        'zh-TW': 'TWD',
        'zh-HK': 'HKD',
        'th-TH': 'THB',
        'vi-VN': 'VND',
        'id-ID': 'IDR',
        'ms-MY': 'MYR',
        'tl-PH': 'PHP',
        'hi-IN': 'INR',
        'bn-IN': 'INR',
        'ta-IN': 'INR',
        'te-IN': 'INR',
        'mr-IN': 'INR',
        'gu-IN': 'INR',
        'kn-IN': 'INR',
        'ml-IN': 'INR',
        'pa-IN': 'INR',
        'or-IN': 'INR',
        'as-IN': 'INR',
        'ne-NP': 'NPR',
        'si-LK': 'LKR',
        'my-MM': 'MMK',
        'km-KH': 'KHR',
        'lo-LA': 'LAK',
        'mn-MN': 'MNT',
        'ka-GE': 'GEL',
        'hy-AM': 'AMD',
        'az-AZ': 'AZN',
        'uz-UZ': 'UZS',
        'tg-TJ': 'TJS',
        'tk-TM': 'TMT',
        'fa-IR': 'IRR',
        'ps-AF': 'AFN',
        'ur-PK': 'PKR',
        'bn-BD': 'BDT'
      };
      
      return currencyMap[locale] || 'USD';
    } catch (error) {
      console.error('Error getting user local currency:', error);
      return 'USD';
    }
  }

  /**
   * Get subscription plans with USD pricing
   */
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      // Return the local subscription plans configuration
      return this.subscriptionPlans;
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
      const response = await api.post(`/payment/record-usage/${featureName}`, { 
        feature: featureName,
        timestamp: new Date().toISOString()
      });
      return response;
    } catch (error) {
      console.error('Error recording feature usage:', error);
      // Don't throw error, just log it to avoid breaking the main functionality
      return { success: false, error };
    }
  }

  /**
   * Calculate trial status using configurable trial duration
   */
  calculateTrialStatus(createdAt: string): TrialStatus {
    const createdDate = new Date(createdAt);
    const trialDays = 7; // Updated from 3 to 7 days
    const trialEndDate = new Date(createdDate.getTime() + (trialDays * 24 * 60 * 60 * 1000));
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
   * Calculate free tier reset date
   */
  calculateFreeTierResetDate(lastResetDate?: string): Date {
    const baseDate = lastResetDate ? new Date(lastResetDate) : new Date();
    const resetDate = new Date(baseDate);
    
    // Monthly reset by default
    resetDate.setMonth(baseDate.getMonth() + 1);
    
    return resetDate;
  }

  /**
   * Check if free tier has reset
   */
  isFreeTierReset(freeTierResetDate?: string): boolean {
    if (!freeTierResetDate) return true;
    const resetDate = new Date(freeTierResetDate);
    const now = new Date();
    return now >= resetDate;
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
   * Get plan price by billing cycle
   */
  getPlanPrice(planId: string, billingCycle: 'weekly' | 'two_weeks' | 'monthly'): number {
    const plan = this.subscriptionPlans.find(p => p.id === planId);
    if (!plan) return 0;
    
    switch (billingCycle) {
      case 'weekly':
        return plan.price_weekly;
      case 'two_weeks':
        return plan.price_two_weeks;
      case 'monthly':
        return plan.price_monthly;
      default:
        return plan.price_monthly;
    }
  }

  /**
   * Get plan display name
   */
  getPlanDisplayName(planId: string): string {
    const plan = this.subscriptionPlans.find(p => p.id === planId);
    return plan?.display_name || 'Unknown Plan';
  }

  /**
   * Get plan duration text
   */
  getPlanDurationText(billingCycle: 'weekly' | 'two_weeks' | 'monthly'): string {
    switch (billingCycle) {
      case 'weekly':
        return '7 days';
      case 'two_weeks':
        return '14 days';
      case 'monthly':
        return '30 days';
      default:
        return '30 days';
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
  formatAmount(amount: number, currency: string = 'USD'): string {
    const formatter = new Intl.NumberFormat('en-US', {
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