import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// 🎯 Types ultra moderni
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  isAdmin?: boolean;
  emailVerified?: boolean;
  lastLoginAt?: string;
  createdAt?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
}

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface RegisterCredentials {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
}

interface AuthContextType extends AuthState {
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  
  // Loading states per action specifiche
  isLoggingIn: boolean;
  isRegistering: boolean;
  isLoggingOut: boolean;
}

// 🚀 Context
const AuthContext = createContext<AuthContextType | null>(null);

// 🛡️ Provider Component Ultra Moderno
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // 📊 User Query con cache intelligente
  const {
    data: user,
    isLoading,
    error,
    refetch: refreshUser
  } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      try {
        console.log('🔍 Frontend: Checking auth status...');
        const response = await apiRequest('GET', '/api/auth/me');
        
        if (!response.ok) {
          if (response.status === 401) {
            console.log('ℹ️ Frontend: User not authenticated (401)');
            return null;
          }
          console.error('❌ Frontend: Auth check failed with status:', response.status);
          throw new Error('Failed to fetch user');
        }
        
        const userData = await response.json();
        console.log('✅ Frontend: User authenticated:', userData.email);
        return userData;
      } catch (error) {
        console.warn('⚠️ Frontend: Auth check error:', error.message);
        
        // Debug: Check if we have cookies/tokens
        const hasAuthCookie = document.cookie.includes('authToken');
        console.log('🔍 Frontend Debug:', {
          hasAuthCookie,
          cookieCount: document.cookie.split(';').length,
          error: error.message
        });
        
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minuti
    gcTime: 10 * 60 * 1000,   // 10 minuti
    retry: (failureCount, error: any) => {
      // Don't retry on auth errors
      if (error?.status === 401) return false;
      return failureCount < 2;
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // 🔐 Login Mutation Ultra Sicura
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await apiRequest('POST', '/api/auth/login', credentials);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(error.message || 'Login failed');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      // 🎉 Update cache immediately
      queryClient.setQueryData(['auth', 'user'], data.user);
      
      // 🔄 Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      
      toast({
        title: '🎉 Accesso Effettuato!',
        description: `Bentornato, ${data.user.firstName}!`,
        duration: 3000,
      });
    },
    onError: (error: Error) => {
      toast({
        title: '❌ Errore di Login',
        description: error.message || 'Credenziali non valide',
        variant: 'destructive',
        duration: 5000,
      });
    },
  });

  // 📝 Register Mutation Ultra Sicura
  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterCredentials) => {
      // Client-side validation
      if (credentials.password !== credentials.confirmPassword) {
        throw new Error('Le password non coincidono');
      }
      
      if (!credentials.acceptTerms) {
        throw new Error('Devi accettare i termini e condizioni');
      }

      const response = await apiRequest('POST', '/api/auth/register', {
        email: credentials.email,
        password: credentials.password,
        firstName: credentials.firstName,
        lastName: credentials.lastName,
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(error.message || 'Registration failed');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      // 🎉 Auto-login dopo registrazione
      if (data.user) {
        queryClient.setQueryData(['auth', 'user'], data.user);
        queryClient.invalidateQueries({ queryKey: ['auth'] });
        
        toast({
          title: '🎉 Registrazione Completata!',
          description: `Benvenuto, ${data.user.firstName}! Il tuo account è stato creato.`,
          duration: 5000,
        });
      } else {
        toast({
          title: '✅ Registrazione Completata!',
          description: 'Controlla la tua email per verificare l\'account.',
          duration: 5000,
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: '❌ Errore di Registrazione',
        description: error.message || 'Si è verificato un errore durante la registrazione',
        variant: 'destructive',
        duration: 5000,
      });
    },
  });

  // 🚪 Logout Mutation Ultra Sicura
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/auth/logout');
    },
    onSuccess: () => {
      // 🧹 Clear all data
      queryClient.setQueryData(['auth', 'user'], null);
      queryClient.clear();
      
      toast({
        title: '👋 Logout Effettuato',
        description: 'Sei stato disconnesso con successo.',
        duration: 3000,
      });
    },
    onError: () => {
      // 🧹 Force clear anche in caso di errore
      queryClient.setQueryData(['auth', 'user'], null);
      queryClient.clear();
      
      toast({
        title: '👋 Disconnesso',
        description: 'Sei stato disconnesso.',
        duration: 3000,
      });
    },
  });

  // 🔄 Auto-refresh token logic
  useEffect(() => {
    if (user && !isLoading) {
      // Refresh ogni 30 minuti se l'utente è attivo
      const interval = setInterval(() => {
        refreshUser();
      }, 30 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [user, isLoading, refreshUser]);

  // 🎯 Context value con stati derivati
  const contextValue: AuthContextType = {
    // State
    user: user || null,
    isLoading,
    isAuthenticated: Boolean(user?.id),
    isEmailVerified: Boolean(user?.emailVerified),
    
    // Actions
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    refreshUser,
    
    // Loading states
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// 🪝 Hook personalizzato
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth deve essere usato all\'interno di AuthProvider');
  }
  
  return context;
}

// 🛡️ Hook per route protette
export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = '/auth?redirect=' + encodeURIComponent(window.location.pathname);
    }
  }, [isAuthenticated, isLoading]);
  
  return { isAuthenticated, isLoading };
}