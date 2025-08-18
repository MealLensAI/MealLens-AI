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
  Ruler
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
  const [hasIllness, setHasIllness] = useState(false)
  const [illnessName, setIllnessName] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [weight, setWeight] = useState(0)
  const [height, setHeight] = useState(0)
  const [emergencyContact, setEmergencyContact] = useState({
    name: "",
    phone: "",
    relationship: ""
  })

  // Countries list (shortened for space)
  const countries = [
    'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Spain', 'Italy', 'Netherlands', 'Belgium', 'Switzerland',
    'Austria', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Poland', 'Czech Republic', 'Hungary', 'Romania', 'Bulgaria',
    'Greece', 'Portugal', 'Ireland', 'Luxembourg', 'Malta', 'Cyprus', 'Estonia', 'Latvia', 'Lithuania', 'Slovenia',
    'Slovakia', 'Croatia', 'Serbia', 'Montenegro', 'Albania', 'North Macedonia', 'Bosnia and Herzegovina', 'Kosovo',
    'Iceland', 'Liechtenstein', 'Monaco', 'San Marino', 'Vatican City', 'Andorra', 'Australia', 'New Zealand',
    'Japan', 'South Korea', 'China', 'India', 'Singapore', 'Malaysia', 'Thailand', 'Vietnam', 'Philippines', 'Indonesia',
    'Taiwan', 'Hong Kong', 'Macau', 'Brunei', 'Cambodia', 'Laos', 'Myanmar', 'Bangladesh', 'Sri Lanka', 'Pakistan',
    'Nepal', 'Bhutan', 'Maldives', 'Mongolia', 'Kazakhstan', 'Uzbekistan', 'Kyrgyzstan', 'Tajikistan', 'Turkmenistan',
    'Afghanistan', 'Iran', 'Iraq', 'Syria', 'Lebanon', 'Jordan', 'Israel', 'Palestine', 'Saudi Arabia', 'Yemen',
    'Oman', 'United Arab Emirates', 'Qatar', 'Bahrain', 'Kuwait', 'Egypt', 'Libya', 'Tunisia', 'Algeria', 'Morocco',
    'Sudan', 'South Sudan', 'Ethiopia', 'Eritrea', 'Djibouti', 'Somalia', 'Kenya', 'Uganda', 'Tanzania', 'Rwanda',
    'Burundi', 'Democratic Republic of the Congo', 'Republic of the Congo', 'Gabon', 'Equatorial Guinea', 'Cameroon',
    'Central African Republic', 'Chad', 'Niger', 'Nigeria', 'Benin', 'Togo', 'Ghana', 'Ivory Coast', 'Liberia',
    'Sierra Leone', 'Guinea', 'Guinea-Bissau', 'Senegal', 'Gambia', 'Mauritania', 'Mali', 'Burkina Faso', 'Cape Verde',
    'São Tomé and Príncipe', 'Angola', 'Zambia', 'Malawi', 'Mozambique', 'Zimbabwe', 'Botswana', 'Namibia', 'South Africa',
    'Lesotho', 'Eswatini', 'Madagascar', 'Comoros', 'Mauritius', 'Seychelles', 'Brazil', 'Argentina', 'Chile', 'Peru',
    'Bolivia', 'Paraguay', 'Uruguay', 'Ecuador', 'Colombia', 'Venezuela', 'Guyana', 'Suriname', 'French Guiana',
    'Mexico', 'Guatemala', 'Belize', 'El Salvador', 'Honduras', 'Nicaragua', 'Costa Rica', 'Panama', 'Cuba',
    'Jamaica', 'Haiti', 'Dominican Republic', 'Puerto Rico', 'Trinidad and Tobago', 'Barbados', 'Grenada',
    'Saint Vincent and the Grenadines', 'Saint Lucia', 'Dominica', 'Antigua and Barbuda', 'Saint Kitts and Nevis',
    'Bahamas', 'Fiji', 'Papua New Guinea', 'Solomon Islands', 'Vanuatu', 'New Caledonia', 'Samoa', 'Tonga',
    'Tuvalu', 'Kiribati', 'Marshall Islands', 'Micronesia', 'Palau', 'Nauru'
  ]

  // Get currency for country
  const getCurrencyForCountry = (country: string) => {
    const currencyMap: { [key: string]: string } = {
      'United States': 'USD',
      'Canada': 'CAD',
      'United Kingdom': 'GBP',
      'Germany': 'EUR',
      'France': 'EUR',
      'Spain': 'EUR',
      'Italy': 'EUR',
      'Netherlands': 'EUR',
      'Belgium': 'EUR',
      'Switzerland': 'CHF',
      'Austria': 'EUR',
      'Sweden': 'SEK',
      'Norway': 'NOK',
      'Denmark': 'DKK',
      'Finland': 'EUR',
      'Poland': 'PLN',
      'Czech Republic': 'CZK',
      'Hungary': 'HUF',
      'Romania': 'RON',
      'Bulgaria': 'BGN',
      'Greece': 'EUR',
      'Portugal': 'EUR',
      'Ireland': 'EUR',
      'Luxembourg': 'EUR',
      'Malta': 'EUR',
      'Cyprus': 'EUR',
      'Estonia': 'EUR',
      'Latvia': 'EUR',
      'Lithuania': 'EUR',
      'Slovenia': 'EUR',
      'Slovakia': 'EUR',
      'Croatia': 'EUR',
      'Serbia': 'RSD',
      'Montenegro': 'EUR',
      'Albania': 'ALL',
      'North Macedonia': 'MKD',
      'Bosnia and Herzegovina': 'BAM',
      'Kosovo': 'EUR',
      'Iceland': 'ISK',
      'Liechtenstein': 'CHF',
      'Monaco': 'EUR',
      'San Marino': 'EUR',
      'Vatican City': 'EUR',
      'Andorra': 'EUR',
      'Australia': 'AUD',
      'New Zealand': 'NZD',
      'Japan': 'JPY',
      'South Korea': 'KRW',
      'China': 'CNY',
      'India': 'INR',
      'Singapore': 'SGD',
      'Malaysia': 'MYR',
      'Thailand': 'THB',
      'Vietnam': 'VND',
      'Philippines': 'PHP',
      'Indonesia': 'IDR',
      'Taiwan': 'TWD',
      'Hong Kong': 'HKD',
      'Macau': 'MOP',
      'Brunei': 'BND',
      'Cambodia': 'KHR',
      'Laos': 'LAK',
      'Myanmar': 'MMK',
      'Bangladesh': 'BDT',
      'Sri Lanka': 'LKR',
      'Pakistan': 'PKR',
      'Nepal': 'NPR',
      'Bhutan': 'BTN',
      'Maldives': 'MVR',
      'Mongolia': 'MNT',
      'Kazakhstan': 'KZT',
      'Uzbekistan': 'UZS',
      'Kyrgyzstan': 'KGS',
      'Tajikistan': 'TJS',
      'Turkmenistan': 'TMT',
      'Afghanistan': 'AFN',
      'Iran': 'IRR',
      'Iraq': 'IQD',
      'Syria': 'SYP',
      'Lebanon': 'LBP',
      'Jordan': 'JOD',
      'Israel': 'ILS',
      'Palestine': 'ILS',
      'Saudi Arabia': 'SAR',
      'Yemen': 'YER',
      'Oman': 'OMR',
      'United Arab Emirates': 'AED',
      'Qatar': 'QAR',
      'Bahrain': 'BHD',
      'Kuwait': 'KWD',
      'Egypt': 'EGP',
      'Libya': 'LYD',
      'Tunisia': 'TND',
      'Algeria': 'DZD',
      'Morocco': 'MAD',
      'Sudan': 'SDG',
      'South Sudan': 'SSP',
      'Ethiopia': 'ETB',
      'Eritrea': 'ERN',
      'Djibouti': 'DJF',
      'Somalia': 'SOS',
      'Kenya': 'KES',
      'Uganda': 'UGX',
      'Tanzania': 'TZS',
      'Rwanda': 'RWF',
      'Burundi': 'BIF',
      'Democratic Republic of the Congo': 'CDF',
      'Republic of the Congo': 'XAF',
      'Gabon': 'XAF',
      'Equatorial Guinea': 'XAF',
      'Cameroon': 'XAF',
      'Central African Republic': 'XAF',
      'Chad': 'XAF',
      'Niger': 'XOF',
      'Nigeria': 'NGN',
      'Benin': 'XOF',
      'Togo': 'XOF',
      'Ghana': 'GHS',
      'Ivory Coast': 'XOF',
      'Liberia': 'LRD',
      'Sierra Leone': 'SLL',
      'Guinea': 'GNF',
      'Guinea-Bissau': 'XOF',
      'Senegal': 'XOF',
      'Gambia': 'GMD',
      'Mauritania': 'MRU',
      'Mali': 'XOF',
      'Burkina Faso': 'XOF',
      'Cape Verde': 'CVE',
      'São Tomé and Príncipe': 'STN',
      'Angola': 'AOA',
      'Zambia': 'ZMW',
      'Malawi': 'MWK',
      'Mozambique': 'MZN',
      'Zimbabwe': 'ZWL',
      'Botswana': 'BWP',
      'Namibia': 'NAD',
      'South Africa': 'ZAR',
      'Lesotho': 'LSL',
      'Eswatini': 'SZL',
      'Madagascar': 'MGA',
      'Comoros': 'KMF',
      'Mauritius': 'MUR',
      'Seychelles': 'SCR',
      'Brazil': 'BRL',
      'Argentina': 'ARS',
      'Chile': 'CLP',
      'Peru': 'PEN',
      'Bolivia': 'BOB',
      'Paraguay': 'PYG',
      'Uruguay': 'UYU',
      'Ecuador': 'USD',
      'Colombia': 'COP',
      'Venezuela': 'VES',
      'Guyana': 'GYD',
      'Suriname': 'SRD',
      'French Guiana': 'EUR',
      'Mexico': 'MXN',
      'Guatemala': 'GTQ',
      'Belize': 'BZD',
      'El Salvador': 'USD',
      'Honduras': 'HNL',
      'Nicaragua': 'NIO',
      'Costa Rica': 'CRC',
      'Panama': 'PAB',
      'Cuba': 'CUP',
      'Jamaica': 'JMD',
      'Haiti': 'HTG',
      'Dominican Republic': 'DOP',
      'Puerto Rico': 'USD',
      'Trinidad and Tobago': 'TTD',
      'Barbados': 'BBD',
      'Grenada': 'XCD',
      'Saint Vincent and the Grenadines': 'XCD',
      'Saint Lucia': 'XCD',
      'Dominica': 'XCD',
      'Antigua and Barbuda': 'XCD',
      'Saint Kitts and Nevis': 'XCD',
      'Bahamas': 'BSD',
      'Fiji': 'FJD',
      'Papua New Guinea': 'PGK',
      'Solomon Islands': 'SBD',
      'Vanuatu': 'VUV',
      'New Caledonia': 'XPF',
      'Samoa': 'WST',
      'Tonga': 'TOP',
      'Tuvalu': 'AUD',
      'Kiribati': 'AUD',
      'Marshall Islands': 'USD',
      'Micronesia': 'USD',
      'Palau': 'USD',
      'Nauru': 'AUD'
    }
    return currencyMap[country] || 'USD'
  }

  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry)
    const newCurrency = getCurrencyForCountry(newCountry)
    setCurrency(newCurrency)
  }

  useEffect(() => {
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
          setHasIllness(response.profile.has_sickness || false)
          setIllnessName(response.profile.sickness_type || "")
          setEmergencyContact(response.profile.emergency_contact || { name: "", phone: "", relationship: "" })
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

    fetchProfile()
  }, [toast])

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
        has_sickness: hasIllness,
        sickness_type: illnessName,
        emergency_contact: emergencyContact
      }

      const response = await api.updateUserProfile(profileData)
      if (response.status === 'success') {
        toast({
          title: "Success",
          description: "Profile updated successfully.",
        })
        setIsEditing(false)
        setProfile(response.profile)
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

  const handleCancel = () => {
    if (profile) {
      setFirstName(profile.first_name || "")
      setLastName(profile.last_name || "")
      setEmail(profile.email || "")
      setGender(profile.gender || "")
      setAge(profile.age || 0)
      setMobileNumber(profile.mobile_number || "")
      setCurrency(profile.currency || "USD")
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
      setHasIllness(profile.has_sickness || false)
      setIllnessName(profile.sickness_type || "")
      setEmergencyContact(profile.emergency_contact || { name: "", phone: "", relationship: "" })
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

  // Calculate age from date of birth
  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  // Handle profile image upload
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

  // Loading state
  if (loading) {
    return <LoadingScreen message="Loading profile..." />
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-gray-100 overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-4 p-4 bg-white border-b border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">Profile</h1>
            <p className="text-sm text-gray-600">Manage your account information</p>
          </div>
          {isEditing ? (
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={saving}
                size="sm"
                className="bg-[#FF6B6B] hover:bg-[#FF5252]"
              >
                {saving ? (
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                ) : (
                  <Save className="h-3 w-3 mr-2" />
                )}
                Save
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={saving}
                size="sm"
              >
                <X className="h-3 w-3 mr-2" />
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              size="sm"
            >
              <Edit3 className="h-3 w-3 mr-2" />
              Edit
            </Button>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
            {/* Profile Header */}
            <div className="lg:col-span-3">
              <Card className="bg-white shadow-sm border-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative">
                      {profileImage ? (
                        <div className="w-16 h-16 rounded-full overflow-hidden">
                          <img 
                            src={profileImage} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] rounded-full flex items-center justify-center text-white text-xl font-bold">
                          {getInitials()}
                        </div>
                      )}
                      {isEditing && (
                        <div className="absolute -bottom-1 -right-1">
                          <input
                            type="file"
                            id="profile-image"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          <label htmlFor="profile-image">
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-6 h-6 rounded-full p-0 cursor-pointer bg-white hover:bg-gray-50"
                            >
                              <Camera className="h-3 w-3" />
                            </Button>
                          </label>
                        </div>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                          <h2 className="text-xl font-bold text-gray-900">
                            {firstName} {lastName}
                          </h2>
                          <p className="text-gray-600 flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3" />
                            {email}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            Member since {getMemberSince()}
                          </p>
                        </div>

                        {/* Subscription Status */}
                        <div className="flex flex-col gap-2">
                          {subscription?.subscription?.status === 'active' ? (
                            <Badge className="bg-[#FF6B6B]/10 text-[#FF6B6B] border-[#FF6B6B]/20 text-xs">
                              <Crown className="h-3 w-3 mr-1" />
                          Premium
                            </Badge>
                          ) : isInTrial() ? (
                            <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                          Trial - {getTrialDaysLeft()}d
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-600 text-xs">
                              <Shield className="h-3 w-3 mr-1" />
                          Free
                            </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Personal Information */}
            <div className="lg:col-span-2 space-y-4 overflow-y-auto">
              <Card className="bg-white shadow-sm border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5 text-[#FF6B6B]" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Name Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        disabled={!isEditing}
                        placeholder="Enter your first name"
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        disabled={!isEditing}
                        placeholder="Enter your last name"
                        className="h-9"
                      />
                    </div>
                  </div>

                  {/* Email and Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={!isEditing}
                        placeholder="Enter your email"
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mobileNumber" className="text-sm font-medium">Phone Number</Label>
                      <Input
                        id="mobileNumber"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        disabled={!isEditing}
                        placeholder="Enter your phone number"
                        className="h-9"
                      />
                    </div>
                  </div>

                  {/* Date of Birth and Age */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth" className="text-sm font-medium">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => {
                          setDateOfBirth(e.target.value)
                          setAge(calculateAge(e.target.value))
                        }}
                        disabled={!isEditing}
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age" className="text-sm font-medium">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        value={age}
                        onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                        disabled={!isEditing}
                        placeholder="Enter your age"
                        className="h-9"
                      />
                    </div>
                  </div>

                  {/* Gender and Weight */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="gender" className="text-sm font-medium">Gender</Label>
                      <Select value={gender} onValueChange={setGender} disabled={!isEditing}>
                        <SelectTrigger className="h-9">
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
                      <Label htmlFor="weight" className="text-sm font-medium">Weight (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                        disabled={!isEditing}
                        placeholder="Enter your weight"
                        className="h-9"
                      />
                    </div>
                  </div>

                  {/* Height and Currency */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="height" className="text-sm font-medium">Height (cm)</Label>
                      <Input
                        id="height"
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
                        disabled={!isEditing}
                        placeholder="Enter your height"
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency" className="text-sm font-medium">Currency</Label>
                      <Select value={currency} onValueChange={setCurrency} disabled={!isEditing}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                          <SelectItem value="NGN">NGN (₦)</SelectItem>
                          <SelectItem value="CAD">CAD (C$)</SelectItem>
                          <SelectItem value="AUD">AUD (A$)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Illness Section */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                      <Switch
                        id="hasIllness"
                        checked={hasIllness}
                        onCheckedChange={setHasIllness}
                        disabled={!isEditing}
                      />
                      <Label htmlFor="hasIllness" className="text-sm font-medium">Do you have any illnesses?</Label>
                    </div>
                    {hasIllness && (
                      <div className="space-y-2">
                        <Label htmlFor="illnessName" className="text-sm font-medium">Illness Name(s)</Label>
                        <Input
                          id="illnessName"
                          value={illnessName}
                          onChange={(e) => setIllnessName(e.target.value)}
                          disabled={!isEditing}
                          placeholder="Enter illness name(s)"
                          className="h-9"
                        />
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Address Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#FF6B6B]" />
                      Address Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="country" className="text-sm font-medium">Country</Label>
                        <Select value={country} onValueChange={handleCountryChange} disabled={!isEditing}>
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map((countryName) => (
                              <SelectItem key={countryName} value={countryName}>
                                {countryName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state" className="text-sm font-medium">State/Province</Label>
                        <Input
                          id="state"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          disabled={!isEditing}
                          placeholder="Enter your state"
                          className="h-9"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-sm font-medium">City</Label>
                        <Input
                          id="city"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          disabled={!isEditing}
                          placeholder="Enter your city"
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="postalCode" className="text-sm font-medium">Postal Code</Label>
                        <Input
                          id="postalCode"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          disabled={!isEditing}
                          placeholder="Enter your postal code"
                          className="h-9"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Label htmlFor="address" className="text-sm font-medium">Address</Label>
                      <Input
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        disabled={!isEditing}
                        placeholder="Enter your full address"
                        className="h-9 mt-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4 overflow-y-auto">
              {/* Quick Actions */}
              <Card className="bg-white shadow-sm border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Settings className="h-5 w-5 text-[#FF6B6B]" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-sm h-9"
                    onClick={() => navigate('/settings')}
                  >
                    <Settings className="h-3 w-3 mr-2" />
                    Settings
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-sm h-9"
                    onClick={() => navigate('/payment')}
                  >
                    <CreditCard className="h-3 w-3 mr-2" />
                    Billing
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
