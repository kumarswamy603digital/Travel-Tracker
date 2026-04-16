import { logger } from '../config/logger.js';

/**
 * Check if user is authenticated
 * If not, redirect to login
 */
export function isAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }

  logger.warn('Unauthenticated access attempt', {
    path: req.path,
    ip: req.ip,
  });

  // For API routes, return 401
  if (req.path.startsWith('/api/')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // For page routes, redirect to login
  res.redirect('/login');
}

/**
 * Optional authentication - continue but add user info to request
 */
export function optionalAuth(req, res, next) {
  if (req.session && req.session.userId) {
    req.user = {
      id: req.session.userId,
      email: req.session.userEmail,
      username: req.session.username,
    };
  }
  next();
}

/**
 * Check if user is NOT authenticated
 * If already logged in, redirect to home
 */
export function isNotAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    return res.redirect('/');
  }
  next();
}

export default {
  isAuthenticated,
  optionalAuth,
  isNotAuthenticated,
};
