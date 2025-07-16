import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import RedisStore from "connect-redis";
import { createClient } from "redis";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

// ✅ Mock user storage in memory for development
const mockUsers = new Map<string, {
  id: string;
  email: string;
  password: string | null;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
  phone: string | null;
  bio: string | null;
  shippingAddress: any;
  paymentMethod: any;
  provider: string;
  providerId: string | null;
  isAdmin: boolean;
  emailVerified: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}>();

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  try {
    const [hashed, salt] = stored.split(".");
    if (!hashed || !salt) {
      return false;
    }
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error("Password comparison error:", error);
    return false;
  }
}

// ✅ Input validation helpers
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

function validatePassword(password: string): boolean {
  return password.length >= 6 && password.length <= 128;
}

function validateName(name: string): boolean {
  return name.length >= 2 && name.length <= 50 && /^[a-zA-ZÀ-ÿ\s'-]+$/.test(name);
}

// ✅ Mock getUserByEmail function
async function getMockUserByEmail(email: string) {
  for (const user of mockUsers.values()) {
    if (user.email.toLowerCase() === email.toLowerCase()) {
      return user;
    }
  }
  return null;
}

// ✅ Mock getUser function
async function getMockUser(id: string) {
  return mockUsers.get(id) || null;
}

export function setupAuth(app: Express) {
  const sessionSecret = process.env.SESSION_SECRET || 'development-session-secret-change-in-production';

  // Configuro il client Redis
  const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    legacyMode: true,
  });
  redisClient.connect().catch(console.error);

  // Configuro RedisStore per le sessioni
  const sessionSettings: session.SessionOptions = {
    store: new RedisStore({ client: redisClient }),
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    name: 'gameall.session',
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      ...(process.env.NODE_ENV === 'production' && { domain: '.gamesall.top' }),
    },
    rolling: true,
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      { usernameField: 'email' },
      async (email, password, done) => {
        try {
          console.log('🔐 Login attempt for email:', email);
          
          // ✅ Input validation
          if (!validateEmail(email)) {
            console.log('❌ Invalid email format:', email);
            return done(null, false, { message: 'Formato email non valido' });
          }
          
          if (!validatePassword(password)) {
            console.log('❌ Invalid password format');
            return done(null, false, { message: 'Password non valida' });
          }
          
          // ✅ Use mock user storage
          const user = await getMockUserByEmail(email);
          if (!user) {
            console.log('❌ User not found:', email);
            return done(null, false, { message: 'Email o password non validi' });
          }
          
          if (!user.password) {
            console.log('❌ User has no password (social auth):', email);
            return done(null, false, { message: 'Email o password non validi' });
          }
          const passwordMatch = await comparePasswords(password, user.password);
          if (!passwordMatch) {
            console.log('❌ Wrong password for:', email);
            return done(null, false, { message: 'Email o password non validi' });
          }
          
          console.log('✅ Login successful for:', email);
          return done(null, user);
        } catch (error) {
          console.error('💥 Login error:', error);
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      // ✅ Use mock user storage
      const user = await getMockUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Test endpoint to verify server is working
  app.get("/api/test", (req, res) => {
    res.json({ 
      message: "Auth server is working", 
      timestamp: new Date().toISOString(),
      endpoints: ["/api/test", "/api/register", "/api/login", "/api/user"],
      registeredUsers: mockUsers.size,
      environment: process.env.NODE_ENV
    });
  });

  // ✅ Updated registration endpoint - saves to mock storage and auto-login
  app.post("/api/register", async (req, res) => {
    try {
      console.log('📝 Registration attempt');
      
      const { email, password, firstName, lastName } = req.body || {};
      
      // ✅ Enhanced input validation
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ message: "Tutti i campi sono obbligatori" });
      }

      if (!validateEmail(email)) {
        return res.status(400).json({ message: "Formato email non valido" });
      }

      if (!validatePassword(password)) {
        return res.status(400).json({ message: "La password deve essere tra 6 e 128 caratteri" });
      }

      if (!validateName(firstName)) {
        return res.status(400).json({ message: "Nome non valido (2-50 caratteri, solo lettere)" });
      }

      if (!validateName(lastName)) {
        return res.status(400).json({ message: "Cognome non valido (2-50 caratteri, solo lettere)" });
      }

      // Check if user already exists
      if (await getMockUserByEmail(email)) {
        return res.status(400).json({ message: "Un utente con questa email esiste già" });
      }

      // ✅ Create user with hashed password and save to mock storage
      const hashedPassword = await hashPassword(password);
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newUser = {
        id: userId,
        email: email.toLowerCase(), // ✅ Normalize email
        password: hashedPassword,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        profileImageUrl: null,
        phone: null,
        bio: null,
        shippingAddress: {},
        paymentMethod: {},
        provider: 'email',
        providerId: null,
        isAdmin: false,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // ✅ Save to mock storage
      mockUsers.set(userId, newUser);
      
      console.log('✅ User registered and saved:', userId);
      
      // ✅ Auto-login after registration
      req.login(newUser, (err) => {
        if (err) {
          console.error('💥 Auto-login error after registration:', err);
          // Still return success for registration, but without auto-login
          const { password: _, ...userResponse } = newUser;
          return res.status(201).json({
            message: "Registrazione completata con successo. Effettua il login.",
            user: userResponse,
            autoLogin: false
          });
        }
        
        console.log('✅ Registration and auto-login successful');
        
        // Return user without password
        const { password: _, ...userResponse } = newUser;
        return res.status(201).json({
          message: "Registrazione completata con successo",
          user: userResponse,
          autoLogin: true
        });
      });
      
    } catch (error) {
      console.error('💥 Registration error:', error);
      return res.status(500).json({ message: "Errore durante la registrazione" });
    }
  });

  // ✅ Updated login endpoint with better error handling
  app.post("/api/login", (req, res, next) => {
    console.log('🔐 Login endpoint called with:', { email: req.body?.email });
    
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        console.error('💥 Passport authentication error:', err);
        return res.status(500).json({ message: "Errore del server durante l'autenticazione" });
      }
      
      if (!user) {
        console.log('❌ Login failed:', info?.message);
        return res.status(401).json({ 
          message: info?.message || "Credenziali non valide",
          success: false 
        });
      }
      
      console.log('🔐 User found, attempting session login for:', user.email);
      
      req.login(user, (err) => {
        if (err) {
          console.error('💥 Session login error:', err);
          return res.status(500).json({ message: "Errore nella creazione della sessione" });
        }
        
        console.log('✅ Login successful, user authenticated:', user.email);
        console.log('🔍 Session info:', { 
          sessionId: req.sessionID,
          isAuthenticated: req.isAuthenticated(),
          userId: req.user?.id 
        });
        
        // Return user without password
        const { password: _, ...userResponse } = user;
        res.json({
          ...userResponse,
          success: true
        });
      });
    })(req, res, next);
  });

  // Logout endpoint
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) {
        console.error('💥 Logout error:', err);
        return res.status(500).json({ message: "Errore durante il logout" });
      }
      // ✅ Destroy session completely
      req.session.destroy((err) => {
        if (err) {
          console.error('💥 Session destroy error:', err);
        }
        res.clearCookie('gameall.session');
        res.json({ message: "Logout effettuato con successo" });
      });
    });
  });

  // Current user endpoint
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Non autenticato" });
    }
    
    // Return user without password
    const { password: _, ...userResponse } = req.user;
    res.json(userResponse);
  });

  // ✅ Debug endpoint to check registered users
  app.get("/api/debug/users", (req, res) => {
    const users = Array.from(mockUsers.values()).map(user => {
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    res.json({
      totalUsers: users.length,
      users: users,
      environment: process.env.NODE_ENV
    });
  });
}