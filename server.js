import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bodyParser from 'body-parser';
import config, { validateConfig } from './src/config/env.js';
import { logger } from './src/config/logger.js';
import { testConnection, closePool } from './src/database/connection.js';
import { initializeDatabase, isUsingInMemoryDB } from './src/models/Country.js';
import { initializeUsersDatabase } from './src/models/User.js';
import setupRoutes from './src/routes/index.js';
import configureGoogleStrategy from './src/config/google-strategy.js';
import {
  requestLogger,
  errorHandler,
  validateInput,
  securityHeaders,
  corsMiddleware,
} from './src/middleware/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Validate configuration
const configValidation = validateConfig();
if (!configValidation.isValid) {
  logger.error('Configuration validation failed');
  configValidation.errors.forEach((error) => logger.error(error));
  // Don't exit, allow in-memory DB fallback
}

// Create Express app
const app = express();

// Set view engine
app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));

// Trust proxy if enabled
if (config.security.trustProxy) {
  app.set('trust proxy', 1);
}

// Middleware
app.use(securityHeaders);
app.use(corsMiddleware);
app.use(requestLogger);

// Session middleware - must be before route handlers
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: config.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax',
  },
}));

// Initialize Passport and configure Google OAuth
configureGoogleStrategy(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(validateInput);

// Static files
app.use(express.static(join(__dirname, 'public')));

// Routes
setupRoutes(app);

// Error handling (must be last)
app.use(errorHandler);

// Graceful shutdown handling
let isShuttingDown = false;

async function shutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info(`Received ${signal}, shutting down gracefully...`);

  // Close HTTP server
  if (server) {
    server.close(() => {
      logger.info('HTTP server closed');
    });
  }

  // Close database connection
  if (!isUsingInMemoryDB()) {
    await closePool();
  }

  // Exit process
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);

  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
});

// Start server
let server;

async function startServer() {
  try {
    // Initialize database (with fallback to in-memory)
    logger.info('Initializing database...');
    const usingInMemory = await initializeDatabase();
    
    // Initialize users database
    await initializeUsersDatabase(usingInMemory);

    if (isUsingInMemoryDB()) {
      logger.warn('⚠️  Running in DEMO mode with in-memory database');
      logger.warn('📝 For production, set up PostgreSQL and restart the application');
      logger.info('To setup PostgreSQL: https://www.postgresql.org/download/');
    }

    // Start listening
    server = app.listen(config.PORT, config.HOST, () => {
      const mode = isUsingInMemoryDB() ? 'DEMO (In-Memory)' : 'PRODUCTION (PostgreSQL)';
      logger.info(`Server running at http://${config.HOST}:${config.PORT}`, {
        environment: config.NODE_ENV,
        mode,
      });
      logger.info('Press Ctrl+C to stop the server');
      logger.info('📖 Documentation: See QUICKSTART.md and STARTUP_GUIDE.md');
    });
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
}

// Start the application
startServer();

export default app;
