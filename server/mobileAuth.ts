import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.SESSION_SECRET || "mobile-app-secret-key";
const JWT_EXPIRY = "30d";

export interface MobileTokenPayload {
  userId: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      mobileUser?: MobileTokenPayload;
    }
  }
}

export function generateMobileToken(user: { id: string; email: string; role: string }): string {
  const payload: MobileTokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

export function verifyMobileToken(token: string): MobileTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as MobileTokenPayload;
  } catch {
    return null;
  }
}

export function requireMobileAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization token required" });
  }
  
  const token = authHeader.substring(7);
  const payload = verifyMobileToken(token);
  
  if (!payload) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
  
  req.mobileUser = payload;
  next();
}

export function requireMobileOrSessionAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const payload = verifyMobileToken(token);
    
    if (payload) {
      req.mobileUser = payload;
      req.session.userId = payload.userId;
      return next();
    }
  }
  
  if (req.session?.userId) {
    return next();
  }
  
  return res.status(401).json({ message: "Authentication required" });
}
