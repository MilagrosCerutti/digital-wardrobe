import jwt from 'jsonwebtoken';
import { env } from '@/config/environment';
import { UserRole } from '@/types/user.types';

export interface JwtPayload {
  sub: string;
  role: UserRole;
}

export function signAccessToken(payload: JwtPayload): string {
  const options: jwt.SignOptions = {
    expiresIn: env.jwtExpiresIn as NonNullable<jwt.SignOptions['expiresIn']>,
  };
  return jwt.sign(payload, env.jwtSecret, options);
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwtSecret) as JwtPayload;
}
