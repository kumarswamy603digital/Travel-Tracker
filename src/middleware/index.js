import { logger } from '../config/logger.js';

/**
 * Request logging middleware
 */
export function requestLogger(req, res, next) {
  const start = Date.now();

  // Capture the original res.end function
  const originalEnd = res.end;

  res.end = function (...args) {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const method = req.method;
    const path = req.path;

    const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
    logger[level](`${method} ${path}`, { statusCode, duration: `${duration}ms` });

    originalEnd.apply(res, args);
  };

  next();
}

/**
 * Error handling middleware
 */
export function errorHandler(err, req, res, next) {
  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';

  logger.error('Request error', {
    status,
    message,
    path: req.path,
    method: req.method,
    stack: err.stack,
  });

  // Check if response already sent
  if (res.headersSent) {
    return next(err);
  }

  // Handle different error types
  if (err.code === '28P01') {
    return res.status(200).render('index', {
      countries: [],
      total: 0,
      formError: 'Database authentication failed. Check your PGPASSWORD in .env file.',
      inputError: false,
      dbOffline: true,
    });
  }

  if (err.code === '3D000') {
    return res.status(200).render('index', {
      countries: [],
      total: 0,
      formError: 'Database does not exist. Please create it using the SQL setup scripts.',
      inputError: false,
      dbOffline: true,
    });
  }

  if (err.code === '42P01') {
    return res.status(200).render('index', {
      countries: [],
      total: 0,
      formError: 'A required database table is missing. Run the schema setup scripts.',
      inputError: false,
      dbOffline: true,
    });
  }

  // Connection errors
  if (['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'EAI_AGAIN'].includes(err.code)) {
    return res.status(200).render('index', {
      countries: [],
      total: 0,
      formError: 'Cannot connect to database. Ensure PostgreSQL is running.',
      inputError: false,
      dbOffline: true,
    });
  }

  // JSON API error response
  if (req.path.startsWith('/api/')) {
    return res.status(status).json({
      error: {
        message,
        status,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
      },
    });
  }

  // HTML error response
  res.status(status).render('error', {
    message,
    error: { status, stack: process.env.NODE_ENV === 'development' ? err.stack : '' },
  });
}

/**
 * Validation middleware
 */
export function validateInput(req, res, next) {
  const { country } = req.body || {};

  // Sanitize input
  if (country && typeof country === 'string') {
    req.body.country = country.trim().slice(0, 100); // Limit to 100 chars
  }

  next();
}

/**
 * Security headers middleware
 */
export function securityHeaders(req, res, next) {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'DENY');
  res.set('X-XSS-Protection', '1; mode=block');
  res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
}

/**
 * CORS middleware (simplified)
 */
export function corsMiddleware(req, res, next) {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
}

export default {
  requestLogger,
  errorHandler,
  validateInput,
  securityHeaders,
  corsMiddleware,
};
