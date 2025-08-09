import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/utils';
import { api } from '@/lib/api';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import LoadingScreen from '@/components/LoadingScreen';

interface SubscriptionPlan {
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

interface PaymentModalData {
  name: string;
  email: string;
  plan: SubscriptionPlan;
  billing: 'weekly' | 'monthly' | 'yearly';
}

const FEATURES = [
  'MealLensAI meal planner',
  'MealLensAI cooked Food detection and cooking instructions',
  'MealLensAI Ingredient detection with cooking instructions',
  'Share your cooked meals with friends',
];

const Payment: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [billing, setBilling] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [userSubscription, setUserSubscription] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userCurrency, setUserCurrency] = useState<string>('NGN');
  
  const { toast } = useToast();
  const { user } = useAuth();

  // Load subscription plans from backend
  useEffect(() => {
    const loadPlans = async () => {
      try {
        setLoadingPlans(true);
        const response = await api.get('/payment/plans');
        if (response.status === 'success') {
          setPlans(response.plans || []);
        } else {
          toast({
            title: "Error",
            description: "Failed to load subscription plans",
            variant: "destructive",
          });
        }
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

    loadPlans();
  }, [toast]);

  // Load user profile and detect currency
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;
      
      try {
        const response = await api.get('/profile');
        if (response.status === 'success' && response.profile) {
          setUserProfile(response.profile);
          // Auto-detect currency from profile
          const profileCurrency = response.profile.currency || 'NGN';
          setUserCurrency(profileCurrency);
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        // Fallback to default currency
        setUserCurrency('NGN');
      }
    };

    loadUserProfile();
  }, [user]);

  // Load user's current subscription
  useEffect(() => {
    const loadUserSubscription = async () => {
      if (!user) return;
      
      try {
        const response = await api.get('/payment/subscription');
        if (response.status === 'success') {
          setUserSubscription(response.subscription);
        }
      } catch (error) {
        console.error('Error loading user subscription:', error);
      }
    };

    loadUserSubscription();
  }, [user]);

  // Initialize Paystack script
  useEffect(() => {
    if (!document.getElementById('paystack-script')) {
      const script = document.createElement('script');
      script.id = 'paystack-script';
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const openPaymentModal = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setEmail(user?.email || '');
    const userMetadata = (user as any)?.user_metadata;
    setName(`${userMetadata?.first_name || ''} ${userMetadata?.last_name || ''}`.trim());
    setShowModal(true);
  };

  const processPayment = async () => {
    if (!name || !email || !selectedPlan) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Initialize payment with backend
      const amount = billing === 'monthly' ? selectedPlan.price_monthly : selectedPlan.price_yearly;
      
      const paymentData = {
        email: email,
        amount: amount * 100, // Convert to kobo (smallest currency unit)
        plan_id: selectedPlan.id,
        callback_url: `${window.location.origin}/payment/success`,
        metadata: {
          name: name,
          plan_name: selectedPlan.name,
          billing_period: billing
        }
      };

      const response = await api.post('/payment/initialize-payment', paymentData);
      
      if (response.status === 'success') {
        // Use Paystack to process payment
    // @ts-ignore
    const handler = window.PaystackPop && window.PaystackPop.setup({
      key: 'pk_live_5f7de652daf3ea53dc685902c5f28f0a2063bc33',
      email: email,
          amount: amount * 100, // cents
          currency: userCurrency,
          ref: response.data.reference,
      metadata: {
        custom_fields: [
          {
            display_name: 'Name',
            variable_name: 'name',
            value: name,
          },
          {
            display_name: 'Plan',
            variable_name: 'plan',
                value: selectedPlan.display_name,
          },
        ],
      },
          callback: async function (response: any) {
            try {
              // Verify payment with backend
              const verifyResponse = await api.get(`/payment/verify-payment/${response.reference}`);
              
              if (verifyResponse.status === 'success') {
                toast({
                  title: "Success!",
                  description: "Payment successful! Your subscription has been activated.",
                  variant: "default",
                });
                
                // Reload user subscription
                const subResponse = await api.get('/payment/subscription');
                if (subResponse.status === 'success') {
                  setUserSubscription(subResponse.subscription);
                }
                
        setShowModal(false);
        setName('');
        setEmail('');
        setSelectedPlan(null);
              } else {
                toast({
                  title: "Error",
                  description: "Payment verification failed. Please contact support.",
                  variant: "destructive",
                });
              }
            } catch (error) {
              console.error('Payment verification error:', error);
              toast({
                title: "Error",
                description: "Payment verification failed. Please contact support.",
                variant: "destructive",
              });
            }
      },
      onClose: function () {
            toast({
              title: "Payment Cancelled",
              description: "Transaction was not completed.",
              variant: "destructive",
            });
      },
    });
        
    if (handler) handler.openIframe();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to initialize payment",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentPlan = () => {
    if (!userSubscription) return null;
    return plans.find(plan => plan.id === userSubscription.plan?.id);
  };

  const currentPlan = getCurrentPlan();

  if (loadingPlans) {
    return (
      <LoadingScreen 
        message="Loading subscription plans..."
        subMessage="Fetching available plans and pricing"
        showLogo={true}
        size="lg"
        fullScreen={true}
      />
    );
  }

  return (
    <section className="w-full min-h-screen flex flex-col items-center justify-center bg-[#f5f5f5] py-8">
      <div className="max-w-2xl mx-auto text-center mb-8">
        <h2 className="text-4xl font-bold mb-2 text-gray-900">Plans & Pricing</h2>
        <p className="text-gray-600 mb-6">Choose the plan that fits your needs. All plans include essential features to get you started, with options to scale as you grow. No hidden fees and the flexibility to change anytime.</p>
        
        {currentPlan && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-800 font-medium">
                Current Plan: {currentPlan.display_name}
              </span>
            </div>
            {userSubscription?.subscription?.current_period_end && (
              <p className="text-sm text-green-600 mt-1">
                Renews on {new Date(userSubscription.subscription.current_period_end).toLocaleDateString()}
              </p>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-center gap-2 mb-2">
          <button
            className={`px-6 py-2 rounded-full font-semibold transition-colors ${billing === 'weekly' ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setBilling('weekly')}
          >
            Weekly
          </button>
          <button
            className={`px-6 py-2 rounded-full font-semibold transition-colors ${billing === 'monthly' ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setBilling('monthly')}
          >
            Monthly
          </button>
          <button
            className={`px-6 py-2 rounded-full font-semibold transition-colors ${billing === 'yearly' ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setBilling('yearly')}
          >
            Yearly
          </button>
        </div>
        {billing === 'yearly' && (
          <div className="text-blue-600 text-sm font-medium">Save 20% with annual billing!</div>
        )}
      </div>
      
      <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch w-full max-w-5xl">
                       {plans.map((plan) => {
                         const price = billing === 'weekly' ? plan.price_weekly : 
                                     billing === 'monthly' ? plan.price_monthly : 
                                     plan.price_yearly;
                         const isCurrentPlan = currentPlan?.id === plan.id;
                         const isPopular = plan.name === 'annual';
                         
                         return (
            <Card
              key={plan.id}
              className={`flex-1 flex flex-col justify-between items-center p-8 bg-white shadow-lg rounded-2xl border border-gray-200 relative ${
                isPopular ? 'ring-2 ring-yellow-400' : ''
              } ${isCurrentPlan ? 'ring-2 ring-green-400' : ''}`}
            >
              {isPopular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-yellow-400 text-xs font-bold px-4 py-1 rounded-full shadow">
                  Most Popular
                </div>
              )}
              {isCurrentPlan && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-green-400 text-xs font-bold px-4 py-1 rounded-full shadow">
                  Current Plan
                </div>
              )}
              
              <div className="mb-2 text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">{plan.display_name}</div>
                                               <div className="text-3xl font-bold text-gray-900 mb-1">
                                 {userCurrency === 'NGN' ? '₦' : userCurrency === 'USD' ? '$' : userCurrency === 'EUR' ? '€' : ''}{price?.toLocaleString() || '0'}
                               </div>
                               <div className="text-gray-500 text-sm mb-4">
                                 Billed {billing === 'weekly' ? 'weekly' : billing === 'monthly' ? 'monthly' : 'yearly'}
                               </div>
              </div>
              
              <ul className="mb-6 w-full text-gray-700 text-left space-y-2">
                {plan.features && Object.entries(plan.features).map(([feature, enabled]) => (
                  <li key={feature} className="flex items-center gap-2">
                    <span className={`inline-block w-4 h-4 rounded-full mr-2 flex-shrink-0 ${
                      enabled ? 'bg-green-400' : 'bg-gray-300'
                    }`}></span>
                    {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </li>
                ))}
              </ul>
              
              <Button
                className={`w-full text-lg font-semibold rounded-lg py-3 mt-auto ${
                  isCurrentPlan 
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
                onClick={() => !isCurrentPlan && openPaymentModal(plan)}
                disabled={isCurrentPlan || isLoading}
              >
                {isCurrentPlan ? 'Current Plan' : 'Select plan'}
              </Button>
            </Card>
          );
        })}
      </div>
      
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Your Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Name</label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#FF6B6B] focus:outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Email</label>
              <input
                type="email"
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#FF6B6B] focus:outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
              />
            </div>
            <div className="text-lg font-semibold text-[#2D3436]">
                               Plan: <span className="text-[#FF6B6B]">{selectedPlan?.display_name}</span>
                             </div>
                             <div className="text-sm text-gray-600">
                               Amount: ₦{(billing === 'weekly' ? selectedPlan?.price_weekly : 
                                          billing === 'monthly' ? selectedPlan?.price_monthly : 
                                          selectedPlan?.price_yearly)?.toLocaleString() || '0'} 
                               ({billing === 'weekly' ? 'weekly' : billing === 'monthly' ? 'monthly' : 'yearly'})
            </div>
          </div>
          <DialogFooter>
            <Button 
              className="w-full mt-4" 
              onClick={processPayment}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                'Pay with Paystack'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Payment; 