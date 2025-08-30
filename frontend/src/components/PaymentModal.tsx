import React, { useState, useEffect } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useAuth } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { X, Check, CreditCard, Sparkles, Loader2, XCircle, Smartphone, Globe, Phone, Shield, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { 
  APP_CONFIG, 
  convertCurrency, 
  formatCurrency, 
  getCurrencyInfo,
  getAvailableProviders,
  getProvidersForCurrency,
  getBestProviderForCurrency,
  getPlanPrice,
  getPlanDurationText,
  getPlanFeatures
} from '@/lib/config';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan?: any;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, selectedPlan: initialSelectedPlan }) => {
  const { subscription } = useSubscription();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [userCurrency, setUserCurrency] = useState('USD');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [availableProviders, setAvailableProviders] = useState<any>({});
  const [currentStep, setCurrentStep] = useState<'plan' | 'payment' | 'processing' | 'success'>('plan');
  const [selectedPlan, setSelectedPlan] = useState<any>(initialSelectedPlan);

  // Update selectedPlan when initialSelectedPlan changes
  useEffect(() => {
    if (initialSelectedPlan) {
      setSelectedPlan(initialSelectedPlan);
      setCurrentStep('payment'); // Skip plan selection if plan is pre-selected
    }
  }, [initialSelectedPlan]);

  // Get current plan
  const currentPlan = subscription?.plan;

  // Fetch user profile and available payment providers
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user profile
        const profileResponse = await api.getUserProfile();
        if (profileResponse.status === 'success' && profileResponse.profile) {
          setUserProfile(profileResponse.profile);
          setUserCurrency(profileResponse.profile.currency || 'USD');
        }

        // Fetch available payment providers from backend
        try {
          // Since there's no specific method for providers, we'll use a fallback
          setAvailableProviders({
            paystack: {
              name: 'Paystack',
              currencies: ['USD', 'NGN', 'GHS', 'ZAR', 'KES'],
              features: ['Card Payment', 'Bank Transfer', 'Mobile Money']
            }
          });
        } catch (providerError) {
          console.warn('Could not fetch payment providers, using fallback:', providerError);
          // Use default providers if API fails
          setAvailableProviders({
            paystack: {
              name: 'Paystack',
              currencies: ['USD', 'NGN', 'GHS', 'ZAR', 'KES'],
              features: ['Card Payment', 'Bank Transfer', 'Mobile Money']
            }
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setUserCurrency('USD'); // Default to USD
        // Set default providers
        setAvailableProviders({
          paystack: {
            name: 'Paystack',
            currencies: ['USD', 'NGN', 'GHS', 'ZAR', 'KES'],
            features: ['Card Payment', 'Bank Transfer', 'Mobile Money']
          }
        });
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  // Set best provider for user's currency
  useEffect(() => {
    if (userCurrency && availableProviders) {
      const bestProvider = getBestProviderForCurrency(userCurrency);
      setSelectedProvider(bestProvider);
    }
  }, [userCurrency, availableProviders]);

  // Handle payment processing
  const handlePayment = async (plan: any) => {
    if (!user?.email) {
      toast({
        title: "Error",
        description: "Please log in to make a payment",
        variant: "destructive",
      });
      return;
    }

    // Don't process payment for free plan
    if (plan.price_monthly === 0) {
      toast({
        title: "Free Plan",
        description: "You're already on the free plan! No payment required.",
        variant: "default",
      });
      return;
    }

    // Check if provider is selected
    if (!selectedProvider) {
      toast({
        title: "No Payment Method",
        description: "No payment method available for your currency. Please contact support.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');
    setCurrentStep('processing');

    try {
      // Get the correct price based on plan billing cycle
      let usdAmount: number;
      switch (plan.billing_cycle) {
        case 'weekly':
          usdAmount = plan.price_weekly;
          break;
        case 'two_weeks':
          usdAmount = plan.price_two_weeks;
          break;
        case 'monthly':
          usdAmount = plan.price_monthly;
          break;
        default:
          usdAmount = plan.price_monthly; // Default to monthly
      }
      
      // Convert to user's currency
      const convertedAmount = convertCurrency(usdAmount, 'USD', userCurrency);
      
      // Prepare payment data
      const paymentData = {
        email: user.email,
        amount: convertedAmount,
        currency: userCurrency,
        plan_id: plan.name,
        provider: selectedProvider,
        metadata: {
          original_usd_amount: usdAmount,
          converted_amount: convertedAmount,
          user_currency: userCurrency,
          plan_name: plan.display_name,
          billing_cycle: plan.billing_cycle
        }
      };

      // Initialize payment
      try {
        const response = await api.initializePayment(paymentData);
        
        if (response.status === 'success' || response.status === true) {
          // Handle different providers
          if (selectedProvider === 'mpesa') {
            // For M-Pesa, show instructions and wait for actual completion
            toast({
              title: "M-Pesa Payment",
              description: "Check your phone for M-Pesa prompt. Enter your PIN to complete payment.",
              variant: "default",
            });
            
            // Poll for payment status instead of auto-success
            // For M-Pesa, redirect to payment URL or show instructions
            if (response.authorization_url) {
              window.location.href = response.authorization_url;
            } else {
              setErrorMessage('M-Pesa payment URL not received. Please try again.');
              setCurrentStep('payment');
            }
          } else {
            // For other providers (Paystack, Stripe), redirect to payment URL
            if (response.authorization_url) {
              // For mobile devices, redirect directly
              if (window.innerWidth <= 768) {
                // Store payment info for redirect handling
                localStorage.setItem('pendingPayment', JSON.stringify({
                  reference: response.reference,
                  plan: selectedPlan.name,
                  amount: convertedAmount,
                  currency: userCurrency
                }));
                
                // Redirect to Paystack
                window.location.href = response.authorization_url;
              } else {
                // For desktop, try to open popup
                const paymentWindow = window.open(response.authorization_url, '_blank', 'width=600,height=700');
                
                if (paymentWindow) {
                  toast({
                    title: "Payment Initiated",
                    description: "Please complete your payment in the new window.",
                    variant: "default",
                  });
                  
                  // Monitor payment window
                  const checkClosed = setInterval(() => {
                    if (paymentWindow.closed) {
                      clearInterval(checkClosed);
                      // Payment window was closed - check if payment was successful
                      setTimeout(() => {
                        // Refresh subscription status
                        window.location.reload();
                      }, 1000);
                    }
                  }, 1000);
                  
                  // Timeout after 10 minutes
                  setTimeout(() => {
                    if (!paymentWindow.closed) {
                      paymentWindow.close();
                    }
                    clearInterval(checkClosed);
                  }, 600000);
                } else {
                  // Popup blocked - redirect directly
                  localStorage.setItem('pendingPayment', JSON.stringify({
                    reference: response.reference,
                    plan: selectedPlan.name,
                    amount: convertedAmount,
                    currency: userCurrency
                  }));
                  
                  window.location.href = response.authorization_url;
                }
              }
            } else {
              setErrorMessage('Payment URL not received. Please try again.');
              setCurrentStep('payment');
            }
          }
        } else {
          throw new Error(response.message || 'Payment initialization failed');
        }
      } catch (paymentError) {
        console.error('Payment initialization failed:', paymentError);
        
        // Show error message for payment failure
        toast({
          title: "Payment Failed",
          description: "Unable to initialize payment. Please check your internet connection and try again.",
          variant: "destructive",
        });
        
        setErrorMessage('Payment initialization failed. Please try again.');
        setCurrentStep('payment');
        
        // Redirect to failure page after a delay
        setTimeout(() => {
          window.location.href = '/payment/failure?reason=initialization_failed';
        }, 2000);
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setErrorMessage(error.message || 'Payment failed');
      toast({
        title: "Payment Error",
        description: error.message || 'Payment failed',
        variant: "destructive",
      });
      setCurrentStep('payment');
    } finally {
      setIsProcessing(false);
    }
  };

  // Get available plans (exclude free plan for payment page)
  const paidPlans = APP_CONFIG.subscriptionPlans.filter(plan => plan.name !== 'free');

  // Get providers for current currency
  const providersForCurrency = getProvidersForCurrency(userCurrency);

  const getProviderIcon = (providerName: string) => {
    switch (providerName) {
      case 'mpesa':
        return <Smartphone className="w-5 h-5" />;
      case 'paystack':
        return <CreditCard className="w-5 h-5" />;
      case 'stripe':
        return <Globe className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  const getProviderName = (providerName: string) => {
    switch (providerName) {
      case 'mpesa':
        return 'M-Pesa';
      case 'paystack':
        return 'Paystack';
      case 'stripe':
        return 'Stripe';
      default:
        return providerName;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-[9999] animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto transform transition-all duration-500 scale-100 mx-2 sm:mx-4 animate-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-8 border-b border-gray-100">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Upgrade to Pro</h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Unlock unlimited access</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 sm:h-10 sm:w-10 rounded-full hover:bg-gray-100"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-8">
          {currentStep === 'plan' && (
            <div className="space-y-6">
              {/* Current Plan Badge */}
              {currentPlan && typeof currentPlan === 'string' && currentPlan !== 'free' && (
                <div className="text-center">
                  <Badge variant="secondary" className="text-sm px-4 py-2">
                    Current: {APP_CONFIG.subscriptionPlans.find(p => p.name === currentPlan)?.display_name}
                  </Badge>
                </div>
              )}

              {/* Plans */}
              <div className="space-y-3 sm:space-y-4">
                {paidPlans.map((plan) => (
                  <Card
                    key={plan.name}
                    className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                      selectedPlan?.name === plan.name ? 'ring-2 ring-orange-500 bg-orange-50' : ''
                    }`}
                    onClick={() => setSelectedPlan(plan)}
                  >
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 sm:gap-4">
                          {plan.name === 'monthly' && <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />}
                          <div>
                            <h3 className="font-semibold text-base sm:text-lg">{plan.display_name}</h3>
                            <p className="text-xs sm:text-sm text-gray-600">{getPlanDurationText(plan.billing_cycle)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg sm:text-xl font-bold text-orange-500">
                            {formatCurrency(
                              convertCurrency(
                                getPlanPrice(plan.name, plan.billing_cycle),
                                'USD',
                                userCurrency
                              ),
                              userCurrency
                            )}
                          </div>
                          {userCurrency !== 'USD' && (
                            <p className="text-xs text-gray-500">
                              ≈ ${getPlanPrice(plan.name, plan.billing_cycle).toFixed(2)} USD
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Continue Button */}
              <Button
                onClick={() => setCurrentStep('payment')}
                disabled={!selectedPlan}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 sm:py-3 text-base font-semibold min-h-[44px]"
              >
                Continue to Payment
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </Button>
            </div>
          )}

          {currentStep === 'payment' && selectedPlan && (
            <div className="space-y-6">
              {/* Plan Summary */}
              <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{selectedPlan.display_name}</h3>
                      <p className="text-sm text-gray-600">{getPlanDurationText(selectedPlan.billing_cycle)}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-orange-600">
                        {formatCurrency(
                          convertCurrency(
                            getPlanPrice(selectedPlan.name, selectedPlan.billing_cycle),
                            'USD',
                            userCurrency
                          ),
                          userCurrency
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Provider Selection */}
              {Object.keys(providersForCurrency).length > 0 && (
                <div className="space-y-3 sm:space-y-4">
                  <h4 className="font-medium text-base sm:text-lg text-gray-900">Payment Method</h4>
                  <div className="space-y-2 sm:space-y-3">
                    {Object.entries(providersForCurrency).map(([providerKey, provider]: [string, any]) => (
                      <Button
                        key={providerKey}
                        variant={selectedProvider === providerKey ? "default" : "outline"}
                        className={`w-full justify-start h-auto p-3 sm:p-4 text-left transition-all duration-200 min-h-[44px] ${
                          selectedProvider === providerKey 
                            ? 'bg-orange-500 text-white border-orange-500 shadow-lg' 
                            : 'hover:border-orange-300 hover:bg-orange-50'
                        }`}
                        onClick={() => setSelectedProvider(providerKey)}
                      >
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className={`p-2 rounded-lg ${selectedProvider === providerKey ? 'bg-white bg-opacity-20' : 'bg-orange-100'}`}>
                            {getProviderIcon(providerKey)}
                          </div>
                          <div>
                            <div className="font-medium text-sm sm:text-base">{getProviderName(providerKey)}</div>
                            <div className="text-xs sm:text-sm opacity-75">
                              {provider.features?.slice(0, 2).join(', ')}
                            </div>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Button */}
              <Button
                onClick={() => handlePayment(selectedPlan)}
                disabled={isProcessing || !selectedProvider}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 sm:py-4 text-base font-semibold shadow-lg min-h-[44px]"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Pay {formatCurrency(
                      convertCurrency(
                        getPlanPrice(selectedPlan.name, selectedPlan.billing_cycle),
                        'USD',
                        userCurrency
                      ),
                      userCurrency
                    )} with {getProviderName(selectedProvider || '')}
                  </>
                )}
              </Button>

              {/* Back Button */}
              <Button
                variant="outline"
                onClick={() => setCurrentStep('plan')}
                className="w-full py-3"
              >
                Back to Plans
              </Button>
            </div>
          )}

          {currentStep === 'processing' && (
            <div className="text-center space-y-6 py-8">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Processing Payment...</h3>
                <p className="text-sm text-gray-600 mt-2">Please wait while we process your payment</p>
              </div>
            </div>
          )}

          {currentStep === 'success' && (
            <div className="text-center space-y-6 py-8">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Payment Successful!</h3>
                <p className="text-sm text-gray-600 mt-2">Welcome to MealLens Pro!</p>
              </div>
              <Button
                onClick={onClose}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 text-base font-semibold"
              >
                Start Using Pro Features
              </Button>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-3 text-red-600">
                <XCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{errorMessage}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal; 