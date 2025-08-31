import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/lib/utils';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { APP_CONFIG, getPlanPrice, getPlanDisplayName, getPlanDurationText } from '@/lib/config';

// Define types locally since we removed paystackService
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
  billing_cycle: string;
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
}

export interface TrialStatus {
  is_in_trial: boolean;
  trial_end?: string;
  days_remaining?: number;
}

interface SubscriptionContextType {
  // Subscription state
  subscription: UserSubscription | null;
  plans: SubscriptionPlan[];
  trialStatus: TrialStatus | null;
  
  // Loading states
  loading: boolean;
  loadingPlans: boolean;
  
  // Feature access
  canUseFeature: (featureName: string) => boolean;
  isFeatureLocked: (featureName: string) => boolean;
  
  // Free usage tracking
  freeUsageCount: number;
  maxFreeUsage: number;
  incrementFreeUsage: () => void;
  resetFreeUsage: () => void;
  
  // Actions
  refreshSubscription: () => Promise<void>;
  refreshPlans: () => Promise<void>;
  recordFeatureUsage: (featureName: string) => Promise<void>;
  
  // Trial management
  getTrialDaysLeft: () => number;
  isInTrial: () => boolean;
  isTrialExpired: () => boolean;
  
  // Subscription date tracking
  getSubscriptionStartDate: () => Date | null;
  getSubscriptionEndDate: () => Date | null;
  getDaysUntilExpiry: () => number;
  isSubscriptionExpired: () => boolean;
  
  // Enhanced subscription status
  getFreeTrialEndDate: () => Date | null;
  getFreeTierResetDate: () => Date | null;
  getDaysUntilFreeTierReset: () => number;
  isFreeTierReset: () => boolean;
  getCurrentPlanDuration: () => number;
  getPlanDisplayName: (planName: string) => string;
  getPlanDurationText: (planName: string) => string;
  getPlanPrice: (planId: string, billingCycle: 'weekly' | 'two_weeks' | 'monthly') => number;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  // State
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(false);
  
  // Free usage tracking
  const [freeUsageCount, setFreeUsageCount] = useState(0);
  const maxFreeUsage = 3; // 3 detections per week for free tier
  
  // Production mode - enable proper usage tracking
  const TESTING_MODE_FREE_USAGE = false; // Set to false to re-enable free usage limits

  // Load subscription data
  const loadSubscription = async () => {
    if (!isAuthenticated || !user) return;
    
    try {
      setLoading(true);
      
      // Try to load subscription data, but don't fail if payment endpoints are not available
      let subscriptionData = null;
      let plansData = [];
      
      try {
        const [subResponse, plansResponse] = await Promise.all([
          api.getUserSubscription(),
          api.getSubscriptionPlans()
        ]);
        
        subscriptionData = subResponse;
        plansData = plansResponse;
      } catch (paymentError) {
        console.warn('Payment endpoints not available, using fallback:', paymentError);
        // Use fallback data
        subscriptionData = null;
        plansData = APP_CONFIG.subscriptionPlans;
      }
      
      setSubscription(subscriptionData);
      setPlans(plansData);
      
      // Calculate trial status if user has no subscription
      if (!subscriptionData && (user as any).created_at) {
        // Trial status will be calculated in useEffect to avoid setState during render
        setTrialStatus(null);
      }
    } catch (error) {
      console.error('Error loading subscription data:', error);
      toast({
        title: "Error",
        description: "Failed to load subscription information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load plans only
  const loadPlans = async () => {
    try {
      setLoadingPlans(true);
              const plansData = await api.getSubscriptionPlans();
      setPlans(plansData);
    } catch (error) {
      console.error('Error loading plans:', error);
      toast({
        title: "Error",
        description: "Failed to load subscription plans",
        variant: "destructive",
      });
    } finally {
      setLoadingPlans(false);
    }
  };

  // Free usage management
  const incrementFreeUsage = () => {
    // TEMPORARY: Skip free usage tracking in testing mode
    if (TESTING_MODE_FREE_USAGE) {
      return;
    }
    
    setFreeUsageCount(prev => {
      const newCount = Math.min(prev + 1, maxFreeUsage);
      localStorage.setItem('freeUsageCount', newCount.toString());
      return newCount;
    });
  };

  const resetFreeUsage = () => {
    setFreeUsageCount(0);
    localStorage.removeItem('freeUsageCount');
  };

  // Load free usage count from localStorage
  useEffect(() => {
    const savedCount = localStorage.getItem('freeUsageCount');
    if (savedCount) {
      setFreeUsageCount(parseInt(savedCount, 10));
    }
  }, []);

  // Check if user can use a feature
  const canUseFeature = (featureName: string): boolean => {
    // TEMPORARY: Allow all features during testing
    const TESTING_MODE = true; // Set to false to re-enable limits
    if (TESTING_MODE) {
      return true;
    }
    
    // If user has active subscription, they can use all features
    if (subscription?.subscription?.status === 'active') {
      return true;
    }
    
    // Check if user is in trial period (first 3 days from first detection)
    const trialStartDate = localStorage.getItem('trialStartDate');
    if (trialStartDate) {
      const trialStart = new Date(trialStartDate);
      const now = new Date();
      const trialDaysElapsed = Math.floor((now.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24));
      
      // Production trial period - 3 days from first detection
      const trialDays = 3; // 3 days trial period
      
      // If within trial days of first detection, allow access to all features
      if (trialDaysElapsed < trialDays) {
        return true;
      }
    }
    
    // After trial period, check if user has free usage remaining
    if (freeUsageCount < maxFreeUsage) {
      return true;
    }
    
    // All features are locked for free users after trial and free usage
    return false;
  };

  // Check if feature is locked - ensure this is defined before context value
  const isFeatureLocked = (featureName: string): boolean => {
    return !canUseFeature(featureName);
  };

  // Record feature usage
  const recordFeatureUsage = async (featureName: string) => {
    if (!isAuthenticated) return;
    
    try {
      // Start trial on first feature usage if not already started
      const trialStartDate = localStorage.getItem('trialStartDate');
      if (!trialStartDate) {
        localStorage.setItem('trialStartDate', new Date().toISOString());
        console.log('Trial started for user on first feature usage');
      }
      
      // Set a timeout for the API call
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 10000); // 10 second timeout
      });
      
              const usagePromise = api.recordFeatureUsage(featureName);
      
      await Promise.race([usagePromise, timeoutPromise]);
      
      // Refresh subscription data after recording usage
      await refreshSubscription();
    } catch (error: any) {
      // Handle various error types gracefully
      if (error?.status === 403 || error?.message?.includes('Usage limit exceeded') || error?.message?.includes('Access denied')) {
        console.warn('Usage recording blocked by backend (403), continuing with feature:', featureName);
        // Continue with feature usage even if backend blocks recording
        return;
      }
      if (error?.message?.includes('timeout') || error?.message?.includes('Request timeout')) {
        console.warn('Feature usage recording timed out, continuing without recording:', featureName);
        return;
      }
      console.error('Error recording feature usage:', error);
      // Don't throw error to prevent breaking the main flow
    }
  };

  // Trial management
  const getTrialDaysLeft = (): number => {
    const trialStartDate = localStorage.getItem('trialStartDate');
    if (trialStartDate) {
      const trialStart = new Date(trialStartDate);
      const now = new Date();
      const trialDaysElapsed = Math.floor((now.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24));
      return Math.max(0, 3 - trialDaysElapsed);
    }
    return 0;
  };

  const isInTrial = (): boolean => {
    const trialStartDate = localStorage.getItem('trialStartDate');
    if (trialStartDate) {
      const trialStart = new Date(trialStartDate);
      const now = new Date();
      const trialDaysElapsed = Math.floor((now.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24));
      return trialDaysElapsed < 3;
    }
    return false;
  };

  const isTrialExpired = (): boolean => {
    const trialStartDate = localStorage.getItem('trialStartDate');
    if (trialStartDate) {
      const trialStart = new Date(trialStartDate);
      const now = new Date();
      const trialDaysElapsed = Math.floor((now.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24));
      return trialDaysElapsed >= 3;
    }
    return false;
  };

  // Subscription date tracking
  const getSubscriptionStartDate = (): Date | null => {
    if (!subscription?.subscription?.current_period_start) return null;
    return new Date(subscription.subscription.current_period_start);
  };

  const getSubscriptionEndDate = (): Date | null => {
    if (!subscription?.subscription?.current_period_end) return null;
    return new Date(subscription.subscription.current_period_end);
  };

  const getDaysUntilExpiry = (): number => {
    const endDate = getSubscriptionEndDate();
    if (!endDate) return 0;
    
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const isSubscriptionExpired = (): boolean => {
    return getDaysUntilExpiry() <= 0;
  };

  // Enhanced subscription status methods
  const getFreeTrialEndDate = (): Date | null => {
    if (!subscription?.free_trial_end) return null;
    return new Date(subscription.free_trial_end);
  };

  const getFreeTierResetDate = (): Date | null => {
    if (!subscription?.free_tier_reset_date) return null;
    return new Date(subscription.free_tier_reset_date);
  };

  const getDaysUntilFreeTierReset = (): number => {
    const resetDate = getFreeTierResetDate();
    if (!resetDate) return 0;
    
    const now = new Date();
    const diffTime = resetDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const isFreeTierReset = (): boolean => {
    const resetDate = getFreeTierResetDate();
    if (!resetDate) return true;
    const now = new Date();
    return now >= resetDate;
  };

  const getCurrentPlanDuration = (): number => {
    return subscription?.subscription_duration_days || 30;
  };

  const getLocalPlanDisplayName = (planName: string): string => {
    return getPlanDisplayName(planName);
  };

  const getLocalPlanDurationText = (planName: string): string => {
    return getPlanDurationText(planName);
  };

  const getLocalPlanPrice = (planId: string, billingCycle: 'weekly' | 'two_weeks' | 'monthly'): number => {
    return getPlanPrice(planId, billingCycle);
  };

  // Refresh subscription data
  const refreshSubscription = async () => {
    await loadSubscription();
  };

  // Refresh plans
  const refreshPlans = async () => {
    await loadPlans();
  };

  // Load data when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      // Skip subscription loading for admin users
      if (user.role === 'admin') {
        setSubscription(null);
        setTrialStatus(null);
        return;
      }
      loadSubscription();
    } else {
      setSubscription(null);
      setTrialStatus(null);
    }
  }, [isAuthenticated, user]);

  // Calculate trial status when user changes
  useEffect(() => {
    if (isAuthenticated && user && (user as any).created_at && !subscription) {
      // Skip trial calculation for admin users
      if (user.role === 'admin') {
        setTrialStatus(null);
        return;
      }
      
      const userCreatedAt = new Date((user as any).created_at);
      const now = new Date();
      const trialDaysElapsed = Math.floor((now.getTime() - userCreatedAt.getTime()) / (1000 * 60 * 60 * 24));
      
      const trial: TrialStatus = {
        isInTrial: trialDaysElapsed < 3,
        trialDaysLeft: Math.max(0, 3 - trialDaysElapsed),
        trialEndDate: new Date(userCreatedAt.getTime() + (3 * 24 * 60 * 60 * 1000)).toISOString(),
        isExpired: trialDaysElapsed >= 3
      };
      
      setTrialStatus(trial);
    }
  }, [isAuthenticated, user, subscription]);

  const value: SubscriptionContextType = {
    subscription,
    plans,
    trialStatus,
    loading,
    loadingPlans,
    canUseFeature,
    isFeatureLocked,
    freeUsageCount,
    maxFreeUsage,
    incrementFreeUsage,
    resetFreeUsage,
    refreshSubscription,
    refreshPlans,
    recordFeatureUsage,
    getTrialDaysLeft,
    isInTrial,
    isTrialExpired,
    getSubscriptionStartDate,
    getSubscriptionEndDate,
    getDaysUntilExpiry,
    isSubscriptionExpired,
    getFreeTrialEndDate,
    getFreeTierResetDate,
    getDaysUntilFreeTierReset,
    isFreeTierReset,
    getCurrentPlanDuration,
    getPlanDisplayName: getLocalPlanDisplayName,
    getPlanDurationText: getLocalPlanDurationText,
    getPlanPrice: getLocalPlanPrice,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}; 

export default SubscriptionProvider; 