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
  CreditCard
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { Loader2 } from "lucide-react"
import LoadingScreen from "@/components/LoadingScreen"

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
}

export default function ProfilePage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const { subscription, isInTrial, getTrialDaysLeft } = useSubscription()
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
  const [currency, setCurrency] = useState("NGN")
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

  // Auto-set currency based on country
  const getCurrencyForCountry = (country: string) => {
    const currencyMap: Record<string, string> = {
      'Nigeria': 'NGN',
      'United States': 'USD',
      'United Kingdom': 'GBP',
      'Canada': 'CAD',
      'Australia': 'AUD',
      'Germany': 'EUR',
      'France': 'EUR',
      'Spain': 'EUR',
      'Italy': 'EUR',
      'Netherlands': 'EUR',
      'Belgium': 'EUR',
      'Austria': 'EUR',
      'Portugal': 'EUR',
      'Ireland': 'EUR',
      'Finland': 'EUR',
      'Luxembourg': 'EUR',
      'Slovenia': 'EUR',
      'Slovakia': 'EUR',
      'Estonia': 'EUR',
      'Latvia': 'EUR',
      'Lithuania': 'EUR',
      'Malta': 'EUR',
      'Cyprus': 'EUR',
      'Greece': 'EUR'
    }
    return currencyMap[country] || 'USD'
  }

  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry)
    const newCurrency = getCurrencyForCountry(newCountry)
    setCurrency(newCurrency)
  }

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return

      try {
        setLoading(true)
        const response = await api.get('/profile')
        
        if (response.status === 'success' && response.profile) {
          const profileData = response.profile
          setProfile(profileData)
          
          // Set form fields
          setFirstName(profileData.first_name || "")
          setLastName(profileData.last_name || "")
          setEmail(profileData.email || "")
          setGender(profileData.gender || "")
          setAge(profileData.age || 0)
          setMobileNumber(profileData.mobile_number || "")
          setCurrency(profileData.currency || "NGN")
          setCountry(profileData.country || "")
          setState(profileData.state || "")
          setCity(profileData.city || "")
          setAddress(profileData.address || "")
          setPostalCode(profileData.postal_code || "")
          setHasHealthCondition(profileData.has_health_condition || false)
          setHealthConditions(profileData.health_conditions || [])
          setAllergies(profileData.allergies || [])
          setDietaryPreferences(profileData.dietary_preferences || [])
          setMedicalHistory(profileData.medical_history || [])
          setEmergencyContact(profileData.emergency_contact || { name: "", phone: "", relationship: "" })
          setHasSickness(profileData.has_sickness || false)
          setSicknessType(profileData.sickness_type || "")
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user, toast])

  // Save profile changes
  const handleSave = async () => {
    if (!user) return

    try {
      setSaving(true)
      const response = await api.put('/profile', {
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
        has_sickness: hasSickness,
        sickness_type: sicknessType
      })

      if (response.status === 'success') {
        toast({
          title: "Success",
          description: "Profile updated successfully",
        })
        setIsEditing(false)
        // Refresh profile data
        setProfile(response.profile)
      } else {
        throw new Error(response.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Cancel editing
  const handleCancel = () => {
    if (profile) {
      setFirstName(profile.first_name || "")
      setLastName(profile.last_name || "")
      setEmail(profile.email || "")
      setGender(profile.gender || "")
      setAge(profile.age || 0)
      setMobileNumber(profile.mobile_number || "")
      setCurrency(profile.currency || "NGN")
      setCountry(profile.country || "")
      setState(profile.state || "")
      setCity(profile.city || "")
      setAddress(profile.address || "")
      setPostalCode(profile.postal_code || "")
      setHasHealthCondition(profile.has_health_condition || false)
      setHealthConditions(profile.health_conditions || [])
      setAllergies(profile.allergies || [])
      setDietaryPreferences(profile.dietary_preferences || [])
      setMedicalHistory(profile.medical_history || [])
      setEmergencyContact(profile.emergency_contact || { name: "", phone: "", relationship: "" })
      setHasSickness(profile.has_sickness || false)
      setSicknessType(profile.sickness_type || "")
    }
    setIsEditing(false)
  }

  // Get user initials
  const getInitials = () => {
    const first = firstName.charAt(0).toUpperCase()
    const last = lastName.charAt(0).toUpperCase()
    return first + last
  }

  // Get member since date
  const getMemberSince = () => {
    if (!profile?.created_at) return "Unknown"
    return new Date(profile.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    })
  }

  // Loading state
  if (loading) {
    return <LoadingScreen message="Loading profile..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600">Manage your account information and preferences</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Header Card */}
          <div className="lg:col-span-3">
            <Card className="bg-white shadow-sm border-0">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {getInitials()}
                    </div>
                    {isEditing && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full p-0"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          {firstName} {lastName}
                        </h2>
                        <p className="text-gray-600 flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {email}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Member since {getMemberSince()}
                        </p>
                      </div>

                      {/* Subscription Status */}
                      <div className="flex flex-col gap-2">
                        {subscription?.subscription?.status === 'active' ? (
                          <Badge className="bg-[#FF6B6B]/10 text-[#FF6B6B] border-[#FF6B6B]/20">
                            <Crown className="h-3 w-3 mr-1" />
                            Premium Member
                          </Badge>
                        ) : isInTrial() ? (
                          <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                            <Clock className="h-3 w-3 mr-1" />
                            Trial - {getTrialDaysLeft()} days left
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-600">
                            <Shield className="h-3 w-3 mr-1" />
                            Free Plan
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Edit Button */}
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button
                          onClick={handleSave}
                          disabled={saving}
                          className="bg-[#FF6B6B] hover:bg-[#FF5252]"
                        >
                          {saving ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleCancel}
                          disabled={saving}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => setIsEditing(true)}
                        variant="outline"
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Personal Information */}
          <div className="lg:col-span-2">
            <Card className="bg-white shadow-sm border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                                          <User className="h-5 w-5 text-[#FF6B6B]" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Update your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                {/* Email and Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter your email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mobileNumber">Phone Number</Label>
                    <Input
                      id="mobileNumber"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                {/* Gender and Age */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={gender} onValueChange={setGender} disabled={!isEditing}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={age}
                      onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                      disabled={!isEditing}
                      placeholder="Enter your age"
                    />
                  </div>
                </div>

                <Separator />

                {/* Address Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Address Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Select value={country} onValueChange={handleCountryChange} disabled={!isEditing}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Nigeria">Nigeria</SelectItem>
                          <SelectItem value="United States">United States</SelectItem>
                          <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                          <SelectItem value="Canada">Canada</SelectItem>
                          <SelectItem value="Australia">Australia</SelectItem>
                          <SelectItem value="Germany">Germany</SelectItem>
                          <SelectItem value="France">France</SelectItem>
                          <SelectItem value="Spain">Spain</SelectItem>
                          <SelectItem value="Italy">Italy</SelectItem>
                          <SelectItem value="Netherlands">Netherlands</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State/Province</Label>
                      <Input
                        id="state"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        disabled={!isEditing}
                        placeholder="Enter your state"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        disabled={!isEditing}
                        placeholder="Enter your city"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        disabled={!isEditing}
                        placeholder="Enter postal code"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="address">Full Address</Label>
                    <Input
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter your full address"
                      className="mt-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Subscription Card */}
            <Card className="bg-white shadow-sm border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-600" />
                  Subscription
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {subscription?.subscription?.status === 'active' ? (
                  <div className="text-center">
                                            <CheckCircle className="h-8 w-8 text-[#FF6B6B] mx-auto mb-2" />
                    <p className="font-semibold text-green-800">Active Subscription</p>
                    <p className="text-sm text-gray-600">
                      {subscription.plan?.display_name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Renews {subscription.subscription.current_period_end ? 
                        new Date(subscription.subscription.current_period_end).toLocaleDateString() : 
                        'Unknown'
                      }
                    </p>
                  </div>
                ) : isInTrial() ? (
                  <div className="text-center">
                    <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <p className="font-semibold text-orange-800">Free Trial</p>
                    <p className="text-sm text-gray-600">
                      {getTrialDaysLeft()} days remaining
                    </p>
                    <Button 
                      onClick={() => navigate('/payment')}
                      className="w-full mt-3 bg-[#FF6B6B] hover:bg-[#FF5252]"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Upgrade Now
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Shield className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                    <p className="font-semibold text-gray-800">Free Plan</p>
                    <p className="text-sm text-gray-600">
                      Limited features
                    </p>
                    <Button 
                      onClick={() => navigate('/payment')}
                      className="w-full mt-3 bg-[#FF6B6B] hover:bg-[#FF5252]"
                    >
                      <Crown className="h-4 w-4 mr-2" />
                      Get Premium
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white shadow-sm border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-gray-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/settings')}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/payment')}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Billing
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
