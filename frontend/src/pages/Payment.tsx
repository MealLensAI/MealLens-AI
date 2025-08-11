import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  ArrowLeft,
  CreditCard,
  Lock,
  Sparkles,
  Star
} from 'lucide-react';
import LoadingScreen from '@/components/LoadingScreen';

const Payment: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { subscription, plans, loading, refreshSubscription } = useSubscription();
  
  // Local state
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Get current plan
  const currentPlan = subscription?.plan;

  // Handle payment processing
  const handlePayment = async (plan: SubscriptionPlan) => {
    if (!user?.email) {
      toast({
        title: "Error",
        description: "Please log in to make a payment",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      const reference = paystackService.generateReference();
      
      const paymentConfig = {
        publicKey: paystackService.getPublicKey(),
        email: user.email,
        amount: plan.price_monthly * 100, // Paystack expects amount in kobo
        currency: plan.currency || 'USD',
        reference: reference,
        callback_url: `${window.location.origin}/payment/success`,
        metadata: {
          plan_id: plan.id,
          user_id: user.id
        }
      };

      const response = await paystackService.initializePayment(paymentConfig);
      
      if (response.status === 'success' && response.data?.authorization_url) {
        // Redirect to Paystack payment page
        window.location.href = response.data.authorization_url;
      } else {
        throw new Error(response.message || 'Failed to initialize payment');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Payment failed. Please try again.');
      setShowError(true);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle plan selection
  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
  };

  // Loading state
  if (loading) {
    return <LoadingScreen message="Loading subscription plans..." />;
  }

  // Error state
  if (showError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-6">
              {errorMessage || 'There was an issue processing your payment. Please try again.'}
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => {
                  setShowError(false);
                  setErrorMessage('');
                }}
                className="w-full bg-[#FF6B6B] hover:bg-[#FF5252]"
              >
                Try Again
              </Button>
              <Button 
                onClick={() => navigate('/home')}
                variant="outline"
                className="w-full"
              >
                Go to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <Button
            onClick={() => navigate('/home')}
            variant="ghost"
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          
          <Badge className="mb-4 bg-[#FF6B6B]/10 text-[#FF6B6B] border-[#FF6B6B]/20">
            <Crown className="h-3 w-3 mr-2" />
            Upgrade to Pro
          </Badge>
          
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Unlock unlimited AI-powered food detection, advanced meal planning, and premium features
          </p>
        </div>

        {/* Current Plan Warning */}
        {currentPlan && (
          <div className="mb-8">
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-orange-600 mr-3" />
                  <div>
                    <p className="font-medium text-orange-900">
                      You currently have an active {currentPlan.display_name} plan
                    </p>
                    <p className="text-sm text-orange-700">
                      Your new plan will replace your current subscription
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12">
          {plans.map((plan) => (
            <Card 
              key={plan.id}
              className={`relative transition-all duration-300 hover:shadow-xl cursor-pointer ${
                selectedPlan?.id === plan.id ? 'ring-2 ring-[#FF6B6B] shadow-lg' : ''
              }`}
              onClick={() => handlePlanSelect(plan)}
            >
              {/* Popular Badge */}
              {plan.name === 'pro' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-[#FF6B6B] text-white px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900">{plan.display_name}</CardTitle>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-[#FF6B6B]">
                    ${plan.price_monthly}
                  </span>
                  <span className="text-gray-600 ml-1">/month</span>
                </div>
                <CardDescription className="text-gray-600">
                  Billed monthly • Cancel anytime
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {Array.isArray(plan.features) ? (
                    plan.features.map((feature: string, index: number) => (
                      <div key={index} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </div>
                    ))
                  ) : (
                    // Fallback features if plan.features is not an array
                    [
                      'Unlimited AI-powered food detection',
                      'Personalized recipe suggestions',
                      'Advanced meal planning tools',
                      'Priority customer support'
                    ].map((feature: string, index: number) => (
                      <div key={index} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </div>
                    ))
                  )}
                </div>
                
                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlanSelect(plan);
                  }}
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

        {/* Payment Section */}
        {selectedPlan && (
          <div className="max-w-2xl mx-auto">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Complete Your Purchase
                </CardTitle>
                <CardDescription>
                  Secure payment powered by Paystack
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Plan Summary */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{selectedPlan.display_name} Plan</span>
                      <span className="font-semibold text-[#FF6B6B]">${selectedPlan.price_monthly}/month</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      You'll be redirected to our secure payment processor to complete your purchase.
                    </p>
                  </div>

                  {/* Payment Methods Info */}
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center mb-2">
                      <CreditCard className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="font-medium text-blue-900">Secure Payment</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      We accept all major credit cards, debit cards, and mobile money payments through Paystack.
                    </p>
                  </div>

                  {/* Payment Button */}
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
                        Pay ${selectedPlan.price_monthly} Securely
                      </>
                    )}
                  </Button>
                  
                  <div className="flex items-center justify-center text-sm text-gray-500">
                    <Shield className="h-4 w-4 mr-2" />
                    Your payment is secure and encrypted
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payment; 