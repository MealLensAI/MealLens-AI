import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/utils';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Crown, Star, Zap, Shield, Clock, Users, ArrowRight, ArrowLeft, ChevronLeft, ChevronRight, Check, CreditCard, Sparkles, Loader2, XCircle } from 'lucide-react';
import { paystackService } from '@/services/paystackService';
import { useToast } from '@/hooks/use-toast';
import LoadingScreen from '@/components/LoadingScreen';
import { APP_CONFIG, getPlanPrice, getPlanDisplayName, getPlanDurationText, getPlanFeatures, convertCurrency, formatCurrency, getCurrencyInfo } from '@/lib/config';

const Payment: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { 
    subscription, 
    plans, 
    loading, 
    refreshSubscription,
    getPlanDisplayName,
    getPlanDurationText,
    getDaysUntilFreeTierReset,
    isFreeTierReset,
    getFreeTrialEndDate,
    getDaysUntilExpiry,
    isSubscriptionExpired
  } = useSubscription();
  
  // Local state
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [userCurrency, setUserCurrency] = useState('USD');
  const [userProfile, setUserProfile] = useState<any>(null);

  // Get current plan
  const currentPlan = subscription?.plan;

  // Fetch user profile to get currency preference
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.getUserProfile();
        if (response.status === 'success' && response.profile) {
          setUserProfile(response.profile);
          setUserCurrency(response.profile.currency || 'USD');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setUserCurrency('USD'); // Default to USD
      }
    };

    fetchUserProfile();
  }, []);

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

    setIsProcessing(true);
    setErrorMessage('');

    try {
      const reference = paystackService.generateReference();
      
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
      const amountInCents = Math.round(convertedAmount * 100); // Convert to cents
      
      const paymentData = {
        email: user.email,
        amount: amountInCents,
        currency: userCurrency,
        reference: reference,
        callback_url: `${window.location.origin}/payment-success`,
        metadata: {
          plan_id: plan.id,
          plan_name: plan.name,
          user_id: user.id,
          original_usd_amount: usdAmount,
          converted_amount: convertedAmount
        }
      };

      const response = await paystackService.initializePayment(paymentData);
      
      if (response.status) {
        window.location.href = response.data.authorization_url;
      } else {
        throw new Error(response.message || 'Payment initialization failed');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Payment failed. Please try again.';
      if (error.message?.includes('timeout')) {
        errorMessage = 'Payment request timed out. Please check your connection and try again.';
      } else if (error.message?.includes('500') || error.message?.includes('Internal Server Error')) {
        errorMessage = 'Server error. Please try again in a few moments.';
      } else if (error.message?.includes('currency')) {
        errorMessage = 'Currency configuration error. Please contact support.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrorMessage(errorMessage);
      setShowError(true);
      
      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getLocalPlanFeatures = (planName: string) => {
    return getPlanFeatures(planName);
  };

  const getPlanStyle = (planName: string) => {
    switch (planName) {
      case 'free':
        return { icon: <Star className="w-6 h-6" />, color: 'text-gray-600 bg-gray-100' };
      case 'weekly':
        return { icon: <Zap className="w-6 h-6" />, color: 'text-orange-600 bg-orange-100' };
      case 'two_weeks':
        return { icon: <Crown className="w-6 h-6" />, color: 'text-orange-600 bg-orange-100' };
      case 'monthly':
        return { icon: <Sparkles className="w-6 h-6" />, color: 'text-orange-600 bg-orange-100' };
      default:
        return { icon: <Star className="w-6 h-6" />, color: 'text-gray-600 bg-gray-100' };
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % plans.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + plans.length) % plans.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  if (loading) {
    return <LoadingScreen size="lg" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
          </div>
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Choose Your Plan</h1>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
              Unlock the full potential of MealLensAI with our flexible subscription plans. 
              All plans are billed in USD.
            </p>
          </div>
        </div>

        {/* Subscription Status Section */}
        <div className="mb-6 sm:mb-8">
          {currentPlan && currentPlan.name !== 'free' ? (
            // Paid subscription status
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Current Plan: {getPlanDisplayName(currentPlan.name)}
                </span>
              </div>
              <div className="text-center space-y-1">
                <p className="text-xs text-green-700">
                  {isSubscriptionExpired() ? (
                    <span className="text-red-600 font-medium">Subscription expired</span>
                  ) : (
                    <span>Active until {getDaysUntilExpiry()} days remaining</span>
                  )}
                </p>
                <p className="text-xs text-green-600">
                  Duration: {getPlanDurationText(currentPlan.name)}
                </p>
              </div>
            </div>
          ) : (
            // Free tier status
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Free Plan Status</span>
              </div>
              <div className="text-center space-y-1">
                <p className="text-xs text-blue-700">
                  {getFreeTrialEndDate() && new Date() < getFreeTrialEndDate()! ? (
                    <span>Free trial active - {getDaysUntilExpiry()} days left</span>
                  ) : (
                    <span>Free tier - {getDaysUntilFreeTierReset()} days until reset</span>
                  )}
                </p>
                <p className="text-xs text-blue-600">
                  3 detections per week • Resets monthly
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Plans Carousel */}
        <div className="max-w-4xl mx-auto mb-8">
          {/* Carousel Container */}
          <div className="relative">
            {/* Navigation Arrows */}
            <Button
              onClick={prevSlide}
              variant="ghost"
              size="sm"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white shadow-md rounded-full w-10 h-10 p-0"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <Button
              onClick={nextSlide}
              variant="ghost"
              size="sm"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white shadow-md rounded-full w-10 h-10 p-0"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>

            {/* Plans Container */}
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {plans.map((plan) => {
                  const isCurrentPlan = currentPlan?.id === plan.id;
                  const isPopular = plan.name.toLowerCase() === 'two_weeks';
                  const planStyle = getPlanStyle(plan.name);
                  const features = getLocalPlanFeatures(plan.name);
                  
                  return (
                    <div key={plan.id} className="w-full flex-shrink-0 px-4">
                      <Card
                        className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                          isCurrentPlan ? 'ring-2 ring-green-500 bg-green-50' : 'hover:-translate-y-2'
                        } ${isPopular ? 'ring-2 ring-orange-500' : ''}`}
                      >
                        {isPopular && (
                          <div className="absolute top-0 left-0 right-0 bg-orange-500 text-white text-xs font-medium py-2 text-center">
                            Most Popular
                          </div>
                        )}
                        
                        {isCurrentPlan && (
                          <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-medium py-1 px-2 rounded-bl-lg">
                            Current
                          </div>
                        )}

                        <CardHeader className="text-center pb-4">
                          <div className="flex justify-center mb-4">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${planStyle.color}`}>
                              {planStyle.icon}
                            </div>
                          </div>
                          <CardTitle className="text-2xl font-bold text-gray-900">
                            {getPlanDisplayName(plan.name)}
                          </CardTitle>
                          <CardDescription className="text-gray-600">
                            {getPlanDurationText(plan.name)}
                          </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6">
                          {/* Price */}
                          <div className="text-center">
                            {plan.name === 'free' ? (
                              <div className="text-4xl font-bold text-gray-900 mb-2">Free</div>
                            ) : (
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
                            )}
                            <p className="text-sm text-gray-600">
                              {plan.name === 'free' ? 'No credit card required' : `${getPlanDurationText(plan.billing_cycle)}`}
                            </p>
                            {userCurrency !== 'USD' && plan.name !== 'free' && (
                              <p className="text-xs text-gray-500 mt-1">
                                ≈ ${getPlanPrice(plan.name, plan.billing_cycle).toFixed(2)} USD
                              </p>
                            )}
                          </div>

                          {/* Features */}
                          <div className="space-y-3">
                            {features.map((feature, index) => (
                              <div key={index} className="flex items-center gap-3">
                                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                                <span className="text-sm text-gray-700">{feature}</span>
                              </div>
                            ))}
                          </div>

                          {/* CTA Button */}
                          <Button
                            onClick={() => handlePayment(plan)}
                            disabled={isProcessing || isCurrentPlan}
                            className={`w-full py-3 text-base font-semibold ${
                              isCurrentPlan 
                                ? 'bg-green-500 hover:bg-green-600 text-white' 
                                : 'bg-orange-500 hover:bg-orange-600 text-white'
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
                            ) : plan.name === 'free' ? (
                              <>
                                <Star className="h-4 w-4 mr-2" />
                                Continue with Free
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
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Carousel Indicators */}
          <div className="flex justify-center mt-6 space-x-2">
            {plans.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-orange-500' : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Error Modal */}
        {showError && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <XCircle className="h-6 w-6 text-red-500" />
                <h3 className="text-lg font-semibold text-gray-900">Payment Error</h3>
              </div>
              <p className="text-gray-600 mb-6">{errorMessage}</p>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowError(false)}
                  className="flex-1"
                >
                  Try Again
                </Button>
                <Button
                  onClick={() => setShowError(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payment; 