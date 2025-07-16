import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import AdminDashboard from "@/pages/AdminDashboard";
import Profile from "@/pages/Profile";
import OrdersPage from "@/pages/OrdersPage";
import Settings from "@/pages/Settings";
import Wishlist from "@/pages/Wishlist";
import ReviewsPage from "@/pages/ReviewsPage";
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="flex-1">
        <Switch>
          <Route path="/auth" component={AuthPage} />
          <Route path="/" component={Landing} />
          <ProtectedRoute path="/home" component={Home} />
          <ProtectedRoute path="/admin" component={AdminDashboard} />
          <ProtectedRoute path="/profile" component={Profile} />
          <ProtectedRoute path="/orders" component={OrdersPage} />
          <ProtectedRoute path="/settings" component={Settings} />
          <ProtectedRoute path="/reviews" component={ReviewsPage} />
          <ProtectedRoute path="/wishlist" component={Wishlist} />
          <Route component={NotFound} />
        </Switch>
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
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
