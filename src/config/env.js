import dotenv from 'dotenv';
import { existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env files
function loadEnv() {
  const envProjectPath = join(dirname(__dirname), '../..', '.env');
  const envCwdPath = join(process.cwd(), '.env');
  
  if (existsSync(envProjectPath)) {
    dotenv.config({ path: envProjectPath });
  } else if (existsSync(envCwdPath)) {
    dotenv.config({ path: envCwdPath });
  }
}

loadEnv();

export const config = {
  // Server
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 3000,
  HOST: process.env.HOST || 'localhost',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',

  // Database
  database: {
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT, 10) || 5432,
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || process.env.POSTGRES_PASSWORD || '',
    database: process.env.PGDATABASE || 'travel_tracker',
    url: process.env.DATABASE_URL,
    sslMode: process.env.PGSSLMODE || 'disable',
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    max: 20, // Max connections in pool
  },

  // Security
  security: {
    corsOrigin: process.env.CORS_ORIGIN || '*',
    trustProxy: process.env.TRUST_PROXY === 'true',
    apiKey: process.env.API_KEY,
  },

  // Feature flags
  features: {
    fuzzySearch: process.env.ENABLE_FUZZY_SEARCH === 'true',
  },
};

export function validateConfig() {
  const errors = [];

  // Check database configuration
  if (!config.database.url && !config.database.password) {
    errors.push('Database password is required. Set PGPASSWORD in .env file.');
  }

  if (config.NODE_ENV === 'production') {
    if (!config.database.url && config.database.sslMode === 'disable') {
      errors.push('Production database should use SSL (set PGSSLMODE=require).');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export default config;
