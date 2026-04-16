import config from './env.js';

const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const currentLevel = LOG_LEVELS[config.LOG_LEVEL] || LOG_LEVELS.info;

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
};

function formatTimestamp() {
  return new Date().toISOString();
}

function formatMessage(level, message, meta = {}) {
  const timestamp = formatTimestamp();
  const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message} ${metaStr}`.trim();
}

export const logger = {
  error: (message, meta) => {
    if (LOG_LEVELS.error <= currentLevel) {
      console.error(`${colors.red}${formatMessage('error', message, meta)}${colors.reset}`);
    }
  },

  warn: (message, meta) => {
    if (LOG_LEVELS.warn <= currentLevel) {
      console.warn(`${colors.yellow}${formatMessage('warn', message, meta)}${colors.reset}`);
    }
  },

  info: (message, meta) => {
    if (LOG_LEVELS.info <= currentLevel) {
      console.log(`${colors.green}${formatMessage('info', message, meta)}${colors.reset}`);
    }
  },

  debug: (message, meta) => {
    if (LOG_LEVELS.debug <= currentLevel) {
      console.log(`${colors.blue}${formatMessage('debug', message, meta)}${colors.reset}`);
    }
  },
};

export default logger;
