import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/utils';
import { api } from '@/lib/api';
import { 
  User,
  Heart,
  Utensils,
  ArrowRight,
  ArrowLeft,
  CheckCircle
} from 'lucide-react';

interface OnboardingData {
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO date string
  country: string;
  currency: string; // default USD
  hasSickness: boolean;
  sicknessType: string;
  dietaryPreferences: string[];
  allergies: string[];
}

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<OnboardingData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    country: '',
    currency: 'USD',
    hasSickness: false,
    sicknessType: '',
    dietaryPreferences: [],
    allergies: []
  });

  const totalSteps = 3;

  // Prefill from local user data and backend profile
  useEffect(() => {
    try {
      const raw = localStorage.getItem('user_data');
      if (raw) {
        const ud = JSON.parse(raw);
        if (!formData.firstName || !formData.lastName) {
          let first = '';
          let last = '';
          if (ud.displayName) {
            const parts = String(ud.displayName).trim().split(/\s+/);
            first = parts[0] || '';
            last = parts.slice(1).join(' ') || '';
          }
          if ((!first || !last) && ud.email) {
            const namePart = String(ud.email).split('@')[0];
            if (!first) first = namePart;
          }
          setFormData(prev => ({
            ...prev,
            firstName: prev.firstName || first,
            lastName: prev.lastName || last,
          }));
        }
        // Default currency
        setFormData(prev => ({ ...prev, currency: prev.currency || 'USD' }));
      }
    } catch {}

    (async () => {
      try {
        const res: any = await api.getUserProfile();
        const profile = res?.profile || res?.data;
        if (profile) {
          const fn = profile.first_name || '';
          const ln = profile.last_name || '';
          const country = profile.country || '';
          const currency = profile.currency || 'USD';
          const hasSickness = !!profile.has_sickness;
          const sicknessType = profile.sickness_type || '';
          const dietaryPreferences = Array.isArray(profile.dietary_preferences) ? profile.dietary_preferences : [];
          const allergies = Array.isArray(profile.allergies) ? profile.allergies : [];
          if (fn || ln) {
            setFormData(prev => ({
              ...prev,
              firstName: prev.firstName || fn,
              lastName: prev.lastName || ln,
              country: prev.country || country,
              currency: prev.currency || currency,
              hasSickness: prev.hasSickness || hasSickness,
              sicknessType: prev.sicknessType || sicknessType,
              dietaryPreferences: prev.dietaryPreferences.length ? prev.dietaryPreferences : dietaryPreferences,
              allergies: prev.allergies.length ? prev.allergies : allergies,
            }));
          }
        }
      } catch {}
    })();
  }, []);

  const updateFormData = (field: keyof OnboardingData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Compute age from DOB if provided
      let age: number | undefined = undefined;
      if (formData.dateOfBirth) {
        const dob = new Date(formData.dateOfBirth);
        const now = new Date();
        let years = now.getFullYear() - dob.getFullYear();
        const m = now.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) years--;
        age = years;
      }

      // Persist to profile
      const payload: any = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        country: formData.country,
        currency: formData.currency || 'USD',
        age: age ?? undefined,
        has_sickness: formData.hasSickness,
        sickness_type: formData.sicknessType,
        dietary_preferences: formData.dietaryPreferences,
        allergies: formData.allergies,
      };
      await api.updateUserProfile(payload);

      // Update cached user display name
      try {
        const raw = localStorage.getItem('user_data');
        if (raw) {
          const ud = JSON.parse(raw);
          ud.displayName = `${formData.firstName} ${formData.lastName}`.trim();
          localStorage.setItem('user_data', JSON.stringify(ud));
        }
      } catch {}
      
      toast({
        title: "Profile Setup Complete!",
        description: "Welcome to MealLens! Your personalized nutrition journey begins now.",
      });
      
      // Mark onboarding complete locally
      localStorage.setItem('onboarding_complete', 'true');
      navigate('/home');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <User className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl">Basic Information</CardTitle>
        <CardDescription>
          Let's start with your basic details to personalize your experience.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => updateFormData('firstName', e.target.value)}
              placeholder="John"
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => updateFormData('lastName', e.target.value)}
              placeholder="Doe"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="dob">Date of Birth</Label>
            <Input
              id="dob"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="country">Country</Label>
            <Select value={formData.country} onValueChange={(value) => updateFormData('country', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="United States">United States</SelectItem>
                <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                <SelectItem value="Canada">Canada</SelectItem>
                <SelectItem value="Nigeria">Nigeria</SelectItem>
                <SelectItem value="Ghana">Ghana</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="currency">Currency</Label>
          <Input id="currency" value={formData.currency || 'USD'} disabled />
        </div>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Heart className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl">Health</CardTitle>
        <CardDescription>
          Tell us if you have any current sickness we should consider.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="hasSickness"
            checked={formData.hasSickness}
            onCheckedChange={(checked) => updateFormData('hasSickness', Boolean(checked))}
          />
          <Label htmlFor="hasSickness">I currently have a health condition/sickness</Label>
        </div>

        {formData.hasSickness && (
          <div>
            <Label htmlFor="sicknessType">Please specify</Label>
            <Input
              id="sicknessType"
              value={formData.sicknessType}
              onChange={(e) => updateFormData('sicknessType', e.target.value)}
              placeholder="e.g., flu, malaria, stomach upset"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Utensils className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl">Preferences & Allergies</CardTitle>
        <CardDescription>
          Choose any dietary preferences and allergies we should respect.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Dietary Preferences</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo'].map((diet) => (
              <div key={diet} className="flex items-center space-x-2">
                <Checkbox
                  id={`diet-${diet}`}
                  checked={formData.dietaryPreferences.includes(diet.toLowerCase())}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateFormData('dietaryPreferences', [...formData.dietaryPreferences, diet.toLowerCase()]);
                    } else {
                      updateFormData('dietaryPreferences', formData.dietaryPreferences.filter(d => d !== diet.toLowerCase()));
                    }
                  }}
                />
                <Label htmlFor={`diet-${diet}`} className="text-sm">{diet}</Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label>Common Allergies</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {['Peanuts', 'Tree Nuts', 'Milk', 'Eggs', 'Soy', 'Wheat', 'Fish', 'Shellfish'].map((allergy) => (
              <div key={allergy} className="flex items-center space-x-2">
                <Checkbox
                  id={`allergy-${allergy}`}
                  checked={formData.allergies.includes(allergy.toLowerCase())}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateFormData('allergies', [...formData.allergies, allergy.toLowerCase()]);
                    } else {
                      updateFormData('allergies', formData.allergies.filter(a => a !== allergy.toLowerCase()));
                    }
                  }}
                />
                <Label htmlFor={`allergy-${allergy}`} className="text-sm">{allergy}</Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep4 = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Utensils className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl">Health & Allergies</CardTitle>
        <CardDescription>
          Let us know about any health conditions or allergies for safe recommendations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Common Allergies</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {['Peanuts', 'Tree Nuts', 'Milk', 'Eggs', 'Soy', 'Wheat', 'Fish', 'Shellfish'].map((allergy) => (
              <div key={allergy} className="flex items-center space-x-2">
                <Checkbox
                  id={allergy}
                  checked={formData.allergies.includes(allergy.toLowerCase())}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateFormData('allergies', [...formData.allergies, allergy.toLowerCase()]);
                    } else {
                      updateFormData('allergies', formData.allergies.filter(a => a !== allergy.toLowerCase()));
                    }
                  }}
                />
                <Label htmlFor={allergy} className="text-sm">{allergy}</Label>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <Label>Health Conditions</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {['Diabetes', 'Hypertension', 'Heart Disease', 'Celiac Disease', 'Lactose Intolerance'].map((condition) => (
              <div key={condition} className="flex items-center space-x-2">
                <Checkbox
                  id={condition}
                  checked={formData.healthConditions.includes(condition.toLowerCase())}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateFormData('healthConditions', [...formData.healthConditions, condition.toLowerCase()]);
                    } else {
                      updateFormData('healthConditions', formData.healthConditions.filter(c => c !== condition.toLowerCase()));
                    }
                  }}
                />
                <Label htmlFor={condition} className="text-sm">{condition}</Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      default: return renderStep1();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Welcome to MealLens!</h1>
            <span className="text-sm text-gray-600">Step {currentStep} of {totalSteps}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step Content */}
        {renderStepContent()}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center space-x-4">
            {currentStep < totalSteps ? (
              <Button
                onClick={handleNext}
                className="bg-orange-500 hover:bg-orange-600 text-white flex items-center"
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={loading}
                className="bg-orange-500 hover:bg-orange-600 text-white flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Completing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Complete Setup
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Skip Option */}
        <div className="text-center mt-6">
          <Button
            variant="ghost"
            onClick={() => { localStorage.setItem('onboarding_complete', 'true'); navigate('/home') }}
            className="text-gray-600 hover:text-[#FF6B6B]"
          >
            Skip for now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage; 