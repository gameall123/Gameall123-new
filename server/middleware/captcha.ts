import { Request, Response, NextFunction } from 'express';

// Simple in-memory CAPTCHA store (in production, use Redis or similar)
const captchaStore = new Map<string, { solution: string; expires: number }>();

// Generate simple math CAPTCHA
export function generateCaptcha(): { challenge: string; solution: string } {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  const operations = ['+', '-', '*'];
  const operation = operations[Math.floor(Math.random() * operations.length)];
  
  let solution: number;
  switch (operation) {
    case '+':
      solution = num1 + num2;
      break;
    case '-':
      solution = num1 - num2;
      break;
    case '*':
      solution = num1 * num2;
      break;
    default:
      solution = num1 + num2;
  }
  
  const challenge = `${num1} ${operation} ${num2} = ?`;
  
  return {
    challenge,
    solution: solution.toString(),
  };
}

// Get CAPTCHA endpoint
export function getCaptcha(req: Request, res: Response) {
  const { challenge, solution } = generateCaptcha();
  const captchaId = Math.random().toString(36).substring(2, 15);
  
  // Store with 10 minute expiry
  captchaStore.set(captchaId, {
    solution,
    expires: Date.now() + 10 * 60 * 1000,
  });
  
  res.json({
    captchaId,
    challenge,
  });
}

// Verify CAPTCHA middleware
export function verifyCaptcha(req: Request, res: Response, next: NextFunction) {
  const { captchaId, captchaSolution } = req.body;
  
  if (!captchaId || !captchaSolution) {
    return res.status(400).json({ message: 'CAPTCHA obbligatorio' });
  }
  
  const captchaData = captchaStore.get(captchaId);
  
  if (!captchaData) {
    return res.status(400).json({ message: 'CAPTCHA non valido o scaduto' });
  }
  
  if (captchaData.expires < Date.now()) {
    captchaStore.delete(captchaId);
    return res.status(400).json({ message: 'CAPTCHA scaduto' });
  }
  
  if (captchaData.solution !== captchaSolution.toString()) {
    return res.status(400).json({ message: 'CAPTCHA errato' });
  }
  
  // Clean up used CAPTCHA
  captchaStore.delete(captchaId);
  
  next();
}

// Clean up expired CAPTCHAs every 15 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, data] of captchaStore.entries()) {
    if (data.expires < now) {
      captchaStore.delete(id);
    }
  }
}, 15 * 60 * 1000);