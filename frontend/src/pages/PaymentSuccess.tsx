import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/utils';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Loader2, XCircle, ArrowRight, Home } from 'lucide-react';
import { api } from '@/lib/api';

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { refreshSubscription } = useSubscription();
  const { toast } = useToast();
  
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get payment reference from URL params or localStorage
        const reference = searchParams.get('reference') || searchParams.get('trxref');
        const pendingPayment = localStorage.getItem('pendingPayment');
        
        if (!reference) {
          setVerificationStatus('error');
          setErrorMessage('Payment reference not found');
          return;
        }

        // Get stored payment details
        if (pendingPayment) {
          setPaymentDetails(JSON.parse(pendingPayment));
        }

        // Verify payment with backend
        const response = await api.verifyPayment(reference);
        
        if (response.status === 'success' || response.data?.status === 'success') {
          setVerificationStatus('success');
          
          // Clear pending payment from localStorage
          localStorage.removeItem('pendingPayment');
          
          // Refresh subscription status
          if (refreshSubscription) {
            await refreshSubscription();
          }
          
          // Show success toast
          toast({
            title: "Payment Successful!",
            description: "Welcome to MealLens Pro! Your subscription is now active.",
            variant: "default",
          });
          
        } else {
          setVerificationStatus('error');
          setErrorMessage('Payment verification failed. Please contact support.');
        }
        
      } catch (error) {
        console.error('Payment verification error:', error);
        setVerificationStatus('error');
        setErrorMessage('Payment verification failed. Please try again.');
      }
    };

    verifyPayment();
  }, [searchParams, refreshSubscription, toast]);

  const handleContinue = () => {
    navigate('/ai-kitchen');
  };

  const handleHome = () => {
    navigate('/');
  };

  if (verificationStatus === 'verifying') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Verifying Payment...</h2>
            <p className="text-gray-600">Please wait while we verify your payment with Paystack.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (verificationStatus === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Verification Failed</h2>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            <div className="space-y-3">
              <Button onClick={handleHome} className="w-full">
                <Home className="h-4 w-4 mr-2" />
                Go to Home
              </Button>
              <Button variant="outline" onClick={() => window.history.back()} className="w-full">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">
            Welcome to MealLens Pro! Your subscription is now active and you have access to all premium features.
          </p>
          
          {paymentDetails && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-2">Payment Details:</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div>Plan: {paymentDetails.plan}</div>
                <div>Amount: {paymentDetails.currency} {paymentDetails.amount}</div>
                <div>Status: Verified</div>
              </div>
            </div>
          )}
          
          <Button onClick={handleContinue} className="w-full bg-orange-500 hover:bg-orange-600">
            Start Using Pro Features
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess; 