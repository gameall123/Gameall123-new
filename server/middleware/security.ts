import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// Rate limiting map
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export const rateLimit = (windowMs: number, max: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    
    // Clean up old entries
    for (const [ip, data] of rateLimitMap.entries()) {
      if (now > data.resetTime) {
        rateLimitMap.delete(ip);
      }
    }
    
    const clientData = rateLimitMap.get(clientIp) || { count: 0, resetTime: now + windowMs };
    
    if (clientData.count >= max && now < clientData.resetTime) {
      return res.status(429).json({ 
        message: 'Troppi tentativi. Riprova più tardi.',
        retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
      });
    }
    
    clientData.count++;
    rateLimitMap.set(clientIp, clientData);
    
    next();
  };
};

export const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Dati non validi',
          errors: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
      }
      next(error);
    }
  };
};

export const sanitizeHtml = (req: Request, res: Response, next: NextFunction) => {
  // Basic HTML sanitization for text fields
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/<[^>]+>/g, '')
                .trim();
    }
    if (typeof obj === 'object' && obj !== null) {
      const sanitized: any = {};
      for (const key in obj) {
        sanitized[key] = sanitize(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };
  
  if (req.body) {
    req.body = sanitize(req.body);
  }
  
  next();
};

export const requireAdmin = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { storage } = await import('../storage');
    const user = await storage.getUser(req.user.id);
    
    if (!user?.isAdmin) {
      return res.status(403).json({ 
        message: 'Accesso negato. Privilegi di amministratore richiesti.' 
      });
    }
    
    next();
  } catch (error) {
    console.error('Error checking admin status:', error);
    res.status(500).json({ message: 'Errore del server' });
  }
};