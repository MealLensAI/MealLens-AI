import React, { useState } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useAuth } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Check, Sparkles, ArrowRight, Star, Home } from 'lucide-react';
import { APP_CONFIG, convertCurrency, formatCurrency, getPlanPrice, getPlanDurationText, getPlanFeatures } from '@/lib/config';
import PaymentModal from '@/components/PaymentModal';
import { useNavigate } from 'react-router-dom';

const Payment: React.FC = () => {
  // Safely use subscription context with error handling
  let subscription = null;
  
  try {
    const subscriptionContext = useSubscription();
    if (subscriptionContext) {
      subscription = subscriptionContext.subscription;
    }
  } catch (error) {
    console.warn('Subscription context not available:', error);
  }
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
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

  const handleBackToHome = () => {
    navigate('/ai-kitchen');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex flex-col">
      {/* Back to Home Button */}
      <div className="container mx-auto px-4 pt-6">
        <Button
          onClick={handleBackToHome}
          variant="ghost"
          className="flex items-center gap-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="text-center mb-12">
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
          <div className="flex justify-center">
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
                          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold px-3 py-1 shadow-lg transform rotate-12 border border-white">
                            Most Popular
                          </div>
                        </div>
                      </div>
                    )}

                    <CardHeader className="text-center pb-4">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <CardTitle className="text-2xl font-bold text-gray-900">
                          {plan.display_name}
                        </CardTitle>
                        {plan.name === 'monthly' && (
                          <Star className="w-5 h-5 text-orange-500" />
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      {/* Price */}
                      <div className="text-center">
                        <div className="text-sm text-gray-500 mb-1">
                          {getPlanDurationText(plan.billing_cycle)}
                        </div>
                        <div className="text-4xl font-bold text-orange-600 mb-1">
                          {formatCurrency(getPlanPrice(plan.name, plan.billing_cycle), plan.currency)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {getPlanDurationText(plan.billing_cycle)}
                        </div>
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
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        selectedPlan={selectedPlan}
      />
    </div>
  );
};

export default Payment; 