import jwt from "jsonwebtoken"
import { UserType } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret-key'; // Replace with a strong, random secret in production

if (!process.env.JWT_SECRET) {
  console.warn('JWT_SECRET is not defined in .env.local. Using default secret for development only.');
}

export const signToken = (user: Pick<UserType, 'id' | 'username' | 'email'>): string => {
  return jwt.sign({ userId: user.id, username: user.username, email: user.email }, JWT_SECRET, {
    expiresIn: '1h', // You can adjust the expiration time
  });
};

export const verifyToken = (token: string): { userId: string; username: string; email: string } | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; username: string; email: string };
    return decoded;
  } catch (error) {
    console.error('JWT verification error:', error); 
    return null;
  }
};

export const getUserFromToken = (token: string): { userId: string; username: string; email: string } | null => {
    return verifyToken(token);
};