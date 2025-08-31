import React from "react"
import {
  createBrowserRouter,
  RouterProvider,
  Navigate
} from "react-router-dom"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import DetectFoodPage from "./pages/DetectFoodPage"
import AIResponsePage from "./pages/AIResponsePage"
import MealPlanner from "./pages/MealPlanner"
import ProtectedRoute from "./components/ProtectedRoute"
import MainLayout from "./components/MainLayout"
import { Toaster } from "@/components/ui/toaster"
import "./App.css"
import HistoryPage from "./pages/History"
import HistoryDetailPage from "./pages/HistoryDetailPage"
import { AuthProvider } from "@/lib/AuthProvider"
import { SubscriptionProvider } from "@/contexts/SubscriptionContext"
import Payment from "./pages/Payment"
import PaymentSuccess from "./pages/PaymentSuccess"
import PaymentFailure from "./pages/PaymentFailure"
import ProfilePage from "./pages/ProfilePage"
import Settings from "./pages/Settings"
import WelcomePage from "./pages/WelcomePage"
import HomePage from "./pages/HomePage"
import OnboardingPage from "./pages/OnboardingPage"
import AdminPanel from "./components/AdminPanel"
import AdminDashboard from "./pages/AdminDashboard"
import AdminLoginPage from "./pages/AdminLoginPage"
import AdminRoute from "./components/AdminRoute"

import ErrorBoundary from "./components/ErrorBoundary"

// Create router with future flags to eliminate deprecation warnings
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute fallback={<WelcomePage />}>
        <Navigate to="/ai-kitchen" replace />
      </ProtectedRoute>
    )
  },
  {
    path: "/landing",
    element: <WelcomePage />
  },
  {
    path: "/home",
    element: (
      <ProtectedRoute>
        <MainLayout>
          <AIResponsePage />
        </MainLayout>
      </ProtectedRoute>
    )
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/signup",
    element: <Signup />
  },
  {
    path: "/onboarding",
    element: (
      <ProtectedRoute>
        <OnboardingPage />
      </ProtectedRoute>
    )
  },
  {
    path: "/dashboard",
    element: <Navigate to="/ai-kitchen" replace />
  },
  {
    path: "/ai-kitchen",
    element: (
      <ProtectedRoute>
        <MainLayout>
          <AIResponsePage />
        </MainLayout>
      </ProtectedRoute>
    )
  },
  {
    path: "/ai-response",
    element: <Navigate to="/ai-kitchen" replace />
  },
  {
    path: "/detect-food",
    element: (
      <ProtectedRoute>
        <MainLayout>
          <DetectFoodPage />
        </MainLayout>
      </ProtectedRoute>
    )
  },
  {
    path: "/meal-planner",
    element: (
      <ProtectedRoute>
        <MainLayout>
          <MealPlanner />
        </MainLayout>
      </ProtectedRoute>
    )
  },
  {
    path: "/history",
    element: (
      <ProtectedRoute>
        <MainLayout>
          <HistoryPage />
        </MainLayout>
      </ProtectedRoute>
    )
  },
  {
    path: "/history/:id",
    element: (
      <ProtectedRoute>
        <MainLayout>
          <HistoryDetailPage />
        </MainLayout>
      </ProtectedRoute>
    )
  },
  {
    path: "/payment",
    element: (
      <ProtectedRoute>
        <MainLayout>
          <Payment />
        </MainLayout>
      </ProtectedRoute>
    )
  },
  {
    path: "/payment/success",
    element: <PaymentSuccess />
  },
  {
    path: "/payment/failure",
    element: <PaymentFailure />
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <MainLayout>
          <ProfilePage />
        </MainLayout>
      </ProtectedRoute>
    )
  },
  {
    path: "/settings",
    element: (
      <ProtectedRoute>
        <MainLayout>
          <Settings />
        </MainLayout>
      </ProtectedRoute>
    )
  },
  {
    path: "/admin-login",
    element: <AdminLoginPage />
  },
  {
    path: "/admin/*",
    element: (
      <AdminRoute>
        <AdminDashboard />
      </AdminRoute>
    )
  },


  {
    path: "*",
    element: <Navigate to="/" replace />
  }
], {
  future: {
    v7_relativeSplatPath: true,
    v7_startTransition: true
  }
})

const RouterWrapper = () => {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <ErrorBoundary>
          <RouterProvider router={router} />
          <Toaster />
        </ErrorBoundary>
      </SubscriptionProvider>
    </AuthProvider>
  )
}

function App() {
  return <RouterWrapper />
}

export default App
