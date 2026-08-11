import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { UserPayload } from '../types/express.d.js';

export const generateToken = (payload: UserPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
};

export const verifyToken = (token: string): UserPayload => {
  return jwt.verify(token, env.JWT_SECRET) as UserPayload;
};
