import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

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
  password: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  createdAt: string;
}>();

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// ✅ Mock getUserByEmail function
async function getMockUserByEmail(email: string) {
  for (const user of mockUsers.values()) {
    if (user.email === email) {
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
  
  const sessionSettings: session.SessionOptions = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    },
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
          
          // ✅ Use mock user storage
          const user = await getMockUserByEmail(email);
          if (!user) {
            console.log('❌ User not found:', email);
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
      registeredUsers: mockUsers.size
    });
  });

  // ✅ Updated registration endpoint - saves to mock storage
  app.post("/api/register", async (req, res) => {
    try {
      console.log('📝 Registration attempt');
      
      const { email, password, firstName, lastName } = req.body || {};
      
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ message: "Tutti i campi sono obbligatori" });
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
        email,
        password: hashedPassword,
        firstName,
        lastName,
        isAdmin: false,
        createdAt: new Date().toISOString()
      };

      // ✅ Save to mock storage
      mockUsers.set(userId, newUser);
      
      console.log('✅ User registered and saved:', userId);
      
      // Return user without password
      const { password: _, ...userResponse } = newUser;
      return res.status(201).json({
        message: "Registrazione completata con successo",
        user: userResponse
      });
      
    } catch (error) {
      console.error('💥 Registration error:', error);
      return res.status(500).json({ message: "Errore durante la registrazione" });
    }
  });

  // ✅ Updated login endpoint with better error handling
  app.post("/api/login", (req, res, next) => {
    console.log('🔐 Login endpoint called');
    
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        console.error('💥 Passport authentication error:', err);
        return next(err);
      }
      
      if (!user) {
        console.log('❌ Login failed:', info?.message);
        return res.status(401).json({ 
          message: info?.message || "Credenziali non valide",
          success: false 
        });
      }
      
      req.login(user, (err) => {
        if (err) {
          console.error('💥 Session login error:', err);
          return next(err);
        }
        
        console.log('✅ Login successful, returning user data');
        
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
      if (err) return next(err);
      res.json({ message: "Logout effettuato con successo" });
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
      users: users
    });
  });
}