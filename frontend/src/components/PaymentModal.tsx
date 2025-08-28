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
          const providersResponse = await api.get('/payment/providers');
          if (providersResponse.status === 'success') {
            setAvailableProviders(providersResponse.providers);
          }
        } catch (providerError) {
          console.warn('Could not fetch payment providers:', providerError);
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
      const response = await api.post('/payment/initialize-payment', paymentData);
      
      if (response.status === 'success') {
        // Handle different providers
        if (selectedProvider === 'mpesa') {
          // For M-Pesa, show instructions
          toast({
            title: "M-Pesa Payment",
            description: "Check your phone for M-Pesa prompt. Enter your PIN to complete payment.",
            variant: "default",
          });
          
          // Show success after a delay
          setTimeout(() => {
            setCurrentStep('success');
          }, 3000);
        } else {
          // For other providers (Paystack, Stripe), redirect to payment URL
          if (response.data?.authorization_url) {
            window.location.href = response.data.authorization_url;
          } else {
            setCurrentStep('success');
          }
        }
      } else {
        setErrorMessage(response.message || 'Payment initialization failed');
        toast({
          title: "Payment Error",
          description: response.message || 'Payment initialization failed',
          variant: "destructive",
        });
        setCurrentStep('payment');
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Upgrade to Pro</h2>
            <p className="text-sm text-gray-600">Unlock unlimited access</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentStep === 'plan' && (
            <div className="space-y-4">
              {/* Current Plan Badge */}
              {currentPlan && typeof currentPlan === 'string' && currentPlan !== 'free' && (
                <div className="text-center">
                  <Badge variant="secondary" className="text-sm">
                    Current: {APP_CONFIG.subscriptionPlans.find(p => p.name === currentPlan)?.display_name}
                  </Badge>
                </div>
              )}

              {/* Plans */}
              <div className="space-y-3">
                {paidPlans.map((plan) => (
                  <Card
                    key={plan.name}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedPlan?.name === plan.name ? 'ring-2 ring-orange-500' : ''
                    }`}
                    onClick={() => setSelectedPlan(plan)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {plan.name === 'monthly' && <Sparkles className="w-5 h-5 text-orange-500" />}
                          <div>
                            <h3 className="font-semibold">{plan.display_name}</h3>
                            <p className="text-sm text-gray-600">{getPlanDurationText(plan.billing_cycle)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-orange-500">
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
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              >
                Continue to Payment
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {currentStep === 'payment' && selectedPlan && (
            <div className="space-y-4">
              {/* Plan Summary */}
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{selectedPlan.display_name}</h3>
                      <p className="text-sm text-gray-600">{getPlanDurationText(selectedPlan.billing_cycle)}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-orange-500">
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
                <div className="space-y-3">
                  <h4 className="font-medium">Payment Method</h4>
                  <div className="space-y-2">
                    {Object.entries(providersForCurrency).map(([providerKey, provider]: [string, any]) => (
                      <Button
                        key={providerKey}
                        variant={selectedProvider === providerKey ? "default" : "outline"}
                        className={`w-full justify-start h-auto p-3 ${
                          selectedProvider === providerKey ? 'bg-orange-500 text-white' : ''
                        }`}
                        onClick={() => setSelectedProvider(providerKey)}
                      >
                        <div className="flex items-center gap-3">
                          {getProviderIcon(providerKey)}
                          <div className="text-left">
                            <div className="font-medium">{getProviderName(providerKey)}</div>
                            <div className="text-xs opacity-75">
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
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
                className="w-full"
              >
                Back to Plans
              </Button>
            </div>
          )}

          {currentStep === 'processing' && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Loader2 className="h-12 w-12 text-orange-500 animate-spin" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Processing Payment...</h3>
                <p className="text-sm text-gray-600">Please wait while we process your payment</p>
              </div>
            </div>
          )}

          {currentStep === 'success' && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Payment Successful!</h3>
                <p className="text-sm text-gray-600">Welcome to MealLens Pro!</p>
              </div>
              <Button
                onClick={onClose}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              >
                Start Using Pro Features
              </Button>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="w-4 h-4" />
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