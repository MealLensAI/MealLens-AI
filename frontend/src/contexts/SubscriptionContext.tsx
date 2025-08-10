import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/lib/utils';
import paystackService, { UserSubscription, TrialStatus, SubscriptionPlan } from '@/services/paystackService';
import { useToast } from '@/hooks/use-toast';

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
  const maxFreeUsage = 5; // 5 free uses as specified

  // Load subscription data
  const loadSubscription = async () => {
    if (!isAuthenticated || !user) return;
    
    try {
      setLoading(true);
      const [subscriptionData, plansData] = await Promise.all([
        paystackService.getUserSubscription(),
        paystackService.getSubscriptionPlans()
      ]);
      
      setSubscription(subscriptionData);
      setPlans(plansData);
      
      // Calculate trial status if user has no subscription
      if (!subscriptionData && user.created_at) {
        const trial = paystackService.calculateTrialStatus(user.created_at);
        setTrialStatus(trial);
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
      const plansData = await paystackService.getSubscriptionPlans();
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
    // If user has active subscription, they can use all features
    if (subscription?.subscription?.status === 'active') {
      return true;
    }
    
    // If user is in trial, they can use all features
    if (trialStatus?.isInTrial) {
      return true;
    }
    
    // Check specific feature limits for free users
    switch (featureName) {
      case 'food_detection':
        return freeUsageCount < maxFreeUsage; // Allow if under free limit
      case 'ingredient_detection':
        return freeUsageCount < maxFreeUsage; // Allow if under free limit
      case 'meal_planning':
        return freeUsageCount < maxFreeUsage; // Allow if under free limit
      default:
        return true; // Other features are free
    }
  };

  // Check if feature is locked
  const isFeatureLocked = (featureName: string): boolean => {
    return !canUseFeature(featureName);
  };

  // Record feature usage
  const recordFeatureUsage = async (featureName: string) => {
    if (!isAuthenticated) return;
    
    try {
      await paystackService.recordFeatureUsage(featureName);
    } catch (error) {
      console.error('Error recording feature usage:', error);
    }
  };

  // Trial management
  const getTrialDaysLeft = (): number => {
    return trialStatus?.trialDaysLeft || 0;
  };

  const isInTrial = (): boolean => {
    return trialStatus?.isInTrial || false;
  };

  const isTrialExpired = (): boolean => {
    return trialStatus?.isExpired || false;
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
      loadSubscription();
    } else {
      setSubscription(null);
      setTrialStatus(null);
    }
  }, [isAuthenticated, user]);

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
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}; 