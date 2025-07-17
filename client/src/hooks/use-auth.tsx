import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { createContext, useContext, ReactNode } from "react";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  isAdmin?: boolean;
}

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  user: User | null | undefined;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginMutation: any;
  registerMutation: any;
  logoutMutation: any;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | undefined, Error>({
    queryKey: ["/api/user"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/user");
        if (!res.ok) {
          if (res.status === 401) {
            return null; // Not authenticated, this is fine
          }
          throw new Error(`Server error: ${res.status}`);
        }
        return await res.json();
      } catch (error: any) {
        // ✅ Better error handling - prevent Error Boundary trigger
        if (error?.message?.includes("Non autenticato") || 
            error?.message?.includes("401") ||
            error?.status === 401) {
          return null; // Not authenticated
        }
        console.warn("Auth check error:", error.message);
        return null; // Return null instead of throwing to prevent Error Boundary
      }
    },
    retry: (failureCount, error: any) => {
      // Don't retry on auth errors
      if (error?.status === 401 || error?.message?.includes("401")) {
        return false;
      }
      return failureCount < 2; // Limit retries
    },
    staleTime: 1000 * 60 * 5, // ✅ 5 minutes cache
    gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      console.log("🔐 Frontend: Starting login request for:", credentials.email);
      const res = await apiRequest("POST", "/api/login", credentials);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Errore di rete" }));
        throw new Error(errorData.message || "Errore durante il login");
      }
      const data = await res.json();
      console.log("✅ Frontend: Login response received:", data);
      return data;
    },
    onSuccess: (user: User) => {
      console.log("✅ Frontend: Login mutation success, setting user data:", user);
      // ✅ Set data first, then invalidate to prevent race conditions
      queryClient.setQueryData(["/api/user"], user);
      
      toast({
        title: "Accesso effettuato",
        description: `Benvenuto, ${user.firstName}!`,
      });
      
      // ✅ Delayed refresh to prevent immediate re-fetch conflicts
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      }, 100);
    },
    onError: (error: Error) => {
      console.error("❌ Frontend: Login mutation error:", error);
      toast({
        title: "Errore di accesso",
        description: error.message || "Credenziali non valide",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterData) => {
      try {
        console.log("📝 Frontend: Starting registration request for:", credentials.email);
        const res = await apiRequest("POST", "/api/register", credentials);
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: "Errore di rete" }));
          throw new Error(errorData.message || "Errore durante la registrazione");
        }
        
        // Check if the response is JSON
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          console.error("❌ Frontend: Invalid response content type:", contentType);
          throw new Error("Il server ha restituito una risposta non valida");
        }
        
        const data = await res.json();
        console.log("✅ Frontend: Registration response received:", data);
        return data;
      } catch (error: any) {
        console.error("❌ Frontend: Registration request error:", error);
        throw new Error(error.message || "Errore durante la registrazione");
      }
    },
    onSuccess: (response: any) => {
      console.log("✅ Frontend: Registration mutation success:", response);
      
      try {
        // If auto-login was successful, set user data
        if (response.autoLogin && response.user) {
          console.log("✅ Frontend: Auto-login successful, setting user data");
          
          // ✅ Set user data without triggering immediate refresh
          queryClient.setQueryData(["/api/user"], response.user);
          
          toast({
            title: "Registrazione completata",
            description: `Benvenuto, ${response.user.firstName}!`,
          });
          
          // ✅ Delayed refresh to prevent race conditions and Error Boundary
          setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ["/api/user"] });
          }, 500);
          
        } else {
          console.log("ℹ️ Frontend: Registration successful, but manual login required");
          toast({
            title: "Registrazione completata",
            description: "Ora puoi effettuare il login con le tue credenziali.",
          });
        }
      } catch (error) {
        console.error("❌ Frontend: Error processing registration success:", error);
        // Don't throw here to prevent Error Boundary
        toast({
          title: "Registrazione completata",
          description: "Registrazione riuscita. Per favore ricarica la pagina.",
        });
      }
    },
    onError: (error: Error) => {
      console.error("❌ Frontend: Registration mutation error:", error);
      toast({
        title: "Errore di registrazione",
        description: error.message || "Si è verificato un errore durante la registrazione",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      queryClient.clear(); // ✅ Clear all cached data on logout
      toast({
        title: "Logout effettuato",
        description: "Sei stato disconnesso con successo.",
      });
    },
    onError: (error: Error) => {
      console.error("❌ Frontend: Logout error:", error);
      // Clear data even if logout request fails
      queryClient.setQueryData(["/api/user"], null);
      queryClient.clear();
    },
  });

  // ✅ Better authentication state management
  const isAuthenticated = Boolean(user && user.id);

  return (
    <AuthContext.Provider value={{
      user: user || null,
      isAuthenticated,
      isLoading,
      loginMutation,
      registerMutation,
      logoutMutation,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve essere utilizzato all'interno di un AuthProvider");
  }
  return context;
}