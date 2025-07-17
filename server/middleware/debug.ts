import { Request, Response, NextFunction } from 'express';

export const debugAuth = (req: any, res: Response, next: NextFunction) => {
  console.log('🔍 Debug Auth Middleware:', {
    url: req.url,
    method: req.method,
    hasUser: !!req.user,
    userId: req.user?.id,
    isAdmin: req.user?.isAdmin,
    headers: {
      authorization: !!req.headers.authorization,
      cookie: !!req.headers.cookie
    }
  });
  next();
};

export const adminErrorHandler = (err: any, req: any, res: Response, next: NextFunction) => {
  console.error('❌ Admin Error:', {
    error: err.message,
    stack: err.stack,
    user: req.user?.id,
    url: req.url
  });

  res.status(500).json({
    error: 'Errore interno del server',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Errore autenticazione admin',
    errorId: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  });
};
