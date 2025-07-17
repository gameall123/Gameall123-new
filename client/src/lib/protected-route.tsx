import { useAuth } from "@/hooks/useAuth";
import { Loader2, ShieldAlert } from "lucide-react";
import { Redirect, Route } from "wouter";
import { Button } from "@/components/ui/button";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading, error } = useAuth();

  // ✅ Show loading state
  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
            <p className="text-slate-600 dark:text-slate-400">Verificando autenticazione...</p>
          </div>
        </div>
      </Route>
    );
  }

  // ✅ Show error state if auth check failed
  if (error && !user) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="text-center space-y-4 max-w-md mx-auto p-6">
            <ShieldAlert className="h-12 w-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
              Errore di Autenticazione
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Si è verificato un errore durante la verifica dell'autenticazione.
            </p>
            <Button 
              onClick={() => window.location.href = "/auth"}
              className="mt-4"
            >
              Vai al Login
            </Button>
          </div>
        </div>
      </Route>
    );
  }

  // ✅ Redirect to auth if not authenticated
  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // ✅ Render protected component
  return <Route path={path} component={Component} />;
}