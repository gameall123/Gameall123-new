import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// ✅ Security middleware
app.use((req, res, next) => {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By');
  
  next();
});

// ✅ CORS configurato correttamente per dev e production
const corsOrigins = [
  "https://gameall123-new.onrender.com",
  "http://localhost:5173", // Vite dev server
  "http://localhost:3000", // Alternative dev server
  "http://localhost:5000"  // Local server
];

app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [
        'https://gamesall.top',
        'https://www.gamesall.top',
      ]
    : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// ✅ Body parsing with limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// ✅ Request timeout middleware
app.use((req, res, next) => {
  res.setTimeout(30000, () => {
    console.log('Request has timed out.');
    res.status(408).json({ message: 'Request timeout' });
  });
  next();
});

// Health check endpoint for Render
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'ok', 
    version: '2.1.2',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// ✅ Enhanced logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      
      // ✅ Log errors in detail
      if (res.statusCode >= 400) {
        logLine += ` [ERROR]`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }
      }

      if (logLine.length > 200) {
        logLine = logLine.slice(0, 199) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    const server = await registerRoutes(app);

    // ✅ Static serving / Vite setup (BEFORE error handlers)
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // ✅ Enhanced error handling middleware
    app.use((err: any, req: Request, res: Response, next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      // ✅ Log errors with more context
      console.error(`Error ${status}: ${message}`, {
        url: req.url,
        method: req.method,
        userAgent: req.get('User-Agent'),
        stack: err.stack
      });

      // ✅ Don't expose internal errors in production
      const clientMessage = process.env.NODE_ENV === 'production' && status === 500
        ? "Si è verificato un errore interno del server"
        : message;

      res.status(status).json({ 
        message: clientMessage,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
      });
    });

    // ✅ 404 handler for API routes only
    app.use('/api/*', (req: Request, res: Response) => {
      res.status(404).json({ 
        message: "API endpoint non trovato",
        path: req.originalUrl 
      });
    });

    // ✅ Start server - Dynamic port for Render
    const port = parseInt(process.env.PORT || "5000");
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`🚀 Server running on port ${port} in ${process.env.NODE_ENV || 'development'} mode`);
    });

    // ✅ Graceful shutdown
    process.on('SIGTERM', () => {
      log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        log('Process terminated');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
})();
