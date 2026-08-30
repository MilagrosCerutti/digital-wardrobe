import dotenv from 'dotenv';

dotenv.config({ quiet: true });

interface Environment {
  nodeEnv: string;
  port: number;
  supabaseUrl: string;
  supabaseKey: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  corsOrigin: string;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function loadEnvironment(): Environment {
  const nodeEnv = process.env.NODE_ENV ?? 'development';
  const isTest = nodeEnv === 'test';

  return {
    nodeEnv,
    port: Number(process.env.PORT ?? 4000),
    supabaseUrl: isTest ? (process.env.SUPABASE_URL ?? '') : requireEnv('SUPABASE_URL'),
    supabaseKey: isTest ? (process.env.SUPABASE_KEY ?? '') : requireEnv('SUPABASE_KEY'),
    jwtSecret: isTest ? (process.env.JWT_SECRET ?? 'test-secret') : requireEnv('JWT_SECRET'),
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
    corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  };
}

export const env = loadEnvironment();
