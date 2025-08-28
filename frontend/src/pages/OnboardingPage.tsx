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

// Countries list
const countries = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria',
  'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan',
  'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia',
  'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica',
  'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Democratic Republic of the Congo', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador',
  'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France',
  'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau',
  'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland',
  'Israel', 'Italy', 'Ivory Coast', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait',
  'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
  'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico',
  'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru',
  'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 'Oman',
  'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal',
  'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe',
  'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia',
  'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria',
  'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey',
  'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu',
  'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
];

// Currencies list
const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Złoty' },
  { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna' },
  { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint' },
  { code: 'RON', symbol: 'lei', name: 'Romanian Leu' },
  { code: 'BGN', symbol: 'лв', name: 'Bulgarian Lev' },
  { code: 'HRK', symbol: 'kn', name: 'Croatian Kuna' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  { code: 'ILS', symbol: '₪', name: 'Israeli Shekel' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi' },
  { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling' },
  { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling' },
  { code: 'ZMW', symbol: 'ZK', name: 'Zambian Kwacha' },
  { code: 'BWP', symbol: 'P', name: 'Botswana Pula' },
  { code: 'NAD', symbol: 'N$', name: 'Namibian Dollar' },
  { code: 'MUR', symbol: '₨', name: 'Mauritian Rupee' },
  { code: 'SCR', symbol: '₨', name: 'Seychellois Rupee' },
  { code: 'MAD', symbol: 'د.م.', name: 'Moroccan Dirham' },
  { code: 'TND', symbol: 'د.ت', name: 'Tunisian Dinar' },
  { code: 'DZD', symbol: 'د.ج', name: 'Algerian Dinar' },
  { code: 'LYD', symbol: 'ل.د', name: 'Libyan Dinar' },
  { code: 'SDG', symbol: 'ج.س.', name: 'Sudanese Pound' },
  { code: 'ETB', symbol: 'Br', name: 'Ethiopian Birr' },
  { code: 'SOS', symbol: 'S', name: 'Somali Shilling' },
  { code: 'DJF', symbol: 'Fdj', name: 'Djiboutian Franc' },
  { code: 'KMF', symbol: 'CF', name: 'Comorian Franc' },
  { code: 'XOF', symbol: 'CFA', name: 'West African CFA Franc' },
  { code: 'XAF', symbol: 'FCFA', name: 'Central African CFA Franc' },
  { code: 'XPF', symbol: 'CFP', name: 'CFP Franc' },
  { code: 'CLP', symbol: '$', name: 'Chilean Peso' },
  { code: 'COP', symbol: '$', name: 'Colombian Peso' },
  { code: 'PEN', symbol: 'S/', name: 'Peruvian Sol' },
  { code: 'ARS', symbol: '$', name: 'Argentine Peso' },
  { code: 'UYU', symbol: '$', name: 'Uruguayan Peso' },
  { code: 'PYG', symbol: '₲', name: 'Paraguayan Guaraní' },
  { code: 'BOB', symbol: 'Bs.', name: 'Bolivian Boliviano' },
  { code: 'GTQ', symbol: 'Q', name: 'Guatemalan Quetzal' },
  { code: 'HNL', symbol: 'L', name: 'Honduran Lempira' },
  { code: 'NIO', symbol: 'C$', name: 'Nicaraguan Córdoba' },
  { code: 'CRC', symbol: '₡', name: 'Costa Rican Colón' },
  { code: 'PAB', symbol: 'B/.', name: 'Panamanian Balboa' },
  { code: 'JMD', symbol: '$', name: 'Jamaican Dollar' },
  { code: 'TTD', symbol: '$', name: 'Trinidad and Tobago Dollar' },
  { code: 'BBD', symbol: '$', name: 'Barbadian Dollar' },
  { code: 'XCD', symbol: '$', name: 'East Caribbean Dollar' },
  { code: 'GYD', symbol: '$', name: 'Guyanese Dollar' },
  { code: 'SRD', symbol: '$', name: 'Surinamese Dollar' },
  { code: 'BZD', symbol: '$', name: 'Belize Dollar' },
  { code: 'FJD', symbol: '$', name: 'Fijian Dollar' },
  { code: 'WST', symbol: 'T', name: 'Samoan Tālā' },
  { code: 'TOP', symbol: 'T$', name: 'Tongan Paʻanga' },
  { code: 'VUV', symbol: 'Vt', name: 'Vanuatu Vatu' },
  { code: 'SBD', symbol: '$', name: 'Solomon Islands Dollar' },
  { code: 'PGK', symbol: 'K', name: 'Papua New Guinean Kina' },
  { code: 'KYD', symbol: '$', name: 'Cayman Islands Dollar' },
  { code: 'BMD', symbol: '$', name: 'Bermudian Dollar' },
  { code: 'BND', symbol: '$', name: 'Brunei Dollar' },
  { code: 'KHR', symbol: '៛', name: 'Cambodian Riel' },
  { code: 'LAK', symbol: '₭', name: 'Lao Kip' },
  { code: 'MMK', symbol: 'K', name: 'Myanmar Kyat' },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
  { code: 'NPR', symbol: '₨', name: 'Nepalese Rupee' },
  { code: 'BTN', symbol: 'Nu.', name: 'Bhutanese Ngultrum' },
  { code: 'MVR', symbol: 'MVR', name: 'Maldivian Rufiyaa' },
  { code: 'LKR', symbol: '₨', name: 'Sri Lankan Rupee' },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
  { code: 'AFN', symbol: '؋', name: 'Afghan Afghani' },
  { code: 'TJS', symbol: 'ЅM', name: 'Tajikistani Somoni' },
  { code: 'TMT', symbol: 'T', name: 'Turkmenistan Manat' },
  { code: 'UZS', symbol: 'so\'m', name: 'Uzbekistani Som' },
  { code: 'KGS', symbol: 'с', name: 'Kyrgyzstani Som' },
  { code: 'MNT', symbol: '₮', name: 'Mongolian Tögrög' },
  { code: 'AMD', symbol: '֏', name: 'Armenian Dram' },
  { code: 'GEL', symbol: '₾', name: 'Georgian Lari' },
  { code: 'AZN', symbol: '₼', name: 'Azerbaijani Manat' },
  { code: 'MDL', symbol: 'L', name: 'Moldovan Leu' },
  { code: 'ALL', symbol: 'L', name: 'Albanian Lek' },
  { code: 'MKD', symbol: 'ден', name: 'Macedonian Denar' },
  { code: 'RSD', symbol: 'дин.', name: 'Serbian Dinar' },
  { code: 'BAM', symbol: 'KM', name: 'Bosnia and Herzegovina Convertible Mark' },
  { code: 'HRK', symbol: 'kn', name: 'Croatian Kuna' },
  { code: 'SLL', symbol: 'Le', name: 'Sierra Leonean Leone' },
  { code: 'GMD', symbol: 'D', name: 'Gambian Dalasi' },
  { code: 'GNF', symbol: 'FG', name: 'Guinean Franc' },
  { code: 'GWP', symbol: 'CFA', name: 'Guinea-Bissau Peso' },
  { code: 'CVE', symbol: '$', name: 'Cape Verdean Escudo' },
  { code: 'STN', symbol: 'Db', name: 'São Tomé and Príncipe Dobra' },
  { code: 'AOA', symbol: 'Kz', name: 'Angolan Kwanza' },
  { code: 'ZWL', symbol: '$', name: 'Zimbabwean Dollar' }
];

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
  healthConditions: string[];
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
    allergies: [],
    healthConditions: []
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
          const healthConditions = Array.isArray(profile.health_conditions) ? profile.health_conditions : [];
          const dateOfBirth = profile.date_of_birth || '';
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
              healthConditions: prev.healthConditions.length ? prev.healthConditions : healthConditions,
              dateOfBirth: prev.dateOfBirth || dateOfBirth,
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
        health_conditions: formData.healthConditions,
        date_of_birth: formData.dateOfBirth,
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
      navigate('/ai-kitchen');
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
              <SelectContent className="max-h-60">
                {countries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="currency">Currency</Label>
          <Select value={formData.currency} onValueChange={(value) => updateFormData('currency', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {currencies.map((currency) => (
                <SelectItem key={currency.code} value={currency.code}>
                  {currency.code} ({currency.symbol}) - {currency.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          Choose any dietary preferences, allergies, and health conditions we should respect.
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

        <div>
          <Label>Health Conditions</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {['Diabetes', 'Hypertension', 'Heart Disease', 'Celiac Disease', 'Lactose Intolerance'].map((condition) => (
              <div key={condition} className="flex items-center space-x-2">
                <Checkbox
                  id={`condition-${condition}`}
                  checked={formData.healthConditions.includes(condition.toLowerCase())}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateFormData('healthConditions', [...formData.healthConditions, condition.toLowerCase()]);
                    } else {
                      updateFormData('healthConditions', formData.healthConditions.filter(c => c !== condition.toLowerCase()));
                    }
                  }}
                />
                <Label htmlFor={`condition-${condition}`} className="text-sm">{condition}</Label>
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
            onClick={() => { localStorage.setItem('onboarding_complete', 'true'); navigate('/ai-kitchen') }}
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