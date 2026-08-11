import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const env = {
  PORT: process.env.PORT || '5000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/erp_db?schema=public',
  JWT_SECRET: process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-production-min-32-chars',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
};
