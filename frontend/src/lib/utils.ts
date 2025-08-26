import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { api } from "./api"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface User {
  uid: string
  email: string
  displayName?: string
  photoURL?: string
  created_at?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  isAuthenticated: boolean
  refreshAuth: () => Promise<void>
  signOut: () => Promise<void>
  clearSession: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Token storage keys
const TOKEN_KEY = "access_token"
const USER_KEY = "user_data"

// Pure TypeScript AuthProvider (no JSX)
export function useProvideAuth(): AuthContextType {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Clear session data
  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem('supabase_refresh_token')
    localStorage.removeItem('supabase_session_id')
    localStorage.removeItem('supabase_user_id')
    setUser(null)
    setToken(null)
  }, [])

  // Sign out function - Supabase doesn't need explicit sign out call
  const signOut = useCallback(async () => {
    try {
      // Clear all session data
      clearSession()
      // Redirect to login page
      window.location.href = '/login'
    } catch (error) {
      console.error('Error signing out:', error)
      // Even if there's an error, clear session and redirect
      clearSession()
      window.location.href = '/login'
    }
  }, [clearSession])

  // Refresh authentication state
  const refreshAuth = useCallback(async () => {
    setLoading(true)
    try {
      // Check if we have a stored token (from backend login)
      const storedToken = localStorage.getItem(TOKEN_KEY)
      const storedUserData = localStorage.getItem(USER_KEY)
      const refreshToken = localStorage.getItem('supabase_refresh_token')
      
      if (storedToken && storedUserData) {
        try {
          const parsedUser = JSON.parse(storedUserData)
          
          // First, try to validate the current token by fetching profile
          try {
            setToken(storedToken)
            setUser(parsedUser as User)
            
            const profileResponse = await api.getUserProfile()
            if (profileResponse.status === 'success' && profileResponse.data) {
              const profile = profileResponse.data
              const updatedUser: User = {
                uid: profile.id,
                email: profile.email,
                displayName: profile.display_name,
                photoURL: undefined,
                created_at: profile.created_at || undefined
              }
              setUser(updatedUser)
              // Update stored user data
              localStorage.setItem(USER_KEY, JSON.stringify(updatedUser))
              setLoading(false)
              return
            }
          } catch (profileError) {
            console.error('Current token invalid, attempting refresh:', profileError)
            
            // If current token is invalid, try to refresh using refresh token
            if (refreshToken) {
              try {
                const refreshResponse = await api.refreshToken({ refresh_token: refreshToken })
                if (refreshResponse.status === 'success' && refreshResponse.access_token) {
                  // Update stored tokens
                  localStorage.setItem(TOKEN_KEY, refreshResponse.access_token)
                  localStorage.setItem('supabase_refresh_token', refreshResponse.refresh_token || refreshToken)
                  
                  // Update auth state with new token
                  setToken(refreshResponse.access_token)
                  setUser(parsedUser as User)
                  
                  // Try to fetch profile with new token
                  const newProfileResponse = await api.getUserProfile()
                  if (newProfileResponse.status === 'success' && newProfileResponse.data) {
                    const profile = newProfileResponse.data
                    const updatedUser: User = {
                      uid: profile.id,
                      email: profile.email,
                      displayName: profile.display_name,
                      photoURL: undefined,
                      created_at: profile.created_at || undefined
                    }
                    setUser(updatedUser)
                    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser))
                    setLoading(false)
                    return
                  }
                }
              } catch (refreshError) {
                console.error('Token refresh failed:', refreshError)
              }
            }
            
            // If refresh failed or no refresh token, clear session
            console.log('Unable to refresh token, clearing session')
            clearSession()
            setLoading(false)
            return
          }
          
          setLoading(false)
          return
        } catch (error) {
          console.error('Error parsing stored user data:', error)
          // Clear invalid data
          clearSession()
        }
      }

      // No valid token found, user is not authenticated
      clearSession()
      setLoading(false)
    } catch (error) {
      console.error('Error in refreshAuth:', error)
      clearSession()
      setLoading(false)
    }
  }, [clearSession])

  // Initialize auth state
  useEffect(() => {
    // Add a small delay to prevent immediate auth loops
    const timer = setTimeout(() => {
    refreshAuth()
    }, 100)
    
    return () => clearTimeout(timer)
  }, [refreshAuth])

  // Listen for storage changes (e.g., login in another tab)
  useEffect(() => {
    const handleStorage = () => {
      const storedToken = localStorage.getItem(TOKEN_KEY)
      const storedUserData = localStorage.getItem(USER_KEY)
      
      if (storedToken && storedUserData) {
        try {
          const parsedUser = JSON.parse(storedUserData)
          setToken(storedToken)
          setUser(parsedUser as User)
        } catch (error) {
          console.error('Error parsing user data from storage:', error)
          clearSession()
        }
      } else {
        clearSession()
      }
    }

    window.addEventListener("storage", handleStorage)
    return () => {
      window.removeEventListener("storage", handleStorage)
    }
  }, [clearSession])

  const isAuthenticated = !!token && !!user

  return { 
    user, 
    token, 
    loading, 
    isAuthenticated, 
    refreshAuth, 
    signOut, 
    clearSession 
  }
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Export AuthContext for use in a .tsx provider wrapper
export { AuthContext }

// Utility function to handle 401 errors and logout
export const handleAuthError = (response: Response) => {
  if (response.status === 401) {
    // Clear invalid token and all session data
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_data')
    localStorage.removeItem('supabase_refresh_token')
    localStorage.removeItem('supabase_session_id')
    localStorage.removeItem('supabase_user_id')
    // Redirect to login
    window.location.href = '/login'
    throw new Error('Authentication required. Please log in again.')
  }
}
