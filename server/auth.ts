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
          const user = await storage.getUserByEmail(email);
          if (!user || !(await comparePasswords(password, user.password))) {
            return done(null, false, { message: 'Email o password non validi' });
          }
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Registration endpoint with robust error handling
  app.post("/api/register", async (req, res, next) => {
    // Ensure we always send JSON response
    res.setHeader('Content-Type', 'application/json');
    
    try {
      console.log('📝 Registration attempt started');
      console.log('📋 Request body keys:', Object.keys(req.body || {}));
      
      const { email, password, firstName, lastName } = req.body || {};
      
      // Validate required fields
      if (!email || !password || !firstName || !lastName) {
        console.log('❌ Missing required fields:', { 
          hasEmail: !!email, 
          hasPassword: !!password, 
          hasFirstName: !!firstName, 
          hasLastName: !!lastName 
        });
        return res.status(400).json({ 
          message: "Tutti i campi sono obbligatori",
          missing: {
            email: !email,
            password: !password,
            firstName: !firstName,
            lastName: !lastName
          }
        });
      }

      console.log('🔍 Checking existing user for email:', email);
      let existingUser;
      try {
        existingUser = await storage.getUserByEmail(email);
        console.log('✅ User check completed, found:', !!existingUser);
      } catch (dbError) {
        console.error('💥 Database error during user check:', dbError);
        return res.status(500).json({ 
          message: "Errore database durante verifica utente",
          error: dbError.message 
        });
      }
      
      if (existingUser) {
        console.log('❌ Email already exists:', email);
        return res.status(400).json({ message: "Email già registrata" });
      }

      console.log('🔐 Hashing password...');
      let hashedPassword;
      try {
        hashedPassword = await hashPassword(password);
        console.log('✅ Password hashed successfully');
      } catch (hashError) {
        console.error('💥 Password hashing error:', hashError);
        return res.status(500).json({ 
          message: "Errore durante hashing password",
          error: hashError.message 
        });
      }
      
      console.log('💾 Creating user...');
      let user;
      try {
        user = await storage.createUser({
          email,
          password: hashedPassword,
          firstName,
          lastName,
          isAdmin: false,
        });
        console.log('✅ User created successfully:', { id: user.id, email: user.email });
      } catch (createError) {
        console.error('💥 User creation error:', createError);
        return res.status(500).json({ 
          message: "Errore durante creazione utente",
          error: createError.message 
        });
      }

      // Skip login for now to avoid additional complexity
      console.log('🎉 Registration completed, returning user data');
      return res.status(201).json({
        message: "Registrazione completata con successo",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin,
        }
      });
      
    } catch (error) {
      console.error('💥 Unexpected registration error:', error);
      console.error('Stack trace:', error.stack);
      
      // Ensure we send JSON even in unexpected errors
      if (!res.headersSent) {
        return res.status(500).json({ 
          message: "Errore imprevisto durante la registrazione",
          error: error.message,
          type: error.constructor.name
        });
      }
    }
  });

  // Login endpoint
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info?.message || "Credenziali non valide" });
      }
      
      req.login(user, (err) => {
        if (err) return next(err);
        res.json({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin,
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
    res.json({
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      isAdmin: req.user.isAdmin,
    });
  });
}