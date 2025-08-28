"use client"

import type React from "react"
import { Navigate, useLocation } from "react-router-dom"
import { Utensils } from "lucide-react"
import LoadingScreen from "@/components/LoadingScreen"
import { useAuth } from "@/lib/utils"

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, fallback }) => {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <LoadingScreen size="md" />
  }

  if (!isAuthenticated) {
    // If fallback is provided, show it instead of redirecting
    if (fallback) {
      return <>{fallback}</>
    }
    // Redirect to login with the current location as the intended destination
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // After authentication, gate users to onboarding until completed
  const onboardingComplete = localStorage.getItem('onboarding_complete') === 'true'
  const isOnOnboardingRoute = location.pathname === '/onboarding'

  if (!onboardingComplete && !isOnOnboardingRoute) {
    return <Navigate to="/onboarding" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
