import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useState } from "react";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import AdminDashboard from "@/pages/AdminDashboard";
import Profile from "@/pages/Profile";
import OrdersPage from "@/pages/OrdersPage";
import Settings from "@/pages/Settings";
import Wishlist from "@/pages/Wishlist";
import AuthPage from "@/pages/auth-page";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CartSlideout } from "@/components/CartSlideout";
import { LiveChat } from "@/components/LiveChat";
import { PerformanceMonitor } from "@/components/PerformanceMonitor";
import { CheckoutModal } from "@/components/CheckoutModal";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  const { user, isLoading } = useAuth();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const handleCheckout = () => {
    setIsCheckoutOpen(true);
  };

  // ✅ Better loading state handling
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="flex-1">
        <ErrorBoundary>
          <Switch>
            <Route path="/auth" component={AuthPage} />
            <Route path="/" component={Landing} />
            <ProtectedRoute path="/home" component={Home} />
            <ProtectedRoute path="/admin" component={AdminDashboard} />
            <ProtectedRoute path="/profile" component={Profile} />
            <ProtectedRoute path="/orders" component={OrdersPage} />
            <ProtectedRoute path="/settings" component={Settings} />
            <ProtectedRoute path="/reviews" component={Settings} />
            <ProtectedRoute path="/wishlist" component={Wishlist} />
            <Route component={NotFound} />
          </Switch>
        </ErrorBoundary>
      </main>
      <Footer />
      <CartSlideout onCheckout={handleCheckout} />
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
      <LiveChat />
      <PerformanceMonitor />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
