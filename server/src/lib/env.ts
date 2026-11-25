import dotenv from 'dotenv'

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET || JWT_SECRET === 'fallback-secret' || JWT_SECRET.length < 16) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'CRITICAL SECURITY ERROR: JWT_SECRET environment variable is missing, too short, or using default fallback in production.'
    )
  } else {
    console.warn(
      '⚠️  [SECURITY WARNING]: Using local development JWT secret. Ensure a strong JWT_SECRET (>= 32 chars) is set in .env for production.'
    )
  }
}

export const ENV = {
  PORT: parseInt(process.env.PORT || '3001', 10),
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  JWT_SECRET: JWT_SECRET || 'local-development-secret-key-min-32-chars-long-do-not-use-prod',
  NODE_ENV: process.env.NODE_ENV || 'development',
}

export default ENV
