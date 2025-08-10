import React, { useState } from 'react';
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
  Target, 
  Heart, 
  Utensils, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle,
  Camera
} from 'lucide-react';

interface OnboardingData {
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  weight: number;
  height: number;
  activityLevel: string;
  goal: string;
  dietaryRestrictions: string[];
  healthConditions: string[];
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
    age: 0,
    gender: '',
    weight: 0,
    height: 0,
    activityLevel: '',
    goal: '',
    dietaryRestrictions: [],
    healthConditions: [],
    allergies: []
  });

  const totalSteps = 4;

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
      // Save onboarding data to backend
      await api.post('/api/profile/onboarding', formData);
      
      toast({
        title: "Profile Setup Complete!",
        description: "Welcome to MealLens! Your personalized nutrition journey begins now.",
      });
      
      navigate('/dashboard');
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
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              value={formData.age || ''}
              onChange={(e) => updateFormData('age', parseInt(e.target.value))}
              placeholder="25"
            />
          </div>
          <div>
            <Label htmlFor="gender">Gender</Label>
            <Select value={formData.gender} onValueChange={(value) => updateFormData('gender', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
                <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Target className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl">Physical Information</CardTitle>
        <CardDescription>
          Help us understand your current physical state for better recommendations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              value={formData.weight || ''}
              onChange={(e) => updateFormData('weight', parseFloat(e.target.value))}
              placeholder="70"
            />
          </div>
          <div>
            <Label htmlFor="height">Height (cm)</Label>
            <Input
              id="height"
              type="number"
              value={formData.height || ''}
              onChange={(e) => updateFormData('height', parseFloat(e.target.value))}
              placeholder="170"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="activityLevel">Activity Level</Label>
          <Select value={formData.activityLevel} onValueChange={(value) => updateFormData('activityLevel', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select activity level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
              <SelectItem value="light">Lightly active (light exercise 1-3 days/week)</SelectItem>
              <SelectItem value="moderate">Moderately active (moderate exercise 3-5 days/week)</SelectItem>
              <SelectItem value="active">Very active (hard exercise 6-7 days/week)</SelectItem>
              <SelectItem value="very-active">Extremely active (very hard exercise, physical job)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Heart className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl">Health Goals</CardTitle>
        <CardDescription>
          What would you like to achieve with your nutrition journey?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="goal">Primary Goal</Label>
          <Select value={formData.goal} onValueChange={(value) => updateFormData('goal', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select your primary goal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weight-loss">Weight Loss</SelectItem>
              <SelectItem value="weight-gain">Weight Gain</SelectItem>
              <SelectItem value="maintenance">Maintain Current Weight</SelectItem>
              <SelectItem value="muscle-gain">Build Muscle</SelectItem>
              <SelectItem value="energy">Increase Energy</SelectItem>
              <SelectItem value="health">Improve Overall Health</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Dietary Restrictions</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo'].map((diet) => (
              <div key={diet} className="flex items-center space-x-2">
                <Checkbox
                  id={diet}
                  checked={formData.dietaryRestrictions.includes(diet.toLowerCase())}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateFormData('dietaryRestrictions', [...formData.dietaryRestrictions, diet.toLowerCase()]);
                    } else {
                      updateFormData('dietaryRestrictions', formData.dietaryRestrictions.filter(d => d !== diet.toLowerCase()));
                    }
                  }}
                />
                <Label htmlFor={diet} className="text-sm">{diet}</Label>
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
      case 4: return renderStep4();
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
                className="bg-[#FF6B6B] hover:bg-[#FF5252] text-white flex items-center"
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={loading}
                className="bg-[#FF6B6B] hover:bg-[#FF5252] text-white flex items-center"
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
            onClick={() => navigate('/dashboard')}
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