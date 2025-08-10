import React, { useState, useEffect } from 'react';
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
  Clock, 
  Star,
  ArrowRight,
  CreditCard,
  Lock,
  Sparkles
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
      window.location.href = '/';
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
              Your subscription has been activated. You now have access to all premium features.
            </p>
            <Button 
              onClick={() => window.location.href = '/'}
                              className="w-full bg-[#FF6B6B] hover:bg-[#FF5252]"
            >
              Continue to App
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (showError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-4">{errorMessage}</p>
            <div className="space-y-3">
              <Button 
                onClick={() => setShowError(false)}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                Try Again
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="w-full"
              >
                Back to App
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] rounded-2xl flex items-center justify-center">
              <Crown className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Unlock the full potential of MealLensAI with our premium subscription plans
          </p>
        </div>

        {/* Current Subscription Status */}
        {currentPlan && (
          <div className="mb-8">
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <CheckCircle className="h-6 w-6 text-[#FF6B6B]" />
                    <div>
                      <h3 className="font-semibold text-green-800">
                        Current Plan: {currentPlan.display_name}
                      </h3>
                      <p className="text-sm text-green-600">
                        Active until {subscription?.subscription?.current_period_end ? 
                          new Date(subscription.subscription.current_period_end).toLocaleDateString() : 
                          'Unknown'
                        }
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Billing Cycle Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl p-1 shadow-sm border">
            <div className="flex">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-lg font-medium transition-all relative ${
                  billingCycle === 'yearly'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Yearly
                <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-1 py-0.5">
                  Save 20%
                </Badge>
              </button>
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => {
            const isCurrentPlan = currentPlan?.id === plan.id;
            const isPopular = plan.name === 'premium';
            
            return (
              <Card 
                key={plan.id}
                className={`relative transition-all duration-200 hover:shadow-lg ${
                  isCurrentPlan ? 'ring-2 ring-green-500 bg-green-50' : 
                  isPopular ? 'ring-2 ring-blue-500' : 'hover:ring-2 hover:ring-gray-300'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] text-white px-3 py-1">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-[#FF6B6B] text-white px-3 py-1">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Current Plan
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {plan.display_name}
                  </CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">
                      {getPlanPrice(plan)}
                    </span>
                    <span className="text-gray-500 ml-2">/{getBillingPeriod()}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Features */}
                  <div className="space-y-3">
                    {Object.entries(plan.features).map(([feature, enabled]) => (
                      <div key={feature} className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          enabled ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          {enabled ? (
                            <CheckCircle className="h-3 w-3 text-[#FF6B6B]" />
                          ) : (
                            <XCircle className="h-3 w-3 text-gray-400" />
                          )}
                        </div>
                        <span className={`text-sm ${
                          enabled ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={() => isCurrentPlan ? null : handlePayment(plan)}
                    disabled={isCurrentPlan || isProcessing}
                    className={`w-full py-3 font-semibold ${
                      isCurrentPlan
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] hover:from-[#FF5252] hover:to-[#FF6B6B] text-white shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : isCurrentPlan ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Current Plan
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Subscribe Now
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Features Comparison */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              What's Included
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-[#FF6B6B]" />
                </div>
                <h3 className="font-semibold text-lg mb-2">AI Food Detection</h3>
                <p className="text-gray-600 text-sm">
                  Advanced AI-powered food recognition with detailed nutritional information
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Crown className="h-6 w-6 text-[#FF6B6B]" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Smart Meal Planning</h3>
                <p className="text-gray-600 text-sm">
                  Personalized meal plans based on your preferences and health goals
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-[#FF6B6B]" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Health Tracking</h3>
                <p className="text-gray-600 text-sm">
                  Comprehensive health monitoring and dietary recommendations
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trust Indicators */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-8 text-gray-500 text-sm">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Privacy Protected</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Cancel Anytime</span>
            </div>
          </div>
        </div>
      </div>

      {/* In-App Payment Modal */}
      {showInAppPayment && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <InAppPayment
              plan={selectedPlan}
              billingCycle={billingCycle}
              onSuccess={handlePaymentSuccess}
              onCancel={handlePaymentCancel}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Payment; 