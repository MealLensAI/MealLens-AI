import React, { useState } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useAuth } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Check, CreditCard, Sparkles, ArrowRight, Star } from 'lucide-react';
import { APP_CONFIG, convertCurrency, formatCurrency, getPlanPrice, getPlanDurationText, getPlanFeatures } from '@/lib/config';
import PaymentModal from '@/components/PaymentModal';

const Payment: React.FC = () => {
  const { subscription } = useSubscription();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  // Get current plan
  const currentPlan = subscription?.plan;

  // Get available plans (exclude free plan for payment page)
  const paidPlans = APP_CONFIG.subscriptionPlans.filter(plan => plan.name !== 'free');

  const handlePlanSelect = (plan: any) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedPlan(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Unlock the full potential of MealLens AI with our flexible subscription plans. 
            Start your journey to better nutrition today.
          </p>
        </div>

        {/* Current Plan Badge */}
        {currentPlan && typeof currentPlan === 'string' && currentPlan !== 'free' && (
          <div className="mb-6 text-center">
            <Badge variant="secondary" className="text-sm">
              Current Plan: {APP_CONFIG.subscriptionPlans.find(p => p.name === currentPlan)?.display_name}
            </Badge>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {paidPlans.map((plan, index) => (
            <Card
              key={plan.name}
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                index === 1 ? 'ring-2 ring-orange-500 relative' : ''
              }`}
              onClick={() => handlePlanSelect(plan)}
            >
              {index === 1 && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-orange-500 text-white px-3 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {plan.name === 'monthly' && <Sparkles className="w-6 h-6 text-orange-500 mr-2" />}
                  <CardTitle className="text-xl">{plan.display_name}</CardTitle>
                </div>
                <CardDescription className="text-gray-600">
                  {getPlanDurationText(plan.billing_cycle)}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Price */}
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-500">
                    {formatCurrency(
                      convertCurrency(
                        getPlanPrice(plan.name, plan.billing_cycle),
                        'USD',
                        'USD'
                      ),
                      'USD'
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    per {plan.billing_cycle === 'weekly' ? 'week' : plan.billing_cycle === 'two_weeks' ? '2 weeks' : 'month'}
                  </p>
                </div>

                <Separator />

                {/* Features */}
                <div className="space-y-3">
                  {getPlanFeatures(plan.name).map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlanSelect(plan);
                  }}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Comparison */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">What's Included</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">AI-Powered Features</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Unlimited food detection and analysis
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Personalized meal planning
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Nutritional insights and recommendations
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Recipe suggestions based on your preferences
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Premium Support</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Priority customer support
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Advanced analytics and insights
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Export and share meal plans
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Early access to new features
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Payment Modal */}
        <PaymentModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          selectedPlan={selectedPlan}
        />
      </div>
    </div>
  );
};

export default Payment; 