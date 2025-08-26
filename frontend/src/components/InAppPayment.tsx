import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useToast } from '../hooks/use-toast';
import { CreditCard, Lock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { SubscriptionPlan } from '../services/paystackService';
import { api } from '../lib/api';

interface InAppPaymentProps {
  plan: SubscriptionPlan;
  billingCycle: 'monthly' | 'yearly';
  onSuccess: () => void;
  onCancel: () => void;
}

interface PaymentFormData {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardholderName: string;
  email: string;
}

const InAppPayment: React.FC<InAppPaymentProps> = ({
  plan,
  billingCycle,
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState<PaymentFormData>({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: '',
    email: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'form' | 'processing' | 'success' | 'error'>('form');
  const [errorMessage, setErrorMessage] = useState('');
  const { toast } = useToast();

  const amount = billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly;

  const handleInputChange = (field: keyof PaymentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const validateForm = () => {
    if (!formData.cardNumber.replace(/\s/g, '').match(/^\d{16}$/)) {
      return 'Please enter a valid 16-digit card number';
    }
    if (!formData.expiryMonth || !formData.expiryYear) {
      return 'Please enter card expiry date';
    }
    if (!formData.cvv.match(/^\d{3,4}$/)) {
      return 'Please enter a valid CVV';
    }
    if (!formData.cardholderName.trim()) {
      return 'Please enter cardholder name';
    }
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return 'Please enter a valid email address';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      toast({
        title: "Validation Error",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setStep('processing');
    setErrorMessage('');

    try {
      // Simulate payment processing (in real implementation, this would integrate with a payment processor)
      const paymentData = {
        plan_id: plan.id,
        amount: amount,
        currency: plan.currency || 'USD',
        billing_cycle: billingCycle,
        payment_method: 'card',
        card_data: {
          last4: formData.cardNumber.slice(-4),
          brand: 'visa', // This would be detected from card number
          expiry_month: formData.expiryMonth,
          expiry_year: formData.expiryYear
        },
        customer: {
          email: formData.email,
          name: formData.cardholderName
        }
      };

      // Call backend to process payment
      const response = await api.post('/payment/process-in-app', paymentData);
      
      if (response.status === 'success') {
        setStep('success');
        toast({
          title: "Payment Successful!",
          description: "Your subscription has been activated.",
        });
        
        // Wait a moment then call success callback
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        throw new Error(response.message || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Payment failed');
      setStep('error');
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : 'Unable to process payment',
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cardNumber">Card Number</Label>
        <Input
          id="cardNumber"
          type="text"
          placeholder="1234 5678 9012 3456"
          value={formData.cardNumber}
          onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
          maxLength={19}
          className="font-mono"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="expiryMonth">Month</Label>
          <Select value={formData.expiryMonth} onValueChange={(value) => handleInputChange('expiryMonth', value)}>
            <SelectTrigger>
              <SelectValue placeholder="MM" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <SelectItem key={month} value={month.toString().padStart(2, '0')}>
                  {month.toString().padStart(2, '0')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="expiryYear">Year</Label>
          <Select value={formData.expiryYear} onValueChange={(value) => handleInputChange('expiryYear', value)}>
            <SelectTrigger>
              <SelectValue placeholder="YYYY" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cvv">CVV</Label>
          <Input
            id="cvv"
            type="text"
            placeholder="123"
            value={formData.cvv}
            onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, ''))}
            maxLength={4}
            className="font-mono"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cardholderName">Cardholder Name</Label>
        <Input
          id="cardholderName"
          type="text"
          placeholder="John Doe"
          value={formData.cardholderName}
          onChange={(e) => handleInputChange('cardholderName', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="john@example.com"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
          disabled={isProcessing}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-orange-500 hover:bg-orange-600"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Lock className="mr-2 h-4 w-4" />
              Pay ${amount}
            </>
          )}
        </Button>
      </div>
    </form>
  );

  const renderProcessing = () => (
    <div className="text-center space-y-4">
      <Loader2 className="h-12 w-12 animate-spin mx-auto text-orange-500" />
      <h3 className="text-lg font-semibold">Processing Payment</h3>
      <p className="text-gray-600">Please wait while we process your payment securely...</p>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center space-y-4">
      <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
      <h3 className="text-lg font-semibold text-green-600">Payment Successful!</h3>
      <p className="text-gray-600">Your subscription has been activated successfully.</p>
      <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
    </div>
  );

  const renderError = () => (
    <div className="text-center space-y-4">
      <AlertCircle className="h-12 w-12 mx-auto text-red-500" />
      <h3 className="text-lg font-semibold text-red-600">Payment Failed</h3>
      <p className="text-gray-600">{errorMessage}</p>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep('form')} className="flex-1">
          Try Again
        </Button>
        <Button onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </div>
  );

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
            <CreditCard className="h-6 w-6 text-white" />
          </div>
        </div>
        <CardTitle>Complete Payment</CardTitle>
        <p className="text-sm text-gray-600">
          {plan.display_name} - {billingCycle === 'monthly' ? 'Monthly' : 'Yearly'} Plan
        </p>
        <p className="text-2xl font-bold text-orange-500">${amount}</p>
      </CardHeader>
      <CardContent>
        {step === 'form' && renderForm()}
        {step === 'processing' && renderProcessing()}
        {step === 'success' && renderSuccess()}
        {step === 'error' && renderError()}
      </CardContent>
    </Card>
  );
};

export default InAppPayment; 