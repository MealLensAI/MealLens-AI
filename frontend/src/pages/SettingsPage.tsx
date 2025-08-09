import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Bell, Globe, Shield, Palette, Download, Settings, Moon, Sun, Monitor, Zap, Eye, EyeOff, Mail } from "lucide-react"
import { Link } from "react-router-dom"
import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/utils"
import { api } from "@/lib/api"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import UsageDashboard from "@/components/UsageDashboard"

export default function SettingsPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)

  const handleSaveSettings = async () => {
    setLoading(true)
    try {
      // Save notification settings (you can add more API calls here)
      
    toast({
      title: "Settings Saved",
        description: "Your notification preferences have been updated successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save settings.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExportData = async () => {
    setLoading(true)
    try {
      // Here you would call an API to export user data
    toast({
      title: "Data Export",
      description: "Your data export has been initiated. You'll receive an email when it's ready.",
    })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to export data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-4xl mx-auto p-6">
        {/* Main Content */}
            <div className="space-y-6">
          {/* Settings Header */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#e2e8f0]">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <Settings className="h-6 w-6 text-white" />
                  </div>
              <div>
                <h1 className="text-2xl font-bold text-[#2D3436]">Settings</h1>
                <p className="text-gray-600">Customize your notification preferences and data</p>
                    </div>
                  </div>
                </div>

            {/* Notifications */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#e2e8f0]">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="h-6 w-6 text-blue-500" />
              <h2 className="text-xl font-bold text-[#2D3436]">Notifications</h2>
                      </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-blue-600" />
                      <div>
                    <Label className="text-sm font-semibold text-[#2D3436]">Email Notifications</Label>
                  <p className="text-xs text-gray-500">Receive updates via email</p>
                      </div>
                    </div>
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                      className="data-[state=checked]:bg-blue-500"
                    />
                  </div>
              
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-green-600" />
                      <div>
                    <Label className="text-sm font-semibold text-[#2D3436]">Push Notifications</Label>
                  <p className="text-xs text-gray-500">Get instant alerts on your device</p>
                      </div>
                    </div>
                    <Switch
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                  className="data-[state=checked]:bg-green-500"
                />
                      </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-200">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-purple-600" />
                      <div>
                    <Label className="text-sm font-semibold text-[#2D3436]">General Notifications</Label>
                  <p className="text-xs text-gray-500">Receive all app notifications</p>
                      </div>
                    </div>
                    <Switch
                  checked={notifications}
                  onCheckedChange={setNotifications}
                      className="data-[state=checked]:bg-purple-500"
                    />
                  </div>
                      </div>
          </div>

            {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#e2e8f0]">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="h-6 w-6 text-yellow-500" />
              <h2 className="text-xl font-bold text-[#2D3436]">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={handleSaveSettings}
                disabled={loading}
                className="w-full bg-[#FF6B6B] hover:bg-[#FF8E53] text-white font-semibold py-3"
                >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Settings className="h-4 w-4 mr-2" />
                )}
            Save Settings
          </Button>
                <Button 
                variant="outline"
                  onClick={handleExportData}
                disabled={loading}
                className="w-full border-[#e2e8f0] hover:bg-gray-50 py-3"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
            </div>
          </div>

          {/* Account Status */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#e2e8f0]">
            <h3 className="text-lg font-semibold text-[#2D3436] mb-4">Account Status</h3>
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                <span className="text-gray-600">Plan</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Premium
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                <span className="text-gray-600">Status</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Active
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                <span className="text-gray-600">Last Login</span>
                <span className="text-sm font-medium text-[#2D3436]">2 hours ago</span>
              </div>
                </div>
                </div>

          {/* Usage Dashboard */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#e2e8f0]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#2D3436]">Usage & Subscription</h3>
                <p className="text-sm text-gray-600">Monitor your feature usage and subscription status</p>
              </div>
            </div>
            <UsageDashboard />
          </div>

          {/* Health Information Link */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#e2e8f0]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#2D3436]">Health Information</h3>
                <p className="text-sm text-gray-600">Manage your medical conditions and allergies</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Your health information is managed in your profile page for better organization and comprehensive management.
            </p>
            <Button 
              asChild
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-3"
            >
              <Link to="/profile">
                Go to Profile
              </Link>
          </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
