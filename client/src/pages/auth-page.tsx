import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Gamepad2, Chrome, Facebook, Apple, Mail, Lock, User, Eye, EyeOff } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Email non valida"),
  password: z.string().min(6, "La password deve contenere almeno 6 caratteri"),
});

const registerSchema = z.object({
  email: z.string().email("Email non valida"),
  password: z.string().min(6, "La password deve contenere almeno 6 caratteri"),
  firstName: z.string().min(2, "Il nome deve contenere almeno 2 caratteri"),
  lastName: z.string().min(2, "Il cognome deve contenere almeno 2 caratteri"),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  // ✅ Better logging for debugging
  console.log('🔍 AuthPage state:', { 
    user: user ? { id: user.id, email: user.email } : null,
    isLoading,
    isLoginPending: loginMutation.isPending,
    isRegisterPending: registerMutation.isPending
  });

  // ✅ Error handling for auth context
  if (!loginMutation || !registerMutation) {
    console.error('❌ AuthPage: Missing auth mutations');
    throw new Error('Auth context not properly initialized');
  }

  // ✅ Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Verificando autenticazione...</p>
        </div>
      </div>
    );
  }

  // ✅ Redirect if already authenticated with better logging
  if (user) {
    console.log('✅ User authenticated, redirecting to home:', user);
    return <Redirect to="/" />;
  }

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
    },
  });

  const onLogin = (data: LoginFormData) => {
    console.log("🔐 Starting login process for:", data.email);
    loginMutation.mutate(data);
  };

  const onRegister = (data: RegisterFormData) => {
    try {
      console.log("📝 Starting registration process for:", data.email);
      registerMutation.mutate(data);
    } catch (error) {
      console.error("❌ Registration error in AuthPage:", error);
      throw error;
    }
  };

  try {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Hero Section */}
        <div className="hidden lg:flex flex-col justify-center space-y-8 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start space-x-3">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
              <Gamepad2 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              GameAll
            </h1>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200">
              Benvenuto nel mondo del gaming
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-md">
              Scopri la più grande collezione di videogiochi e accessori gaming. 
              Unisciti alla community di GameAll e vivi l'esperienza di gioco definitiva.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-md">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-blue-600">10K+</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Prodotti</div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-purple-600">50K+</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Utenti</div>
            </div>
          </div>
        </div>

        {/* Auth Forms */}
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-xl border-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-4 lg:hidden">
                <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                  <Gamepad2 className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">Accedi a GameAll</CardTitle>
              <CardDescription>
                Scegli il tuo metodo di accesso preferito
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Social Auth Buttons */}
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full h-12 text-sm font-medium"
                  disabled
                >
                  <Chrome className="mr-2 h-4 w-4" />
                  Continua con Google
                  <span className="ml-auto text-xs text-slate-500">(Presto)</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full h-12 text-sm font-medium"
                  disabled
                >
                  <Facebook className="mr-2 h-4 w-4" />
                  Continua con Facebook
                  <span className="ml-auto text-xs text-slate-500">(Presto)</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full h-12 text-sm font-medium"
                  disabled
                >
                  <Apple className="mr-2 h-4 w-4" />
                  Continua con Apple
                  <span className="ml-auto text-xs text-slate-500">(Presto)</span>
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-slate-800 px-2 text-slate-500">
                    oppure
                  </span>
                </div>
              </div>

              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Accedi</TabsTrigger>
                  <TabsTrigger value="register">Registrati</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4 mt-6">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                <Input 
                                  {...field} 
                                  type="email" 
                                  placeholder="mario.rossi@email.com"
                                  className="pl-10"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                <Input 
                                  {...field} 
                                  type={showPassword ? "text" : "password"}
                                  placeholder="••••••••"
                                  className="pl-10 pr-10"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-slate-500" />
                                  ) : (
                                    <Eye className="h-4 w-4 text-slate-500" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        disabled={loginMutation.isPending}
                        onClick={() => console.log("🔍 Login button clicked!")}
                      >
                        {loginMutation.isPending ? "Accesso in corso..." : "Accedi"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                <TabsContent value="register" className="space-y-4 mt-6">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                  <Input 
                                    {...field} 
                                    placeholder="Mario"
                                    className="pl-10"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cognome</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="Rossi"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                <Input 
                                  {...field} 
                                  type="email" 
                                  placeholder="mario.rossi@email.com"
                                  className="pl-10"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                <Input 
                                  {...field} 
                                  type={showPassword ? "text" : "password"}
                                  placeholder="••••••••"
                                  className="pl-10 pr-10"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-slate-500" />
                                  ) : (
                                    <Eye className="h-4 w-4 text-slate-500" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? "Registrazione in corso..." : "Registrati"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
  } catch (error) {
    console.error('❌ AuthPage error:', error);
    throw error;
  }
}