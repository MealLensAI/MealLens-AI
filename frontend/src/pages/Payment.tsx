import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/utils';
import { useSubscription } from '@/contexts/SubscriptionContext';
import paystackService, { SubscriptionPlan } from '@/services/paystackService';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Crown, 
  Zap, 
  Shield, 
  Clock, 
  Star,
  ArrowRight,
  CreditCard,
  Lock,
  Sparkles,
  Globe,
  Smartphone,
  Wallet,
  Banknote,
  Check,
  AlertTriangle
} from 'lucide-react';
import LoadingScreen from '@/components/LoadingScreen';
import InAppPayment from '@/components/InAppPayment';

const Payment: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { subscription, plans, loading, refreshSubscription } = useSubscription();
  
  // Local state
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showInAppPayment, setShowInAppPayment] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'paypal' | 'mobile_money'>('card');

  // Get current plan
  const currentPlan = subscription?.plan;

  // Handle payment processing
  const handlePayment = async (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowInAppPayment(true);
  };

  // Handle payment success
  const handlePaymentSuccess = async () => {
    setShowInAppPayment(false);
    setShowSuccess(true);
    await refreshSubscription();
    
    // Redirect to dashboard after a moment
    setTimeout(() => {
      window.location.href = '/home';
    }, 3000);
  };

  // Handle payment cancel
  const handlePaymentCancel = () => {
    setShowInAppPayment(false);
    setSelectedPlan(null);
  };

  // Handle plan selection
  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
  };

  // Get plan price
  const getPlanPrice = (plan: SubscriptionPlan) => {
    const price = billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly;
    return paystackService.formatAmount(price, plan.currency);
  };

  // Get billing period
  const getBillingPeriod = () => {
    return billingCycle === 'monthly' ? 'month' : 'year';
  };

  // Get savings for yearly billing
  const getYearlySavings = (plan: SubscriptionPlan) => {
    const monthlyTotal = plan.price_monthly * 12;
    const yearlyPrice = plan.price_yearly;
    const savings = monthlyTotal - yearlyPrice;
    return paystackService.formatAmount(savings, plan.currency);
  };

  // Loading state
  if (loading) {
    return <LoadingScreen message="Loading subscription plans..." />;
  }

  // Success state
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-[#FF6B6B]" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">
              Welcome to MealLens Pro! You now have access to all premium features.
            </p>
            <Button 
              onClick={() => window.location.href = '/home'}
              className="w-full bg-[#FF6B6B] hover:bg-[#FF5252]"
            >
              Start Using Pro Features
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <Badge className="mb-4 bg-[#FF6B6B]/10 text-[#FF6B6B] border-[#FF6B6B]/20">
            <Crown className="h-3 w-3 mr-2" />
            Choose Your Plan
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Upgrade to Pro
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Unlock unlimited AI-powered food detection, personalized recipes, and advanced meal planning.
          </p>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm border">
            <div className="flex">
              <Button
                variant={billingCycle === 'monthly' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 ${billingCycle === 'monthly' ? 'bg-[#FF6B6B] text-white' : 'text-gray-600'}`}
              >
                Monthly
              </Button>
              <Button
                variant={billingCycle === 'yearly' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 ${billingCycle === 'yearly' ? 'bg-[#FF6B6B] text-white' : 'text-gray-600'}`}
              >
                Yearly
                <Badge className="ml-2 bg-green-500 text-white text-xs">Save 20%</Badge>
              </Button>
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative transition-all duration-300 hover:shadow-xl ${
                selectedPlan?.id === plan.id ? 'ring-2 ring-[#FF6B6B] shadow-lg' : ''
              } ${plan.name === 'Pro' ? 'border-[#FF6B6B]' : 'border-gray-200'}`}
            >
              {plan.name === 'Pro' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-[#FF6B6B] text-white px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900">{plan.display_name}</CardTitle>
                <div className="text-4xl font-bold text-[#FF6B6B] mb-2">
                  {getPlanPrice(plan)}
                </div>
                <CardDescription className="text-gray-600">
                  per {getBillingPeriod()}
                </CardDescription>
                {billingCycle === 'yearly' && plan.price_yearly < plan.price_monthly * 12 && (
                  <div className="text-sm text-green-600 font-medium">
                    Save {getYearlySavings(plan)} per year
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {plan.features?.map((feature: string, index: number) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button 
                  onClick={() => handlePlanSelect(plan)}
                  className={`w-full ${
                    selectedPlan?.id === plan.id 
                      ? 'bg-[#FF6B6B] hover:bg-[#FF5252] text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  {selectedPlan?.id === plan.id ? 'Selected' : 'Choose Plan'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Payment Method Selection */}
        {selectedPlan && (
          <div className="max-w-2xl mx-auto">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Payment Method
                </CardTitle>
                <CardDescription>
                  Choose your preferred payment method
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={selectedPaymentMethod} onValueChange={(value) => setSelectedPaymentMethod(value as any)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="card" className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      <span className="hidden sm:inline">Card</span>
                    </TabsTrigger>
                    <TabsTrigger value="paypal" className="flex items-center gap-2">
                      <Wallet className="h-4 w-4" />
                      <span className="hidden sm:inline">PayPal</span>
                    </TabsTrigger>
                    <TabsTrigger value="mobile_money" className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      <span className="hidden sm:inline">Mobile Money</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="card" className="mt-6">
                    <div className="space-y-4">
                      <div className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <CreditCard className="h-6 w-6 text-blue-600 mr-3" />
                        <div>
                          <h4 className="font-medium text-blue-900">Credit/Debit Card</h4>
                          <p className="text-sm text-blue-700">Secure payment with SSL encryption</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Accepted cards:</span>
                        <div className="flex items-center gap-2">
                          <span>Visa</span>
                          <span>•</span>
                          <span>Mastercard</span>
                          <span>•</span>
                          <span>American Express</span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="paypal" className="mt-6">
                    <div className="space-y-4">
                      <div className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <Wallet className="h-6 w-6 text-blue-600 mr-3" />
                        <div>
                          <h4 className="font-medium text-blue-900">PayPal</h4>
                          <p className="text-sm text-blue-700">Pay with your PayPal account</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        You'll be redirected to PayPal to complete your payment securely.
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="mobile_money" className="mt-6">
                    <div className="space-y-4">
                      <div className="flex items-center p-4 bg-green-50 rounded-lg border border-green-200">
                        <Smartphone className="h-6 w-6 text-green-600 mr-3" />
                        <div>
                          <h4 className="font-medium text-green-900">Mobile Money</h4>
                          <p className="text-sm text-green-700">Pay with your mobile money account</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-orange-500 rounded mr-3"></div>
                          <span className="text-sm font-medium">M-Pesa</span>
                        </div>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-blue-500 rounded mr-3"></div>
                          <span className="text-sm font-medium">Airtel Money</span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{selectedPlan.display_name} Plan</span>
                    <span className="font-medium">{getPlanPrice(selectedPlan)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Billing Cycle</span>
                    <span className="font-medium capitalize">{billingCycle}</span>
                  </div>
                  {billingCycle === 'yearly' && selectedPlan.price_yearly < selectedPlan.price_monthly * 12 && (
                    <div className="flex justify-between items-center text-green-600">
                      <span>Yearly Savings</span>
                      <span className="font-medium">-{getYearlySavings(selectedPlan)}</span>
                    </div>
                  )}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>Total</span>
                      <span className="text-[#FF6B6B]">{getPlanPrice(selectedPlan)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Button */}
            <div className="space-y-4">
              <Button 
                onClick={() => handlePayment(selectedPlan)}
                className="w-full bg-[#FF6B6B] hover:bg-[#FF5252] text-white py-4 text-lg font-semibold"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5 mr-2" />
                    Pay {getPlanPrice(selectedPlan)} Securely
                  </>
                )}
              </Button>
              
              <div className="flex items-center justify-center text-sm text-gray-500">
                <Shield className="h-4 w-4 mr-2" />
                Your payment is secure and encrypted
              </div>
            </div>
          </div>
        )}

        {/* In-App Payment Modal */}
        {showInAppPayment && selectedPlan && (
          <InAppPayment
            plan={selectedPlan}
            billingCycle={billingCycle}
            paymentMethod={selectedPaymentMethod}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
          />
        )}
      </div>
    </div>
  );
};

export default Payment; 