"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/utils"
import { useSubscription } from "@/contexts/SubscriptionContext"
import { api } from "@/lib/api"
import { 
  ArrowLeft, 
  Edit3, 
  Save, 
  X, 
  User, 
  Mail, 
  Calendar, 
  Crown,
  Shield,
  Clock,
  CheckCircle,
  Camera,
  Settings,
  CreditCard,
  Globe,
  MapPin,
  Phone,
  Heart,
  Weight,
  Ruler,
  History,
  LogOut
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { Loader2 } from "lucide-react"
import LoadingScreen from "@/components/LoadingScreen"

// Countries list for the dropdown (same as MealPlanner)
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
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' }
];

interface Profile {
  id: string
  firebase_uid: string
  email: string
  first_name: string | null
  last_name: string | null
  gender: string
  age: number
  mobile_number: string
  has_health_condition: boolean
  health_conditions: string[]
  allergies: string[]
  dietary_preferences: string[]
  medical_history: string[]
  emergency_contact: {
    name: string
    phone: string
    relationship: string
  }
  currency: string
  country: string
  state: string
  city: string
  address: string
  postal_code: string
  payment_methods: {
    type: string
    last4: string
    brand: string
    is_default: boolean
  }[]
  has_sickness: boolean
  sickness_type: string
  created_at: string
  updated_at: string
  date_of_birth: string
  weight: number
  height: number
  has_illness: boolean
  illness_name: string
}

export default function ProfilePage() {
  const { toast } = useToast()
  const { user, logout } = useAuth()
  
  // Safely use subscription context with error handling
  let subscriptionContext = null;
  try {
    subscriptionContext = useSubscription();
  } catch (error) {
    console.warn('Subscription context not available:', error);
    subscriptionContext = {
      subscription: null,
      isInTrial: () => false,
      getTrialDaysLeft: () => 0
    };
  }
  
  const { subscription, isInTrial, getTrialDaysLeft } = subscriptionContext;
  const navigate = useNavigate()
  
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // Form fields
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [gender, setGender] = useState("")
  const [age, setAge] = useState<number>(0)
  const [mobileNumber, setMobileNumber] = useState("")
  const [currency, setCurrency] = useState("USD")
  const [country, setCountry] = useState("")
  const [state, setState] = useState("")
  const [city, setCity] = useState("")
  const [address, setAddress] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [hasHealthCondition, setHasHealthCondition] = useState(false)
  const [healthConditions, setHealthConditions] = useState<string[]>([])
  const [allergies, setAllergies] = useState<string[]>([])
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([])
  const [medicalHistory, setMedicalHistory] = useState<string[]>([])
  const [emergencyContact, setEmergencyContact] = useState({
    name: "",
    phone: "",
    relationship: ""
  })
  const [hasSickness, setHasSickness] = useState(false)
  const [sicknessType, setSicknessType] = useState("")
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [weight, setWeight] = useState<number>(0)
  const [height, setHeight] = useState<number>(0)
  const [hasIllness, setHasIllness] = useState(false)
  const [illnessName, setIllnessName] = useState("")

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await api.getUserProfile()
      if (response.status === 'success' && response.profile) {
        setProfile(response.profile)
        setFirstName(response.profile.first_name || "")
        setLastName(response.profile.last_name || "")
        setEmail(response.profile.email || "")
        setGender(response.profile.gender || "")
        setAge(response.profile.age || 0)
        setMobileNumber(response.profile.mobile_number || "")
        setCurrency(response.profile.currency || "USD")
        setCountry(response.profile.country || "")
        setState(response.profile.state || "")
        setCity(response.profile.city || "")
        setAddress(response.profile.address || "")
        setPostalCode(response.profile.postal_code || "")
        setHasHealthCondition(response.profile.has_health_condition || false)
        setHealthConditions(response.profile.health_conditions || [])
        setAllergies(response.profile.allergies || [])
        setDietaryPreferences(response.profile.dietary_preferences || [])
        setMedicalHistory(response.profile.medical_history || [])
        setEmergencyContact(response.profile.emergency_contact || { name: "", phone: "", relationship: "" })
        setHasSickness(response.profile.has_sickness || false)
        setSicknessType(response.profile.sickness_type || "")
        setHasIllness(response.profile.has_sickness || false)
        setIllnessName(response.profile.sickness_type || "")
        setDateOfBirth(response.profile.date_of_birth || "")
        setWeight(response.profile.weight || 0)
        setHeight(response.profile.height || 0)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast({
        title: "Error",
        description: "Failed to load profile data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const profileData = {
        first_name: firstName,
        last_name: lastName,
        email: email,
        gender: gender,
        age: age,
        mobile_number: mobileNumber,
        currency: currency,
        country: country,
        state: state,
        city: city,
        address: address,
        postal_code: postalCode,
        has_health_condition: hasHealthCondition,
        health_conditions: healthConditions,
        allergies: allergies,
        dietary_preferences: dietaryPreferences,
        medical_history: medicalHistory,
        emergency_contact: emergencyContact,
        has_sickness: hasIllness,
        sickness_type: illnessName,
        date_of_birth: dateOfBirth,
        weight: weight,
        height: height
      }

      const response = await api.updateUserProfile(profileData)
      if (response.status === 'success') {
        toast({
          title: "Success",
          description: "Profile updated successfully.",
        })
        setIsEditing(false)
        fetchProfile()
      } else {
        throw new Error(response.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return 0
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const getInitials = () => {
    return `${firstName.charAt(0) || ''}${lastName.charAt(0) || ''}`.toUpperCase()
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <LoadingScreen size="md" />
  }

  return (
    <div className="h-screen bg-gray-50 overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Profile</h1>
              <p className="text-sm sm:text-base text-gray-600">Manage your account settings and preferences</p>
            </div>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "outline" : "default"}
              className="text-sm sm:text-base"
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Left Column - Profile Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6">
                    {/* Profile Picture */}
                    <div className="flex items-center gap-4 sm:gap-6">
                      <div className="relative">
                        {profileImage ? (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden">
                            <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold">
                            {getInitials()}
                          </div>
                        )}
                        {isEditing && (
                          <div className="absolute -bottom-1 -right-1">
                            <input type="file" id="profile-image" accept="image/*" onChange={handleImageUpload} className="hidden" />
                            <label htmlFor="profile-image">
                              <Button size="sm" variant="outline" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full p-0 cursor-pointer bg-white hover:bg-gray-50">
                                <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            </label>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{profile?.first_name} {profile?.last_name}</h3>
                        <p className="text-sm sm:text-base text-gray-600">{profile?.email}</p>
                        <p className="text-xs sm:text-sm text-gray-500">Member since {formatDate(profile?.created_at)}</p>
                      </div>
                    </div>

                    {/* Name Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">First Name</label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent disabled:bg-gray-50 text-sm sm:text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">Last Name</label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent disabled:bg-gray-50 text-sm sm:text-base"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={profile?.email || ''}
                        disabled
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm sm:text-base"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6">
                    {/* Date of Birth and Age */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">Date of Birth</label>
                        <input
                          type="date"
                          value={dateOfBirth}
                          onChange={(e) => setDateOfBirth(e.target.value)}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent disabled:bg-gray-50 text-sm sm:text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">Age</label>
                        <input
                          type="number"
                          value={calculateAge(dateOfBirth)}
                          disabled
                          className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm sm:text-base"
                        />
                      </div>
                    </div>

                    {/* Weight and Height */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">Weight (kg)</label>
                        <input
                          type="number"
                          value={weight}
                          onChange={(e) => setWeight(Number(e.target.value))}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent disabled:bg-gray-50 text-sm sm:text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">Height (cm)</label>
                        <input
                          type="number"
                          value={height}
                          onChange={(e) => setHeight(Number(e.target.value))}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent disabled:bg-gray-50 text-sm sm:text-base"
                        />
                      </div>
                    </div>

                    {/* Country and Currency */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">Country</label>
                        <select
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent disabled:bg-gray-50 text-sm sm:text-base"
                        >
                          <option value="">Select Country</option>
                          {countries.map(countryName => (
                            <option key={countryName} value={countryName}>
                              {countryName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">Currency</label>
                        <select
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value)}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent disabled:bg-gray-50 text-sm sm:text-base"
                        >
                          {currencies.map(currencyOption => (
                            <option key={currencyOption.code} value={currencyOption.code}>
                              {currencyOption.code} ({currencyOption.symbol}) - {currencyOption.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Medical Conditions */}
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <input
                          type="checkbox"
                          id="hasIllness"
                          checked={hasIllness}
                          onChange={(e) => setHasIllness(e.target.checked)}
                          disabled={!isEditing}
                          className="w-4 h-4 text-[#FF6B6B] border-gray-300 rounded focus:ring-[#FF6B6B]"
                        />
                        <label htmlFor="hasIllness" className="text-sm sm:text-base font-medium text-gray-700">
                          I have medical conditions that affect my diet
                        </label>
                      </div>
                      {hasIllness && (
                        <input
                          type="text"
                          placeholder="Describe your medical conditions..."
                          value={illnessName}
                          onChange={(e) => setIllnessName(e.target.value)}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent disabled:bg-gray-50 text-sm sm:text-base"
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Subscription & Actions */}
              <div className="space-y-6">
                {/* Subscription Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">Subscription</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm sm:text-base text-gray-600">Current Plan</span>
                      <Badge variant={subscription?.plan?.name === 'free' ? 'secondary' : 'default'} className="text-xs sm:text-sm">
                        {subscription?.plan?.display_name || 'Free'}
                      </Badge>
                    </div>
                    {subscription?.plan?.name !== 'free' && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm sm:text-base text-gray-600">Status</span>
                          <Badge variant={subscription?.subscription?.status === 'active' ? 'default' : 'destructive'} className="text-xs sm:text-sm">
                            {subscription?.subscription?.status || 'Inactive'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm sm:text-base text-gray-600">Next Billing</span>
                          <span className="text-sm sm:text-base text-gray-900">
                            {formatDate(subscription?.subscription?.current_period_end)}
                          </span>
                        </div>
                      </>
                    )}
                    <Button 
                      onClick={() => navigate('/payment')} 
                      variant="outline" 
                      className="w-full text-sm sm:text-base"
                    >
                      Manage Subscription
                    </Button>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      onClick={() => navigate('/settings')} 
                      variant="outline" 
                      className="w-full justify-start text-sm sm:text-base"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                    <Button 
                      onClick={() => navigate('/history')} 
                      variant="outline" 
                      className="w-full justify-start text-sm sm:text-base"
                    >
                      <History className="h-4 w-4 mr-2" />
                      History
                    </Button>
                    <Button 
                      onClick={handleLogout} 
                      variant="outline" 
                      className="w-full justify-start text-red-600 hover:text-red-700 text-sm sm:text-base"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </CardContent>
                </Card>

                {/* Save Button */}
                {isEditing && (
                  <Button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm sm:text-base"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
