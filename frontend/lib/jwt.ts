import jwt from 'jsonwebtoken';
import { IUser } from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

export interface JWTPayload {
  userId: string;
  email: string;
}

export function generateToken(user: IUser): string {
  const payload: JWTPayload = {
    userId: (user._id as string).toString(),
    email: user.email,
  };

  return jwt.sign(payload, JWT_SECRET as string, {
    expiresIn: '7d', // Token expires in 7 days
  });
}

export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET as string) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

export function extractUserIdFromToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  
  try {
    const payload = verifyToken(token);
    return payload.userId;
  } catch {
    return null;
  }
}