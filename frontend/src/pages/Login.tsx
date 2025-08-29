"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, Mail, Lock, Utensils, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/utils"
import { api, APIError } from "@/lib/api"
import Logo from "@/components/Logo"

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const { isAuthenticated, refreshAuth, login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || "/ai-kitchen"
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, location])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Ensure we have the latest values (handles autofill)
    const formData = new FormData(e.target as HTMLFormElement)
    const emailValue = formData.get('email') as string || email
    const passwordValue = formData.get('password') as string || password
    
    console.log('[LOGIN] Attempting login with:', { email: emailValue, passwordLength: passwordValue?.length })
    
    if (!emailValue || !passwordValue) {
      console.log('[LOGIN] Missing email or password')
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    
    try {
      console.log('[LOGIN] Calling auth context login...')
      
      // Use the auth context login function
      const result = await login(emailValue, passwordValue)
      
      console.log('[LOGIN] Login successful:', result)
      
      toast({
        title: "Welcome back!",
        description: "You have been successfully logged in.",
      })
      
      // The auth context will handle the redirect automatically
      // Regular users go to main app
      const from = location.state?.from?.pathname || "/ai-kitchen"
      console.log('[LOGIN] Redirecting to:', from)
      navigate(from, { replace: true })
      
    } catch (error) {
      console.error('[LOGIN] Login error:', error)
      let errorMessage = "Login failed. Please try again."
      
      if (error instanceof APIError) {
        console.log('[LOGIN] API Error status:', error.status)
        if (error.status === 401) {
          errorMessage = "Invalid email or password. Please check your credentials."
        } else if (error.status === 0) {
          errorMessage = "Network error. Please check your internet connection and try again."
        } else if (error.status === 408) {
          errorMessage = "Request timed out. This might be due to a slow connection. Please try again."
        } else if (error.status >= 500) {
          errorMessage = "Server error. Please try again in a few minutes."
        } else {
          errorMessage = error.message || errorMessage
        }
      } else if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = "Connection error. Please check your internet connection and try again."
      } else if (error.message && error.message.includes('timeout')) {
        errorMessage = "Request timed out. Please check your connection and try again."
      }
      
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=100&width=100')] opacity-5"></div>

      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <Logo size="xl" className="justify-center mb-4" />
          <p className="text-gray-600 text-lg">Smart Food Detection & Recipe Generation</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center text-gray-900">Welcome Back</CardTitle>
            <p className="text-center text-gray-600">Sign in to your account to continue</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email/Password Form */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    autoComplete="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    inputMode="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-12"
                    required
                    autoComplete="current-password"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

            </form>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="font-semibold text-orange-600 hover:text-orange-700 transition-colors duration-200"
                >
                  Sign up here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Login

