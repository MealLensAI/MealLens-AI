import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Loader2, XCircle, ArrowRight, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/contexts/SubscriptionContext';
import paystackService from '@/services/paystackService';

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { refreshSubscription } = useSubscription();
  
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'success' | 'error' | 'pending'>('pending');
  const [errorMessage, setErrorMessage] = useState('');
  const [countdown, setCountdown] = useState(5);

  const reference = searchParams.get('reference');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!reference) {
        setErrorMessage('No payment reference found');
        setVerificationStatus('error');
        setIsVerifying(false);
        return;
      }

      try {
        // Verify the payment with Paystack
        const verificationResult = await paystackService.verifyPayment(reference);
        
        if (verificationResult.status === 'success') {
          setVerificationStatus('success');
          
          // Refresh user subscription
          await refreshSubscription();
          
          toast({
            title: "Payment Successful!",
            description: "Welcome to MealLens Pro! You now have access to all premium features.",
          });
        } else {
          setErrorMessage('Payment verification failed');
          setVerificationStatus('error');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setErrorMessage('Failed to verify payment. Please contact support.');
        setVerificationStatus('error');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [reference, refreshSubscription, toast]);

  useEffect(() => {
    if (verificationStatus === 'success' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (verificationStatus === 'success' && countdown === 0) {
      navigate('/home');
    }
  }, [verificationStatus, countdown, navigate]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <div className="flex justify-center mb-6">
              <Loader2 className="h-12 w-12 text-[#FF6B6B] animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifying Payment...</h2>
            <p className="text-gray-600">
              Please wait while we verify your payment.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (verificationStatus === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Verification Failed</h2>
            <p className="text-gray-600 mb-6">
              {errorMessage || 'There was an issue verifying your payment. Please contact support if you believe this is an error.'}
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/payment')}
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                Try Again
              </Button>
              <Button 
                onClick={() => navigate('/home')}
                variant="outline"
                className="w-full"
              >
                <Home className="h-4 w-4 mr-2" />
                Go to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <Badge className="mb-4 bg-green-100 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-2" />
            Payment Successful
          </Badge>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to MealLens Pro!</h2>
          <p className="text-gray-600 mb-6">
            Your payment has been processed successfully. You now have access to all premium features.
          </p>
          
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <h3 className="font-semibold text-gray-900 mb-2">What's Next?</h3>
              <ul className="text-sm text-gray-600 space-y-1 text-left">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Unlimited AI-powered food detection
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Advanced meal planning tools
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Priority customer support
                </li>
              </ul>
            </div>
            
            <div className="text-sm text-gray-500">
              Redirecting to dashboard in {countdown} seconds...
            </div>
            
            <Button 
              onClick={() => navigate('/home')}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Go to Dashboard Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess; 