import pg from 'pg';
import config from '../config/env.js';
import { logger } from '../config/logger.js';

const { Pool } = pg;

let poolInstance = null;

export function createPool() {
  if (poolInstance) {
    return poolInstance;
  }

  const poolConfig = config.database.url
    ? { connectionString: config.database.url }
    : {
        host: config.database.host,
        port: config.database.port,
        user: config.database.user,
        password: config.database.password,
        database: config.database.database,
      };

  // Add SSL configuration if needed
  if (config.database.sslMode === 'require') {
    poolConfig.ssl = { rejectUnauthorized: false };
  }

  // Add connection timeouts
  poolConfig.connectionTimeoutMillis = config.database.connectionTimeoutMillis;
  poolConfig.idleTimeoutMillis = config.database.idleTimeoutMillis;
  poolConfig.max = config.database.max;

  poolInstance = new Pool(poolConfig);

  // Handle pool events
  poolInstance.on('connect', () => {
    logger.debug('New database connection created');
  });

  poolInstance.on('error', (err) => {
    logger.error('Unexpected error on idle client in pool', { error: err.message });
  });

  poolInstance.on('remove', () => {
    logger.debug('Client removed from pool');
  });

  return poolInstance;
}

export function getPool() {
  if (!poolInstance) {
    return createPool();
  }
  return poolInstance;
}

export async function testConnection() {
  try {
    const pool = getPool();
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    logger.info('Database connection successful', { timestamp: result.rows[0].now });
    return true;
  } catch (error) {
    logger.error('Database connection failed', { error: error.message, code: error.code });
    return false;
  }
}

export async function closePool() {
  if (poolInstance) {
    try {
      await poolInstance.end();
      logger.info('Database pool closed');
      poolInstance = null;
    } catch (error) {
      logger.error('Error closing database pool', { error: error.message });
    }
  }
}

export const pool = getPool();
export default pool;
