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
import { api } from "@/lib/api"
import { ArrowLeft, User, Mail, Calendar, Edit3, Save, X, Camera, Shield, Star, AlertTriangle, Plus, Minus, Heart, Activity, Utensils, Droplets, Zap, Target, TrendingUp, Award, Clock, CheckCircle } from "lucide-react"
import { Link } from "react-router-dom"
import { Loader2 } from "lucide-react"

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
  // Location & Payment
  currency: string
  country: string
  state: string
  city: string
  address: string
  postal_code: string
  // Payment details (encrypted)
  payment_methods: {
    type: string
    last4: string
    brand: string
    is_default: boolean
  }[]
  // Sickness/Health Settings
  has_sickness: boolean
  sickness_type: string
  created_at: string
  updated_at: string
}

export default function ProfilePage() {
  const { toast } = useToast()
  const { user, token } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
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
  const [gender, setGender] = useState("")
  const [age, setAge] = useState<number>(0)
  const [mobileNumber, setMobileNumber] = useState("")
  const [currency, setCurrency] = useState("NGN")
  const [country, setCountry] = useState("")
  const [state, setState] = useState("")
  const [city, setCity] = useState("")
  const [address, setAddress] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [paymentMethods, setPaymentMethods] = useState<{
    type: string
    last4: string
    brand: string
    is_default: boolean
  }[]>([])

  // Sickness/Health Settings
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
      'India': 'INR',
      'Ghana': 'GHS',
      'Kenya': 'KES'
    }
    return currencyMap[country] || 'USD'
  }

  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry)
    setCurrency(getCurrencyForCountry(newCountry))
  }
  
  // New input states
  const [newHealthCondition, setNewHealthCondition] = useState("")
  const [newAllergy, setNewAllergy] = useState("")
  const [newDietaryPreference, setNewDietaryPreference] = useState("")
  const [newMedicalHistory, setNewMedicalHistory] = useState("")

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to view your profile.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      setEmail(user.email || "")

      try {
        const response = await api.getUserProfile()
        
        if (response.status === 'success' && response.profile) {
          setProfile(response.profile)
          setFirstName(response.profile.first_name || "")
          setLastName(response.profile.last_name || "")
          setHasHealthCondition(response.profile.has_health_condition || false)
          setHealthConditions(response.profile.health_conditions || [])
          setAllergies(response.profile.allergies || [])
          setDietaryPreferences(response.profile.dietary_preferences || [])
          setMedicalHistory(response.profile.medical_history || [])
          setEmergencyContact(response.profile.emergency_contact || { name: "", phone: "", relationship: "" })
          setGender(response.profile.gender || "")
          setAge(response.profile.age || 0)
          setMobileNumber(response.profile.mobile_number || "")
          setCurrency(response.profile.currency || "NGN")
          setCountry(response.profile.country || "")
          setState(response.profile.state || "")
          setCity(response.profile.city || "")
          setAddress(response.profile.address || "")
          setPostalCode(response.profile.postal_code || "")
          setPaymentMethods(response.profile.payment_methods || [])
          setHasSickness(response.profile.has_sickness || false)
          setSicknessType(response.profile.sickness_type || "")
        } else {
          // Profile not found, create empty profile
          setProfile({
            id: user.uid,
            firebase_uid: user.uid,
            email: user.email || "",
            first_name: "",
            last_name: "",
            has_health_condition: false,
            health_conditions: [],
            allergies: [],
            dietary_preferences: [],
            medical_history: [],
            emergency_contact: { name: "", phone: "", relationship: "" },
            gender: "",
            age: 0,
            mobile_number: "",
            currency: "NGN",
            country: "",
            state: "",
            city: "",
            address: "",
            postal_code: "",
            payment_methods: [],
            has_sickness: false,
            sickness_type: "",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          setFirstName("")
          setLastName("")
          setHasHealthCondition(false)
          setHealthConditions([])
          setAllergies([])
          setDietaryPreferences([])
          setMedicalHistory([])
          setEmergencyContact({ name: "", phone: "", relationship: "" })
        }
      } catch (error: any) {
        console.error("Error fetching profile:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to load profile.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [toast, user])

  const handleSave = async () => {
    setLoading(true)
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save your profile.",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    try {
      const response = await api.updateUserProfile({
          first_name: firstName,
          last_name: lastName,
          email: user.email,
          gender: gender,
          age: age,
          mobile_number: mobileNumber,
          currency: currency,
          country: country,
          state: state,
          city: city,
          address: address,
          postal_code: postalCode,
          payment_methods: paymentMethods,
          has_sickness: hasSickness,
          sickness_type: sicknessType,
        has_health_condition: hasHealthCondition,
        health_conditions: healthConditions,
        allergies: allergies,
        dietary_preferences: dietaryPreferences,
        medical_history: medicalHistory,
        emergency_contact: emergencyContact,
      })

      if (response.status === 'success') {
        setProfile(response.profile)
        setIsEditing(false)
        toast({
          title: "Success",
          description: "Profile updated successfully!",
        })
      } else {
        throw new Error(response.message || "Failed to update profile")
      }
    } catch (error: any) {
      console.error("Error saving profile:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save profile.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getInitials = () => {
    const first = firstName.charAt(0).toUpperCase()
    const last = lastName.charAt(0).toUpperCase()
    return first + last
  }

  const getMemberSince = () => {
    if (!profile?.created_at) return "Recently"
    const date = new Date(profile.created_at)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    })
  }

  // Add functions
  const addHealthCondition = () => {
    if (newHealthCondition.trim() && !healthConditions.includes(newHealthCondition.trim())) {
      setHealthConditions([...healthConditions, newHealthCondition.trim()])
      setNewHealthCondition("")
    }
  }

  const addAllergy = () => {
    if (newAllergy.trim() && !allergies.includes(newAllergy.trim())) {
      setAllergies([...allergies, newAllergy.trim()])
      setNewAllergy("")
    }
  }

  const addDietaryPreference = () => {
    if (newDietaryPreference.trim() && !dietaryPreferences.includes(newDietaryPreference.trim())) {
      setDietaryPreferences([...dietaryPreferences, newDietaryPreference.trim()])
      setNewDietaryPreference("")
    }
  }

  const addMedicalHistory = () => {
    if (newMedicalHistory.trim() && !medicalHistory.includes(newMedicalHistory.trim())) {
      setMedicalHistory([...medicalHistory, newMedicalHistory.trim()])
      setNewMedicalHistory("")
    }
  }

  // Remove functions
  const removeHealthCondition = (condition: string) => {
    setHealthConditions(healthConditions.filter(c => c !== condition))
  }

  const removeAllergy = (allergy: string) => {
    setAllergies(allergies.filter(a => a !== allergy))
  }

  const removeDietaryPreference = (preference: string) => {
    setDietaryPreferences(dietaryPreferences.filter(p => p !== preference))
  }

  const removeMedicalHistory = (history: string) => {
    setMedicalHistory(medicalHistory.filter(h => h !== history))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#FF6B6B] mx-auto mb-4" />
          <p className="text-[#2D3436]">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button asChild variant="ghost" className="p-2">
            <Link to="/">
                <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
            <div>
              <h1 className="text-3xl font-bold text-[#2D3436]">Profile & Health</h1>
              <p className="text-gray-600">Manage your personal information and health data</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header Card */}
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {getInitials()}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">
                        {firstName && lastName ? `${firstName} ${lastName}` : 'Your Profile'}
                      </h2>
                      <p className="text-white/80">{email}</p>
                      <p className="text-sm text-white/60">Member since {getMemberSince()}</p>
                    </div>
                  </div>
                  {!isEditing && (
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="secondary"
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
                </div>

              {isEditing && (
                <CardContent className="p-6">
            <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                        <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                          className="mt-1"
                />
              </div>
              <div>
                        <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="gender">Gender</Label>
                        <Select value={gender} onValueChange={setGender}>
                          <SelectTrigger className="mt-1">
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
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="age">Age</Label>
                        <Input
                          id="age"
                          type="number"
                          value={age || ""}
                          onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                          className="mt-1"
                          placeholder="Enter your age"
                        />
                      </div>
                      <div>
                        <Label htmlFor="mobileNumber">Mobile Number</Label>
                        <Input
                          id="mobileNumber"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          className="mt-1"
                          placeholder="+234 801 234 5678"
                />
                      </div>
              </div>
                    
              <div>
                      <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={email}
                  disabled
                        className="mt-1 bg-gray-50"
                />
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed here</p>
                    </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold">Location & Payment Details</Label>
                  <p className="text-xs text-gray-500 mb-4">Your location helps us set the correct currency and payment options</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Select value={country} onValueChange={handleCountryChange}>
                      <SelectTrigger className="mt-1">
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
                        <SelectItem value="India">India</SelectItem>
                        <SelectItem value="Ghana">Ghana</SelectItem>
                        <SelectItem value="Kenya">Kenya</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NGN">Nigerian Naira (₦)</SelectItem>
                        <SelectItem value="USD">US Dollar ($)</SelectItem>
                        <SelectItem value="EUR">Euro (€)</SelectItem>
                        <SelectItem value="GBP">British Pound (£)</SelectItem>
                        <SelectItem value="CAD">Canadian Dollar (C$)</SelectItem>
                        <SelectItem value="AUD">Australian Dollar (A$)</SelectItem>
                        <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                        <SelectItem value="GHS">Ghanaian Cedi (₵)</SelectItem>
                        <SelectItem value="KES">Kenyan Shilling (KSh)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="state">State/Province</Label>
                    <Input
                      id="state"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Enter state or province"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Enter city"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="Enter postal code"
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="address">Full Address</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your full address"
                    className="mt-1"
                  />
                </div>
              </div>
              
              {/* Payment Methods Section */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold">Payment Methods</Label>
                  <p className="text-xs text-gray-500 mb-4">Securely manage your payment methods for subscriptions</p>
                </div>
                
                {paymentMethods.length > 0 ? (
                  <div className="space-y-3">
                    {paymentMethods.map((method, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 text-sm font-semibold">
                              {method.brand === 'visa' ? 'V' : method.brand === 'mastercard' ? 'M' : 'C'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {method.brand.charAt(0).toUpperCase() + method.brand.slice(1)} •••• {method.last4}
                            </p>
                            <p className="text-xs text-gray-500">{method.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {method.is_default && (
                            <Badge variant="secondary" className="text-xs">Default</Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-gray-400 text-xl">💳</span>
                    </div>
                    <p className="text-gray-500 text-sm mb-2">No payment methods added</p>
                    <p className="text-gray-400 text-xs">Add a payment method to enable automatic billing</p>
                  </div>
                )}
                
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment Method
                </Button>
              </div>
              
              {/* Sickness/Health Status Section */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold">Health Status</Label>
                  <p className="text-xs text-gray-500 mb-4">Help us customize your meal plans and recommendations</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">Do you have any health conditions or sickness?</Label>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="sickness-yes"
                          name="sickness"
                          checked={hasSickness}
                          onChange={() => setHasSickness(true)}
                          className="text-pink-500 focus:ring-pink-500"
                        />
                        <Label htmlFor="sickness-yes" className="text-sm">Yes, I have a condition</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="sickness-no"
                          name="sickness"
                          checked={!hasSickness}
                          onChange={() => setHasSickness(false)}
                          className="text-pink-500 focus:ring-pink-500"
                        />
                        <Label htmlFor="sickness-no" className="text-sm">No, I'm healthy</Label>
                      </div>
                    </div>
                  </div>
                  
                  {hasSickness && (
                    <div>
                      <Label htmlFor="sickness-type" className="text-base font-medium">
                        What type of condition do you have?
                      </Label>
                      <Input
                        id="sickness-type"
                        type="text"
                        placeholder="e.g., Diabetes, Hypertension, Heart Disease, etc."
                        value={sicknessType}
                        onChange={(e) => setSicknessType(e.target.value)}
                        className="mt-2"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        This helps us create personalized meal plans and recommendations
                      </p>
                    </div>
                  )}
                </div>
              </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Health Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <Heart className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle>Health Information</CardTitle>
                    <CardDescription>Manage your medical conditions and health preferences</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Medical Conditions */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-200">
                    <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                      <div>
                        <Label className="text-sm font-semibold">I have medical conditions</Label>
                        <p className="text-xs text-gray-500">This helps us provide personalized recommendations</p>
                  </div>
                    </div>
                    <Switch
                      checked={hasHealthCondition}
                      onCheckedChange={setHasHealthCondition}
                      className="data-[state=checked]:bg-orange-500"
                    />
                  </div>

                  {hasHealthCondition && (
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold">Medical Conditions</Label>
                      <div className="space-y-2">
                        {healthConditions.map((condition, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                            <span className="text-sm">{condition}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeHealthCondition(condition)}
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <Input
                            value={newHealthCondition}
                            onChange={(e) => setNewHealthCondition(e.target.value)}
                            placeholder="Add medical condition"
                            className="flex-1"
                            onKeyPress={(e) => e.key === 'Enter' && addHealthCondition()}
                          />
                          <Button
                            onClick={addHealthCondition}
                            disabled={!newHealthCondition.trim()}
                            size="sm"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Allergies */}
                  <div className="space-y-3">
                  <Label className="text-sm font-semibold">Food Allergies</Label>
                    <div className="space-y-2">
                      {allergies.map((allergy, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                        <span className="text-sm">{allergy}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAllergy(allergy)}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    <div className="flex gap-2">
                        <Input
                          value={newAllergy}
                          onChange={(e) => setNewAllergy(e.target.value)}
                        placeholder="Add food allergy"
                        className="flex-1"
                          onKeyPress={(e) => e.key === 'Enter' && addAllergy()}
                        />
                      <Button
                        onClick={addAllergy}
                        disabled={!newAllergy.trim()}
                        size="sm"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Dietary Preferences */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Dietary Preferences</Label>
                  <div className="space-y-2">
                    {dietaryPreferences.map((preference, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                        <span className="text-sm">{preference}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDietaryPreference(preference)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Input
                        value={newDietaryPreference}
                        onChange={(e) => setNewDietaryPreference(e.target.value)}
                        placeholder="Add dietary preference (e.g., vegetarian, vegan)"
                        className="flex-1"
                        onKeyPress={(e) => e.key === 'Enter' && addDietaryPreference()}
                      />
                      <Button
                        onClick={addDietaryPreference}
                        disabled={!newDietaryPreference.trim()}
                        size="sm"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Medical History */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Medical History</Label>
                  <div className="space-y-2">
                    {medicalHistory.map((history, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                        <span className="text-sm">{history}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMedicalHistory(history)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Input
                        value={newMedicalHistory}
                        onChange={(e) => setNewMedicalHistory(e.target.value)}
                        placeholder="Add medical history item"
                        className="flex-1"
                        onKeyPress={(e) => e.key === 'Enter' && addMedicalHistory()}
                      />
                      <Button
                        onClick={addMedicalHistory}
                        disabled={!newMedicalHistory.trim()}
                        size="sm"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle>Emergency Contact</CardTitle>
                    <CardDescription>Add emergency contact information</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Contact Name</Label>
                    <Input
                      value={emergencyContact.name}
                      onChange={(e) => setEmergencyContact(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Full name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Phone Number</Label>
                    <Input
                      value={emergencyContact.phone}
                      onChange={(e) => setEmergencyContact(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Phone number"
                      className="mt-1"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Relationship</Label>
                    <Input
                      value={emergencyContact.relationship}
                      onChange={(e) => setEmergencyContact(prev => ({ ...prev, relationship: e.target.value }))}
                      placeholder="e.g., Spouse, Parent, Friend"
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save/Cancel Buttons */}
            {isEditing && (
              <div className="flex gap-3">
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 text-white"
                >
                  {loading ? (
                    <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" /> Save Changes
                          </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                  className="flex-1"
                >
                        <X className="mr-2 h-4 w-4" /> Cancel
                </Button>
            </div>
          )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Profile Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Health Score</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    85%
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Medical Conditions</span>
                  <Badge variant="outline" className="bg-orange-50 text-orange-700">
                    {healthConditions.length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Allergies</span>
                  <Badge variant="outline" className="bg-red-50 text-red-700">
                    {allergies.length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Dietary Preferences</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    {dietaryPreferences.length}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Target className="h-4 w-4 mr-2" />
                  Set Health Goals
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Utensils className="h-4 w-4 mr-2" />
                  Dietary Plan
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Droplets className="h-4 w-4 mr-2" />
                  Water Intake
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="h-4 w-4 mr-2" />
                  Activity Log
                </Button>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Profile Complete</p>
                    <p className="text-xs text-gray-500">All sections filled</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Active User</p>
                    <p className="text-xs text-gray-500">30+ days</p>
                  </div>
            </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
