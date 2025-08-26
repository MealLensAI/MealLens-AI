import React, { useState, useEffect } from "react"
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
import ProfilePage from "./pages/ProfilePage"
import Settings from "./pages/Settings"
import WelcomePage from "./pages/WelcomePage"
import HomePage from "./pages/HomePage"
import OnboardingPage from "./pages/OnboardingPage"
import LaunchCountdown from "./components/LaunchCountdown"
import LoadingScreen from "./components/LoadingScreen"
import AdminPanel from "./components/AdminPanel"
import ErrorBoundary from "./components/ErrorBoundary"

// Launch countdown wrapper component
const LaunchCountdownWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLaunched, setIsLaunched] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkLaunchStatus = async () => {
      try {
        const base = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'https://meallens-ai-cmps.onrender.com');
        const response = await fetch(`${base}/api/server-time`);
        const data = await response.json();
        const serverTime = new Date(data.serverTime);
        const launchDate = new Date('2024-12-25T00:00:00Z');
        if (serverTime >= launchDate) {
          setIsLaunched(true);
        }
      } catch (error) {
        console.error('Failed to check launch status:', error);
        setIsLaunched(true);
      } finally {
        setIsLoading(false);
      }
    };
    checkLaunchStatus();
  }, []);

  if (isLoading) {
    return <LoadingScreen size="md" />;
  }

  if (!isLaunched) {
    return <LaunchCountdown onLaunchComplete={() => setIsLaunched(true)} />;
  }

  return <>{children}</>;
};

// Create router with future flags to eliminate deprecation warnings
const router = createBrowserRouter([
  {
    path: "/",
    element: <WelcomePage />
  },
  {
    path: "/home",
    element: (
      <ProtectedRoute>
        <MainLayout>
          <HomePage />
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
    element: <Navigate to="/home" replace />
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
          <Payment />
      </ProtectedRoute>
    )
  },
  {
    path: "/payment/success",
    element: <PaymentSuccess />
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
    path: "/admin",
    element: (
      <ProtectedRoute>
        <AdminPanel />
      </ProtectedRoute>
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
    <LaunchCountdownWrapper>
      <AuthProvider>
        <SubscriptionProvider>
          <ErrorBoundary>
            <RouterProvider router={router} />
            <Toaster />
          </ErrorBoundary>
        </SubscriptionProvider>
      </AuthProvider>
    </LaunchCountdownWrapper>
  )
}

function App() {
  return <RouterWrapper />
}

export default App
