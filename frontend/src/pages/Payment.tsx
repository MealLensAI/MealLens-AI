import React, { useState } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useAuth } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Check, Sparkles, ArrowRight, Star } from 'lucide-react';
import { APP_CONFIG, convertCurrency, formatCurrency, getPlanPrice, getPlanDurationText, getPlanFeatures } from '@/lib/config';
import PaymentModal from '@/components/PaymentModal';

const Payment: React.FC = () => {
  const { subscription } = useSubscription();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);

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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Unlock the full potential of MealLens AI with our flexible subscription plans. 
            Start your journey to better nutrition today.
          </p>
        </div>

        {/* Current Plan Badge */}
        {currentPlan && typeof currentPlan === 'string' && currentPlan !== 'free' && (
          <div className="mb-8 text-center">
            <Badge variant="secondary" className="text-sm px-4 py-2">
              Current Plan: {APP_CONFIG.subscriptionPlans.find(p => p.name === currentPlan)?.display_name}
            </Badge>
            </div>
          )}

        {/* Plans Grid */}
        <div className="flex justify-center mb-16">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl">
            {paidPlans.map((plan, index) => {
              const isPopular = index === 1;
              const isHovered = hoveredPlan === plan.name;
              const isActive = hoveredPlan === plan.name;
                  
                  return (
                      <Card
                  key={plan.name}
                  className={`cursor-pointer transition-all duration-500 ${
                    isActive 
                      ? 'scale-110 ring-4 ring-orange-500 shadow-2xl z-10' 
                      : isHovered 
                        ? 'scale-105 shadow-xl' 
                        : 'hover:scale-105 hover:shadow-lg'
                  } ${
                    isPopular ? 'relative' : ''
                  }`}
                  onClick={() => handlePlanSelect(plan)}
                  onMouseEnter={() => setHoveredPlan(plan.name)}
                  onMouseLeave={() => setHoveredPlan(null)}
                      >
                        {isPopular && (
                          <div className="absolute -top-2 -right-2 z-20">
                            {/* Ribbon */}
                            <div className="relative">
                              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold px-3 py-1 shadow-lg transform rotate-12">
                                <Star className="w-3 h-3 inline mr-1" />
                                Most Popular
                              </div>
                              {/* Ribbon tail */}
                              <div className="absolute -bottom-1 -right-1 w-0 h-0 border-l-4 border-l-orange-600 border-t-4 border-t-transparent border-b-4 border-b-transparent transform rotate-12"></div>
                            </div>
                          </div>
                        )}
                        
                  <CardHeader className="text-center pb-6">
                    <div className="flex items-center justify-center mb-4">
                      {plan.name === 'monthly' && <Sparkles className="w-8 h-8 text-orange-500 mr-3" />}
                      <CardTitle className={`text-2xl font-bold ${isActive ? 'text-orange-600' : 'text-gray-900'}`}>
                        {plan.display_name}
                      </CardTitle>
                          </div>
                    <CardDescription className="text-gray-600 text-base">
                      {getPlanDurationText(plan.billing_cycle)}
                          </CardDescription>
                        </CardHeader>

                  <CardContent className="space-y-8">
                          {/* Price */}
                          <div className="text-center">
                      <div className={`text-4xl font-bold ${isActive ? 'text-orange-600' : 'text-orange-500'}`}>
                        {formatCurrency(
                          convertCurrency(
                            getPlanPrice(plan.name, plan.billing_cycle),
                            'USD',
                            'USD'
                          ),
                          'USD'
                        )}
                              </div>
                      <p className="text-sm text-gray-500 mt-2">
                        per {plan.billing_cycle === 'weekly' ? 'week' : plan.billing_cycle === 'two_weeks' ? '2 weeks' : 'month'}
                            </p>
                          </div>

                    <Separator />

                          {/* Features */}
                    <div className="space-y-4">
                      {getPlanFeatures(plan.name).map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center gap-3">
                          <Check className={`w-5 h-5 ${isActive ? 'text-orange-500' : 'text-green-500'} flex-shrink-0`} />
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
                            className={`w-full py-3 text-base font-semibold ${
                        isActive 
                          ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-lg' 
                                : 'bg-orange-500 hover:bg-orange-600 text-white'
                            }`}
                          >
                      Get Started
                      <ArrowRight className="w-5 h-5 ml-2" />
                          </Button>
                        </CardContent>
                      </Card>
                  );
                })}
          </div>
        </div>

        {/* Features Comparison */}
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">What's Included</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-orange-500" />
                AI-Powered Features
              </h3>
              <ul className="space-y-4 text-gray-600">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Unlimited food detection and analysis</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Personalized meal planning</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Nutritional insights and recommendations</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Recipe suggestions based on your preferences</span>
                </li>
              </ul>
              </div>
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                <Star className="w-6 h-6 text-orange-500" />
                Premium Support
              </h3>
              <ul className="space-y-4 text-gray-600">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Priority customer support</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Advanced analytics and insights</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Export and share meal plans</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Early access to new features</span>
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