"use client"

import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { LogOut, Home, Camera, History, CalendarDays, User } from "lucide-react"
import { useAuth } from "@/lib/utils"
import DashboardHeader from "./DashboardHeader"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const { user, logout, isAuthenticated } = useAuth()
  const [showWelcome, setShowWelcome] = useState(false)
  const [showOnboardingReminder, setShowOnboardingReminder] = useState(false)

  // First-login celebration and onboarding reminder
  useEffect(() => {
    if (!isAuthenticated) return
    const hasSeenWelcome = localStorage.getItem('seen_welcome_modal') === 'true'
    const onboardingComplete = localStorage.getItem('onboarding_complete') === 'true'
    if (!hasSeenWelcome) {
      setShowWelcome(true)
      localStorage.setItem('seen_welcome_modal', 'true')
    }
    if (!onboardingComplete) {
      setShowOnboardingReminder(true)
    }
  }, [isAuthenticated])

  const handleSignOut = async () => {
    try {
      await logout()
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      })
      navigate("/login")
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (!isAuthenticated) {
    return null // Don't render layout if not authenticated
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Use the new DashboardHeader component */}
      <DashboardHeader />

      <main className="flex-1">
        {children}
      </main>

      {/* First login celebration */}
      {showWelcome && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <Card className="max-w-md w-full text-center">
            <CardHeader>
              <CardTitle>Welcome to MealLens 🎉</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Badge className="bg-orange-500 text-white">3 Days Free Trial</Badge>
              <p>You have 3 days of unlimited access to all features! Enjoy unlimited AI detections, meal planning, and more.</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => { setShowWelcome(false); navigate('/detect-food') }} className="bg-orange-500 hover:bg-orange-600">Start Using App</Button>
                <Button variant="outline" onClick={() => setShowWelcome(false)}>Close</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Onboarding reminder */}
      {showOnboardingReminder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <Card className="max-w-md w-full text-center">
            <CardHeader>
              <CardTitle>Complete Your Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Please complete onboarding so we can personalize your experience.</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => { setShowOnboardingReminder(false); navigate('/onboarding') }} className="bg-orange-500 hover:bg-orange-600">Continue Onboarding</Button>
                <Button variant="outline" onClick={() => setShowOnboardingReminder(false)}>Later</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default MainLayout
