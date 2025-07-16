import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User } from "@shared/schema";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, RegisterData>;
};

type LoginData = {
  email: string;
  password: string;
};

type RegisterData = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | undefined, Error>({
    queryKey: ["/api/user"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/user");
        return await res.json();
      } catch (error: any) {
        if (error?.message === "Non autenticato") {
          return null;
        }
        throw error;
      }
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      console.log("🔐 Frontend: Starting login request for:", credentials.email);
      const res = await apiRequest("POST", "/api/login", credentials);
      const data = await res.json();
      console.log("✅ Frontend: Login response received:", data);
      return data;
    },
    onSuccess: (user: User) => {
      console.log("✅ Frontend: Login mutation success, setting user data:", user);
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Accesso effettuato",
        description: `Benvenuto, ${user.firstName}!`,
      });
    },
    onError: (error: Error) => {
      console.error("❌ Frontend: Login mutation error:", error);
      toast({
        title: "Errore di accesso",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterData) => {
      try {
        console.log("📝 Frontend: Starting registration request for:", credentials.email);
        const res = await apiRequest("POST", "/api/register", credentials);
        
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
      
      // If auto-login was successful, set user data
      if (response.autoLogin && response.user) {
        console.log("✅ Frontend: Auto-login successful, setting user data");
        queryClient.setQueryData(["/api/user"], response.user);
        toast({
          title: "Registrazione completata",
          description: `Benvenuto, ${response.user.firstName}!`,
        });
      } else {
        console.log("ℹ️ Frontend: Registration successful, but manual login required");
        toast({
          title: "Registrazione completata",
          description: "Ora puoi effettuare il login con le tue credenziali.",
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
      toast({
        title: "Logout effettuato",
        description: "Arrivederci!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore di logout",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
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