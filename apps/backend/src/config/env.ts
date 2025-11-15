import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

const getOrDefault = (key: string, fallback: string): string => {
  const value = process.env[key];
  if (!value) {
    if (isProduction) {
      throw new Error(`Missing required env var: ${key}`);
    }
    return fallback;
  }
  return value;
};

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: Number(process.env.PORT ?? 4000),
  DATABASE_URL: getOrDefault('DATABASE_URL', 'postgres://eco_user:eco_pass@localhost:5432/eco_db'),
  JWT_SECRET: getOrDefault('JWT_SECRET', 'dev_super_secret_change_me'),
  REDIS_URL: process.env.REDIS_URL ?? 'redis://localhost:6379',
};
