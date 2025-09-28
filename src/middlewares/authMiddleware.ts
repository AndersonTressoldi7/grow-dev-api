// src/middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

export function authMiddleware(req: Request & { userId?: string }, res: Response, next: NextFunction) {
  const authHeader = String(req.headers.authorization || '');
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token missing' });
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET || 'your-secret-key';

  try {
    const payload = jwt.verify(token, secret) as JwtPayload;
    (req as any).userId = payload.userId; // anexa userId ao request
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido' });
  }
}
