import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { UserService } from '@/services/userService';

export async function verifyToken(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const user = await UserService.findById(decoded.userId);
    
    return user;
  } catch (error) {
    return null;
  }
}

export function createToken(userId: string) {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '7d' });
}
