import { Express, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import validator from 'validator';
import { z } from 'zod';

// 🎯 Types Ultra Moderni
interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  isAdmin: boolean;
  emailVerified: boolean;
  lastLoginAt: Date;
  createdAt: Date;
  updatedAt: Date;
  loginAttempts: number;
  lockUntil?: Date;
}

interface AuthenticatedRequest extends Request {
  user?: User;
}

// 🛡️ Validation Schemas
const loginSchema = z.object({
  email: z.string().email().max(100),
  password: z.string().min(6).max(100),
  rememberMe: z.boolean().optional(),
});

const registerSchema = z.object({
  email: z.string().email().max(100),
  password: z.string().min(8).max(100)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password deve contenere minuscole, maiuscole e numeri'),
  firstName: z.string().min(2).max(50)
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Solo lettere consentite'),
  lastName: z.string().min(2).max(50)
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Solo lettere consentite'),
});

// 🗄️ Mock Database Ultra Avanzato
const mockUsers = new Map<string, User>();
const MAX_USERS = 100;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 30 * 60 * 1000; // 30 minuti

// 🔑 JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'ultra-secure-development-secret-2024';
const JWT_EXPIRES_IN = '7d';
const JWT_REFRESH_EXPIRES_IN = '30d';

// 🛡️ Security Utilities
class SecurityUtils {
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateToken(payload: any, expiresIn: string = JWT_EXPIRES_IN): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
  }

  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Token non valido');
    }
  }

  static sanitizeUser(user: User): Omit<User, 'password'> {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  static generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static isAccountLocked(user: User): boolean {
    return !!(user.lockUntil && user.lockUntil > new Date());
  }

  static async incrementLoginAttempts(userId: string): Promise<void> {
    const user = mockUsers.get(userId);
    if (!user) return;

    const attempts = user.loginAttempts + 1;
    const updates: Partial<User> = { loginAttempts: attempts };

    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      updates.lockUntil = new Date(Date.now() + LOCK_TIME);
    }

    Object.assign(user, updates);
    mockUsers.set(userId, user);
  }

  static async resetLoginAttempts(userId: string): Promise<void> {
    const user = mockUsers.get(userId);
    if (!user) return;

    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLoginAt = new Date();
    mockUsers.set(userId, user);
  }
}

// 🚫 Rate Limiting Ultra Sicuro
const createRateLimit = (windowMs: number, max: number, message: string) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      console.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({ error: message });
    },
  });
};

const authRateLimit = createRateLimit(15 * 60 * 1000, 5, 'Troppi tentativi di login. Riprova tra 15 minuti.');
const registerRateLimit = createRateLimit(60 * 60 * 1000, 3, 'Troppi tentativi di registrazione. Riprova tra un\'ora.');

// 🛡️ Authentication Middleware
const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.authToken;
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : cookieToken;

    // Enhanced debugging for auth issues
    console.log('🔍 Auth Debug:', {
      hasAuthHeader: !!authHeader,
      hasCookieToken: !!cookieToken,
      hasToken: !!token,
      cookieNames: Object.keys(req.cookies || {}),
      userAgent: req.headers['user-agent']?.substring(0, 50),
    });

    if (!token) {
      console.log('❌ No token found - returning 401');
      return res.status(401).json({ error: 'Non autenticato' });
    }

    const decoded = SecurityUtils.verifyToken(token);
    const user = mockUsers.get(decoded.userId);

    if (!user) {
      console.log('❌ User not found for token:', decoded.userId);
      return res.status(401).json({ error: 'Utente non trovato' });
    }

    if (SecurityUtils.isAccountLocked(user)) {
      console.log('🔒 Account locked:', user.email);
      return res.status(423).json({ error: 'Account temporaneamente bloccato' });
    }

    console.log('✅ Authentication successful for:', user.email);
    req.user = user;
    next();
  } catch (error) {
    console.error('💥 Authentication error:', error.message);
    res.status(401).json({ error: 'Token non valido' });
  }
};

// 🚀 Setup Auth Routes Ultra Moderno
export function setupAuth(app: Express) {
  // 🛡️ Security Headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }));

  // 🔐 Login Endpoint Ultra Sicuro
  app.post('/api/auth/login', authRateLimit, async (req: Request, res: Response) => {
    try {
      console.log('🔐 Login attempt for:', req.body?.email);

      // Validation
      const validatedData = loginSchema.parse(req.body);
      const { email, password, rememberMe } = validatedData;

      // Sanitize input
      const sanitizedEmail = validator.normalizeEmail(email) || email.toLowerCase();

      // Find user
      const user = Array.from(mockUsers.values()).find(u => u.email === sanitizedEmail);
      
      if (!user) {
        console.log('❌ User not found:', sanitizedEmail);
        return res.status(401).json({ error: 'Credenziali non valide' });
      }

      // Check if account is locked
      if (SecurityUtils.isAccountLocked(user)) {
        console.log('🔒 Account locked:', sanitizedEmail);
        return res.status(423).json({ error: 'Account temporaneamente bloccato. Riprova più tardi.' });
      }

      // Verify password
      const isValidPassword = await SecurityUtils.comparePassword(password, user.password);
      
      if (!isValidPassword) {
        console.log('❌ Invalid password for:', sanitizedEmail);
        await SecurityUtils.incrementLoginAttempts(user.id);
        return res.status(401).json({ error: 'Credenziali non valide' });
      }

      // Reset login attempts on successful login
      await SecurityUtils.resetLoginAttempts(user.id);

      // Generate tokens
      const accessToken = SecurityUtils.generateToken({ userId: user.id }, rememberMe ? '30d' : '7d');
      const refreshToken = SecurityUtils.generateToken({ userId: user.id, type: 'refresh' }, JWT_REFRESH_EXPIRES_IN);

      // Set secure cookies
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000, // 30 days or 7 days
      };

      res.cookie('authToken', accessToken, cookieOptions);
      res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 });

      console.log('✅ Login successful for:', sanitizedEmail);

      res.json({
        success: true,
        message: 'Login effettuato con successo',
        user: SecurityUtils.sanitizeUser(user),
        tokens: {
          accessToken,
          refreshToken,
        },
      });

    } catch (error) {
      console.error('💥 Login error:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Dati non validi',
          details: error.errors.map(e => e.message).join(', ')
        });
      }

      res.status(500).json({ error: 'Errore interno del server' });
    }
  });

  // 📝 Register Endpoint Ultra Sicuro
  app.post('/api/auth/register', registerRateLimit, async (req: Request, res: Response) => {
    try {
      console.log('📝 Registration attempt for:', req.body?.email);

      // Validation
      const validatedData = registerSchema.parse(req.body);
      const { email, password, firstName, lastName } = validatedData;

      // Sanitize input
      const sanitizedEmail = validator.normalizeEmail(email) || email.toLowerCase();
      const sanitizedFirstName = validator.escape(firstName.trim());
      const sanitizedLastName = validator.escape(lastName.trim());

      // Check if user already exists
      const existingUser = Array.from(mockUsers.values()).find(u => u.email === sanitizedEmail);
      if (existingUser) {
        console.log('❌ User already exists:', sanitizedEmail);
        return res.status(409).json({ error: 'Un utente con questa email esiste già' });
      }

      // Check user limit
      if (mockUsers.size >= MAX_USERS) {
        console.warn('⚠️ User limit reached, cleaning up...');
        // Cleanup old users (keep only 50% newest)
        const users = Array.from(mockUsers.entries())
          .sort(([,a], [,b]) => a.createdAt.getTime() - b.createdAt.getTime())
          .slice(0, Math.floor(MAX_USERS * 0.5));
        
        mockUsers.clear();
        users.forEach(([id, user]) => mockUsers.set(id, user));
      }

      // Hash password
      const hashedPassword = await SecurityUtils.hashPassword(password);

      // Create new user
      const userId = SecurityUtils.generateUserId();
      const newUser: User = {
        id: userId,
        email: sanitizedEmail,
        password: hashedPassword,
        firstName: sanitizedFirstName,
        lastName: sanitizedLastName,
        isAdmin: false,
        emailVerified: false,
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        loginAttempts: 0,
      };

      // Save user
      mockUsers.set(userId, newUser);

      // Generate tokens (auto-login)
      const accessToken = SecurityUtils.generateToken({ userId });
      const refreshToken = SecurityUtils.generateToken({ userId, type: 'refresh' }, JWT_REFRESH_EXPIRES_IN);

      // Set secure cookies
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      };

      res.cookie('authToken', accessToken, cookieOptions);
      res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 });

      console.log('✅ Registration successful for:', sanitizedEmail);

      res.status(201).json({
        success: true,
        message: 'Registrazione completata con successo',
        user: SecurityUtils.sanitizeUser(newUser),
        tokens: {
          accessToken,
          refreshToken,
        },
      });

    } catch (error) {
      console.error('💥 Registration error:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Dati non validi',
          details: error.errors.map(e => e.message).join(', ')
        });
      }

      res.status(500).json({ error: 'Errore interno del server' });
    }
  });

  // 👤 Get Current User
  app.get('/api/auth/me', authenticate, (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Non autenticato' });
    }

    res.json(SecurityUtils.sanitizeUser(req.user));
  });

  // 🔍 Debug endpoint for auth troubleshooting
  app.get('/api/auth/debug', (req: Request, res: Response) => {
    const cookieNames = Object.keys(req.cookies || {});
    const authHeader = req.headers.authorization;
    const authToken = req.cookies?.authToken;
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      cookies: {
        hasAuthToken: !!authToken,
        tokenLength: authToken?.length || 0,
        allCookies: cookieNames,
      },
      headers: {
        hasAuthHeader: !!authHeader,
        userAgent: req.headers['user-agent']?.substring(0, 100),
        origin: req.headers.origin,
        referer: req.headers.referer,
      },
      mockUsers: {
        totalUsers: mockUsers.size,
        userIds: Array.from(mockUsers.keys()).slice(0, 3), // Only first 3 for privacy
      }
    };

    // Try to decode token if present
    if (authToken) {
      try {
        const decoded = SecurityUtils.verifyToken(authToken);
        debugInfo.tokenInfo = {
          valid: true,
          userId: decoded.userId,
          userExists: mockUsers.has(decoded.userId),
        };
      } catch (error) {
        debugInfo.tokenInfo = {
          valid: false,
          error: error.message,
        };
      }
    }

    console.log('🔍 Auth Debug Request:', debugInfo);
    res.json(debugInfo);
  });

  // 🚪 Logout Endpoint
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    res.clearCookie('authToken');
    res.clearCookie('refreshToken');
    
    console.log('✅ Logout successful');
    res.json({ success: true, message: 'Logout effettuato con successo' });
  });

  // 🔄 Refresh Token
  app.post('/api/auth/refresh', async (req: Request, res: Response) => {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
      
      if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh token mancante' });
      }

      const decoded = SecurityUtils.verifyToken(refreshToken);
      
      if (decoded.type !== 'refresh') {
        return res.status(401).json({ error: 'Token type non valido' });
      }

      const user = mockUsers.get(decoded.userId);
      if (!user) {
        return res.status(401).json({ error: 'Utente non trovato' });
      }

      // Generate new access token
      const newAccessToken = SecurityUtils.generateToken({ userId: user.id });
      
      res.cookie('authToken', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        success: true,
        accessToken: newAccessToken,
        user: SecurityUtils.sanitizeUser(user),
      });

    } catch (error) {
      console.error('💥 Refresh token error:', error);
      res.status(401).json({ error: 'Refresh token non valido' });
    }
  });

  // 📊 Admin Endpoints
  app.get('/api/auth/stats', authenticate, (req: AuthenticatedRequest, res: Response) => {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: 'Accesso negato' });
    }

    const stats = {
      totalUsers: mockUsers.size,
      maxUsers: MAX_USERS,
      lockedAccounts: Array.from(mockUsers.values()).filter(SecurityUtils.isAccountLocked).length,
      recentRegistrations: Array.from(mockUsers.values())
        .filter(u => u.createdAt > new Date(Date.now() - 24 * 60 * 60 * 1000)).length,
    };

    res.json(stats);
  });

  console.log('🔐 Auth system initialized with ultra-modern security');
}

// Export middleware per altri moduli
export { authenticate, SecurityUtils };