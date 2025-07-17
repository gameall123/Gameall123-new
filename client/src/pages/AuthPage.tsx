import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Gamepad2,
  Shield,
  Star,
  Zap,
  CheckCircle,
  AlertCircle,
  Loader2,
  Github,
  Chrome
} from 'lucide-react';

// 🎯 Validation Schemas Ultra Sicuri
const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email richiesta')
    .email('Formato email non valido')
    .max(100, 'Email troppo lunga'),
  password: z.string()
    .min(6, 'Password deve avere almeno 6 caratteri')
    .max(100, 'Password troppo lunga'),
  rememberMe: z.boolean().optional(),
});

const registerSchema = z.object({
  firstName: z.string()
    .min(2, 'Nome deve avere almeno 2 caratteri')
    .max(50, 'Nome troppo lungo')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Solo lettere consentite'),
  lastName: z.string()
    .min(2, 'Cognome deve avere almeno 2 caratteri')
    .max(50, 'Cognome troppo lungo')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Solo lettere consentite'),
  email: z.string()
    .min(1, 'Email richiesta')
    .email('Formato email non valido')
    .max(100, 'Email troppo lunga'),
  password: z.string()
    .min(8, 'Password deve avere almeno 8 caratteri')
    .max(100, 'Password troppo lunga')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password deve contenere minuscole, maiuscole e numeri'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, 'Devi accettare i termini'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Le password non coincidono',
  path: ['confirmPassword'],
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

// 🎨 Componente Password Input Avanzato
function PasswordInput({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  error,
  showStrength = false 
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  showStrength?: boolean;
}) {
  const [showPassword, setShowPassword] = useState(false);
  
  // 💪 Password strength calculation
  const getPasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score += 25;
    if (/[a-z]/.test(password)) score += 25;
    if (/[A-Z]/.test(password)) score += 25;
    if (/\d/.test(password)) score += 25;
    if (/[^a-zA-Z\d]/.test(password)) score += 25;
    return Math.min(score, 100);
  };

  const strength = getPasswordStrength(value);
  const getStrengthColor = (strength: number) => {
    if (strength < 40) return 'bg-red-500';
    if (strength < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = (strength: number) => {
    if (strength < 40) return 'Debole';
    if (strength < 70) return 'Media';
    return 'Forte';
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
        {label}
      </Label>
      <div className="relative">
        <Input
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`pr-10 ${error ? 'border-red-500 focus:border-red-500' : ''}`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      
      {showStrength && value.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Sicurezza password</span>
            <span className={`font-medium ${
              strength < 40 ? 'text-red-500' : 
              strength < 70 ? 'text-yellow-500' : 'text-green-500'
            }`}>
              {getStrengthText(strength)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full transition-all duration-300 ${getStrengthColor(strength)}`}
              style={{ width: `${strength}%` }}
            />
          </div>
        </div>
      )}
      
      {error && (
        <div className="flex items-center gap-1 text-red-500 text-sm">
          <AlertCircle className="h-3 w-3" />
          {error}
        </div>
      )}
    </div>
  );
}

// 🎨 Componente principale
export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const { login, register, isLoggingIn, isRegistering, isAuthenticated, user, setOnLoginSuccess } = useAuth();
  const [location, setLocation] = useLocation();
  
  // 🔄 Setup navigation callback
  useEffect(() => {
    const handleNavigationAfterLogin = () => {
      const redirect = new URLSearchParams(window.location.search).get('redirect');
      const targetPath = redirect || '/home';
      console.log('📍 Navigating after login to:', targetPath);
      setLocation(targetPath);
    };
    
    setOnLoginSuccess(handleNavigationAfterLogin);
    
    return () => setOnLoginSuccess(undefined);
  }, [setLocation, setOnLoginSuccess]);
  
  // 🔄 Redirect se già autenticato
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('🔄 User already authenticated, redirecting...', user.email);
      const redirect = new URLSearchParams(window.location.search).get('redirect');
      const targetPath = redirect || '/home';
      console.log('📍 Redirecting to:', targetPath);
      setLocation(targetPath);
    }
  }, [isAuthenticated, user, setLocation]);

  // 📝 Form Login
  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  // 📝 Form Register
  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });

  // 🔐 Login Handler Ultra Sicuro
  const handleLogin = async (data: LoginForm) => {
    try {
      console.log('🔐 Frontend: Starting login process...');
      await login(data);
      console.log('✅ Frontend: Login completed successfully');
      
      // The navigation will be handled by the useAuth hook after successful login
    } catch (error) {
      console.error('❌ Frontend: Login error:', error);
      // Error handling is already done in the mutation
    }
  };

  // 📝 Handle Register
  const handleRegister = async (data: RegisterForm) => {
    try {
      // Debug per verificare i dati del form
      console.log('🔍 Register form data:', {
        ...data,
        password: '[HIDDEN]',
        confirmPassword: '[HIDDEN]'
      });
      
      await register(data);
    } catch (error) {
      // Error handling è gestito nel hook
      console.error('❌ Registration error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* 🌟 Background decorativo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full opacity-20 blur-3xl" />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          
          {/* 🎮 Hero Section */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden lg:flex flex-col justify-center space-y-8"
          >
            <div className="space-y-6">
              {/* Logo e Brand */}
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg">
                  <Gamepad2 className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    GameAll
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300">
                    La tua destinazione gaming
                  </p>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Sicurezza Garantita</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Protezione avanzata dei tuoi dati</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                    <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Esperienza Premium</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Accesso esclusivo ai migliori giochi</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Velocità Estrema</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Download istantanei e streaming fluido</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 🔐 Auth Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {activeTab === 'login' ? 'Bentornato!' : 'Unisciti a noi!'}
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  {activeTab === 'login' 
                    ? 'Accedi al tuo account GameAll' 
                    : 'Crea il tuo account GameAll'
                  }
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* 📱 Social Login Buttons */}
                <div className="space-y-3">
                  <Button variant="outline" className="w-full h-11 bg-white hover:bg-gray-50 border-gray-200">
                    <Chrome className="w-4 h-4 mr-2" />
                    Continua con Google
                  </Button>
                  <Button variant="outline" className="w-full h-11 bg-white hover:bg-gray-50 border-gray-200">
                    <Github className="w-4 h-4 mr-2" />
                    Continua con GitHub
                  </Button>
                </div>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200 dark:border-gray-600" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">
                      oppure
                    </span>
                  </div>
                </div>

                {/* 🎯 Tabs */}
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'register')}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="login" className="transition-all">
                      Accedi
                    </TabsTrigger>
                    <TabsTrigger value="register" className="transition-all">
                      Registrati
                    </TabsTrigger>
                  </TabsList>

                  {/* 🔐 Login Form */}
                  <TabsContent value="login" className="space-y-4">
                    <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                      <div>
                        <Label htmlFor="login-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="mario@example.com"
                            className="pl-10"
                            {...loginForm.register('email')}
                          />
                        </div>
                        {loginForm.formState.errors.email && (
                          <p className="text-red-500 text-sm mt-1">
                            {loginForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>

                      <PasswordInput
                        label="Password"
                        placeholder="••••••••"
                        value={loginForm.watch('password') || ''}
                        onChange={(value) => loginForm.setValue('password', value)}
                        error={loginForm.formState.errors.password?.message}
                      />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Controller
                            name="rememberMe"
                            control={loginForm.control}
                            render={({ field }) => (
                              <Checkbox 
                                id="rememberMe"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            )}
                          />
                          <Label htmlFor="rememberMe" className="text-sm">
                            Ricordami
                          </Label>
                        </div>
                        <button
                          type="button"
                          className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          Password dimenticata?
                        </button>
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                        disabled={isLoggingIn}
                      >
                        {isLoggingIn ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Accesso in corso...
                          </>
                        ) : (
                          'Accedi'
                        )}
                      </Button>
                    </form>
                  </TabsContent>

                  {/* 📝 Register Form */}
                  <TabsContent value="register" className="space-y-4">
                    <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="firstName">Nome</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="firstName"
                              placeholder="Mario"
                              className="pl-10"
                              {...registerForm.register('firstName')}
                            />
                          </div>
                          {registerForm.formState.errors.firstName && (
                            <p className="text-red-500 text-xs mt-1">
                              {registerForm.formState.errors.firstName.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="lastName">Cognome</Label>
                          <Input
                            id="lastName"
                            placeholder="Rossi"
                            {...registerForm.register('lastName')}
                          />
                          {registerForm.formState.errors.lastName && (
                            <p className="text-red-500 text-xs mt-1">
                              {registerForm.formState.errors.lastName.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="register-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="register-email"
                            type="email"
                            placeholder="mario@example.com"
                            className="pl-10"
                            {...registerForm.register('email')}
                          />
                        </div>
                        {registerForm.formState.errors.email && (
                          <p className="text-red-500 text-sm mt-1">
                            {registerForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>

                      <PasswordInput
                        label="Password"
                        placeholder="••••••••"
                        value={registerForm.watch('password') || ''}
                        onChange={(value) => registerForm.setValue('password', value)}
                        error={registerForm.formState.errors.password?.message}
                        showStrength={true}
                      />

                      <PasswordInput
                        label="Conferma Password"
                        placeholder="••••••••"
                        value={registerForm.watch('confirmPassword') || ''}
                        onChange={(value) => registerForm.setValue('confirmPassword', value)}
                        error={registerForm.formState.errors.confirmPassword?.message}
                      />

                      <div className={`flex items-start space-x-2 p-3 rounded-lg border transition-colors ${
                        registerForm.formState.errors.acceptTerms 
                          ? 'border-red-300 bg-red-50 dark:bg-red-900/10' 
                          : 'border-gray-200 dark:border-gray-700'
                      }`}>
                        <Controller
                          name="acceptTerms"
                          control={registerForm.control}
                          render={({ field }) => (
                            <Checkbox 
                              id="acceptTerms"
                              checked={field.value || false}
                              onCheckedChange={field.onChange}
                              className={registerForm.formState.errors.acceptTerms ? 'border-red-500' : ''}
                            />
                          )}
                        />
                        <Label htmlFor="acceptTerms" className="text-sm leading-relaxed cursor-pointer">
                          Accetto i{' '}
                          <a 
                            href="/terms" 
                            target="_blank"
                            className="text-blue-600 hover:text-blue-800 underline font-medium"
                            onClick={(e) => e.stopPropagation()}
                          >
                            termini e condizioni
                          </a>
                          {' '}e la{' '}
                          <a 
                            href="/privacy" 
                            target="_blank"
                            className="text-blue-600 hover:text-blue-800 underline font-medium"
                            onClick={(e) => e.stopPropagation()}
                          >
                            privacy policy
                          </a>
                        </Label>
                      </div>
                      {registerForm.formState.errors.acceptTerms && (
                        <p className="text-red-500 text-sm">
                          {registerForm.formState.errors.acceptTerms.message}
                        </p>
                      )}

                      <Button
                        type="submit"
                        className="w-full h-11 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 transition-all duration-200"
                        disabled={isRegistering}
                      >
                        {isRegistering ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Registrazione...
                          </>
                        ) : (
                          'Crea Account'
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}