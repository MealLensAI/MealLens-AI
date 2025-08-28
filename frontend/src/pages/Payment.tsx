import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useAuth } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, ChevronLeft, ChevronRight, Check, CreditCard, Sparkles, Loader2, XCircle, Smartphone, Globe, Phone, Shield } from 'lucide-react';
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

const Payment: React.FC = () => {
  const navigate = useNavigate();
  const { subscription } = useSubscription();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [userCurrency, setUserCurrency] = useState('USD');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [availableProviders, setAvailableProviders] = useState<any>({});
  const [currentPlanIndex, setCurrentPlanIndex] = useState(0);

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
        const providersResponse = await api.get('/payment/providers');
        if (providersResponse.status === 'success') {
          setAvailableProviders(providersResponse.providers);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setUserCurrency('USD'); // Default to USD
      }
    };

    fetchData();
  }, []);

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
          
          // Redirect to success page after a delay
          setTimeout(() => {
            navigate('/payment/success');
          }, 3000);
        } else {
          // For other providers (Paystack, Stripe), redirect to payment URL
          if (response.data?.authorization_url) {
            window.location.href = response.data.authorization_url;
          } else {
            navigate('/payment/success');
          }
        }
      } else {
        setErrorMessage(response.message || 'Payment initialization failed');
        toast({
          title: "Payment Error",
          description: response.message || 'Payment initialization failed',
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setErrorMessage(error.message || 'Payment failed');
      toast({
        title: "Payment Error",
        description: error.message || 'Payment failed',
        variant: "destructive",
      });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Choose Your Plan</h1>
            <p className="text-gray-600 mt-2">Unlock unlimited access to all features</p>
          </div>
          
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>

        {/* Current Plan Badge */}
        {currentPlan && currentPlan !== 'free' && (
          <div className="mb-6 text-center">
            <Badge variant="secondary" className="text-sm">
              Current Plan: {APP_CONFIG.subscriptionPlans.find(p => p.name === currentPlan)?.display_name}
            </Badge>
          </div>
        )}

        {/* Payment Provider Selection */}
        {Object.keys(providersForCurrency).length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Method
              </CardTitle>
              <CardDescription>
                Select your preferred payment method for {userCurrency}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(providersForCurrency).map(([providerKey, provider]: [string, any]) => (
                  <div key={providerKey} className="space-y-3">
                    <Button
                      variant={selectedProvider === providerKey ? "default" : "outline"}
                      className={`h-auto p-4 flex flex-col items-center gap-2 w-full ${
                        selectedProvider === providerKey ? 'bg-orange-500 text-white' : ''
                      }`}
                      onClick={() => setSelectedProvider(providerKey)}
                    >
                      {getProviderIcon(providerKey)}
                      <span className="font-medium">{getProviderName(providerKey)}</span>
                      <span className="text-xs opacity-75">
                        {provider.features?.slice(0, 2).join(', ')}
                      </span>
                    </Button>
                    
                    {/* Show available payment methods for selected provider */}
                    {selectedProvider === providerKey && providerKey === 'paystack' && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-medium mb-2">Available Payment Methods:</h4>
                        <div className="space-y-2">
                          {userCurrency === 'KES' && (
                            <>
                              <div className="flex items-center gap-2 text-sm">
                                <Smartphone className="w-4 h-4 text-green-600" />
                                <span>M-Pesa Mobile Money</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <CreditCard className="w-4 h-4 text-blue-600" />
                                <span>Card Payment (Visa/Mastercard)</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Globe className="w-4 h-4 text-purple-600" />
                                <span>Bank Transfer</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="w-4 h-4 text-orange-600" />
                                <span>USSD (*996#)</span>
                              </div>
                            </>
                          )}
                          {userCurrency === 'NGN' && (
                            <>
                              <div className="flex items-center gap-2 text-sm">
                                <CreditCard className="w-4 h-4 text-blue-600" />
                                <span>Card Payment (Visa/Mastercard/Verve)</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Globe className="w-4 h-4 text-purple-600" />
                                <span>Bank Transfer</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="w-4 h-4 text-orange-600" />
                                <span>USSD (*996#)</span>
                              </div>
                            </>
                          )}
                          {userCurrency === 'GHS' && (
                            <>
                              <div className="flex items-center gap-2 text-sm">
                                <Smartphone className="w-4 h-4 text-green-600" />
                                <span>Mobile Money (MTN/Vodafone)</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <CreditCard className="w-4 h-4 text-blue-600" />
                                <span>Card Payment</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Globe className="w-4 h-4 text-purple-600" />
                                <span>Bank Transfer</span>
                              </div>
                            </>
                          )}
                          {!['KES', 'NGN', 'GHS'].includes(userCurrency) && (
                            <>
                              <div className="flex items-center gap-2 text-sm">
                                <CreditCard className="w-4 h-4 text-blue-600" />
                                <span>Card Payment</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Globe className="w-4 h-4 text-purple-600" />
                                <span>Bank Transfer</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Show M-Pesa specific info */}
                    {selectedProvider === providerKey && providerKey === 'mpesa' && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                        <h4 className="text-sm font-medium mb-2 text-green-800">M-Pesa Direct Integration:</h4>
                        <div className="space-y-2 text-sm text-green-700">
                          <div className="flex items-center gap-2">
                            <Smartphone className="w-4 h-4" />
                            <span>Direct STK Push to your phone</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="w-4 h-4" />
                            <span>No redirect to external page</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            <span>Direct Safaricom integration</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Provider comparison info */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-medium mb-2 text-blue-800">💡 Payment Provider Comparison:</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p><strong>Paystack:</strong> Unified platform with M-Pesa, cards, bank transfers, and USSD - recommended for most users</p>
                  <p><strong>M-Pesa Direct:</strong> Direct Safaricom integration - best for M-Pesa-only users</p>
                  <p><strong>Stripe:</strong> Global payment processing - best for international users</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Plans Carousel */}
        <div className="relative">
          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg"
            onClick={() => setCurrentPlanIndex(Math.max(0, currentPlanIndex - 1))}
            disabled={currentPlanIndex === 0}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg"
            onClick={() => setCurrentPlanIndex(Math.min(paidPlans.length - 1, currentPlanIndex + 1))}
            disabled={currentPlanIndex === paidPlans.length - 1}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          {/* Plans */}
          <div className="flex gap-6 overflow-x-auto pb-4 px-12">
            {paidPlans.map((plan, index) => (
              <Card
                key={plan.name}
                className={`min-w-[300px] transition-all duration-300 ${
                  index === currentPlanIndex ? 'scale-105 shadow-xl' : 'opacity-75'
                }`}
              >
                <CardHeader className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    {plan.name === 'monthly' && <Sparkles className="w-5 h-5 text-orange-500 mr-2" />}
                    <CardTitle className="text-xl">{plan.display_name}</CardTitle>
                  </div>
                  <CardDescription>{getPlanDurationText(plan.billing_cycle)}</CardDescription>
                </CardHeader>
                
                <CardContent className="text-center">
                  {/* Price */}
                  <div className="mb-6">
                    <div className="text-4xl font-bold text-orange-500 mb-2">
                      {formatCurrency(
                        convertCurrency(
                          getPlanPrice(plan.name, plan.billing_cycle),
                          'USD',
                          userCurrency
                        ),
                        userCurrency
                      )}
                    </div>
                    {userCurrency !== 'USD' && plan.name !== 'free' && (
                      <p className="text-xs text-gray-500 mt-1">
                        ≈ ${getPlanPrice(plan.name, plan.billing_cycle).toFixed(2)} USD
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  {/* Payment Button */}
                  <Button
                    onClick={() => handlePayment(plan)}
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
                        {selectedProvider ? `Pay with ${getProviderName(selectedProvider)}` : 'Select Payment Method'}
                      </>
                    )}
                  </Button>

                  {/* Provider Info */}
                  {selectedProvider && (
                    <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-500">
                      {getProviderIcon(selectedProvider)}
                      <span>{getProviderName(selectedProvider)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-600">
              <XCircle className="w-4 h-4" />
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Payment Instructions */}
        {selectedProvider === 'mpesa' && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                M-Pesa Payment Instructions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <p>1. Click "Pay with M-Pesa" to initiate payment</p>
                <p>2. You'll receive an M-Pesa prompt on your phone</p>
                <p>3. Enter your M-Pesa PIN to complete the transaction</p>
                <p>4. You'll receive a confirmation SMS from M-Pesa</p>
                <p className="text-orange-600 font-medium">
                  Make sure your phone number is registered with M-Pesa
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Security Notice */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>🔒 All payments are secured with bank-level encryption</p>
          <p>💳 We support multiple payment methods for your convenience</p>
        </div>
      </div>
    </div>
  );
};

export default Payment; 