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
import OnboardingPage from "./pages/OnboardingPage"
import LaunchCountdown from "./components/LaunchCountdown"
import LoadingScreen from "./components/LoadingScreen"
import AdminPanel from "./components/AdminPanel"

// Launch countdown wrapper component
const LaunchCountdownWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLaunched, setIsLaunched] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if launch time has passed
    const checkLaunchStatus = async () => {
      try {
        const response = await fetch('/api/server-time');
        const data = await response.json();
        const serverTime = new Date(data.serverTime);
        const launchDate = new Date('2024-12-25T00:00:00Z'); // Same as in LaunchCountdown
        
        if (serverTime >= launchDate) {
          setIsLaunched(true);
        }
      } catch (error) {
        console.error('Failed to check launch status:', error);
        // If we can't get server time, allow access
        setIsLaunched(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkLaunchStatus();
  }, []);

  if (isLoading) {
    return <LoadingScreen message="Checking launch status..." />;
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
          <MealPlanner />
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
    path: "/detected",
    element: (
      <ProtectedRoute>
        <MainLayout>
          <DetectFoodPage />
        </MainLayout>
      </ProtectedRoute>
    )
  },
  {
    path: "/planner",
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
    v7_relativeSplatPath: true
  }
})

const RouterWrapper = () => {
  return (
    <LaunchCountdownWrapper>
      <RouterProvider router={router} />
    </LaunchCountdownWrapper>
  )
}

function App() {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <RouterWrapper />
        <Toaster />
      </SubscriptionProvider>
    </AuthProvider>
  )
}

export default App
