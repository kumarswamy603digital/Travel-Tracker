import bcrypt from 'bcryptjs';
import { logger } from '../config/logger.js';

const { pool } = await import('../database/connection.js');

let useInMemoryDB = false;

// In-memory database for users (development mode)
const inMemoryDB = {
  users: new Map(), // userId -> { id, email, username, passwordHash, createdAt }
};

/**
 * Initialize users database
 */
export async function initializeUsersDatabase(inMemoryMode = false) {
  useInMemoryDB = inMemoryMode;
  
  if (!useInMemoryDB) {
    try {
      // Create users table if it doesn't exist
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          username VARCHAR(100) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      logger.info('Users table initialized in PostgreSQL');
    } catch (error) {
      logger.warn('Could not create users table in PostgreSQL', { error: error.message });
      useInMemoryDB = true;
    }
  }
}

export class User {
  /**
   * Create a new user account
   */
  static async create(email, username, password, options = {}) {
    try {
      // Validate input - password can be optional for OAuth users
      if (!email || !username) {
        const error = new Error('Email and username are required');
        error.statusCode = 400;
        throw error;
      }

      // Only validate password for non-OAuth users
      if (!options.isGoogleUser && !password) {
        const error = new Error('Password is required');
        error.statusCode = 400;
        throw error;
      }

      if (!options.isGoogleUser && password.length < 8) {
        const error = new Error('Password must be at least 8 characters');
        error.statusCode = 400;
        throw error;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        const error = new Error('Invalid email format');
        error.statusCode = 400;
        throw error;
      }

      // Hash password (only for non-OAuth users)
      let passwordHash = null;
      if (password) {
        const salt = await bcrypt.genSalt(10);
        passwordHash = await bcrypt.hash(password, salt);
      }

      if (useInMemoryDB) {
        // Check if user already exists
        for (const user of inMemoryDB.users.values()) {
          if (user.email === email) {
            const error = new Error('Email already registered');
            error.statusCode = 409;
            throw error;
          }
          if (user.username === username) {
            const error = new Error('Username already taken');
            error.statusCode = 409;
            throw error;
          }
        }

        // Create user
        const userId = Date.now().toString();
        const newUser = {
          id: userId,
          email,
          username,
          passwordHash,
          createdAt: new Date().toISOString(),
          googleId: options.googleId || null,
          profilePhoto: options.profilePhoto || null,
          isGoogleUser: options.isGoogleUser || false,
        };

        inMemoryDB.users.set(userId, newUser);
        logger.info('User created (in-memory)', { username, email, isGoogleUser: options.isGoogleUser });

        return {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
        };
      }

      // PostgreSQL path
      const result = await pool.query(
        `INSERT INTO users (email, username, password_hash) 
         VALUES ($1, $2, $3) 
         RETURNING id, email, username`,
        [email, username, passwordHash]
      );

      logger.info('User created in PostgreSQL', { username, email });
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        // Unique constraint violation
        if (error.constraint === 'users_email_key') {
          const uniqueError = new Error('Email already registered');
          uniqueError.statusCode = 409;
          throw uniqueError;
        }
        if (error.constraint === 'users_username_key') {
          const uniqueError = new Error('Username already taken');
          uniqueError.statusCode = 409;
          throw uniqueError;
        }
      }
      logger.error('Error creating user', { error: error.message, email, username });
      throw error;
    }
  }

  /**
   * Find user by email
   */
  static async findByEmail(email) {
    try {
      if (useInMemoryDB) {
        for (const user of inMemoryDB.users.values()) {
          if (user.email === email) {
            return user;
          }
        }
        return null;
      }

      const result = await pool.query(
        'SELECT id, email, username, password_hash FROM users WHERE email = $1',
        [email]
      );

      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error finding user by email', { error: error.message });
      throw error;
    }
  }

  /**
   * Find user by username
   */
  static async findByUsername(username) {
    try {
      if (useInMemoryDB) {
        for (const user of inMemoryDB.users.values()) {
          if (user.username === username) {
            return user;
          }
        }
        return null;
      }

      const result = await pool.query(
        'SELECT id, email, username, password_hash FROM users WHERE username = $1',
        [username]
      );

      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error finding user by username', { error: error.message });
      throw error;
    }
  }

  /**
   * Find user by ID
   */
  static async findById(userId) {
    try {
      if (useInMemoryDB) {
        const user = inMemoryDB.users.get(userId);
        return user || null;
      }

      const result = await pool.query(
        'SELECT id, email, username FROM users WHERE id = $1',
        [userId]
      );

      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error finding user by ID', { error: error.message });
      throw error;
    }
  }

  /**
   * Authenticate user (verify password)
   */
  static async authenticate(email, password) {
    try {
      const user = await User.findByEmail(email);
      if (!user) {
        const error = new Error('Invalid email or password');
        error.statusCode = 401;
        throw error;
      }

      const isValid = await bcrypt.compare(password, user.passwordHash || user.password_hash);
      if (!isValid) {
        const error = new Error('Invalid email or password');
        error.statusCode = 401;
        throw error;
      }

      logger.info('User authenticated', { email });
      return {
        id: user.id,
        email: user.email,
        username: user.username,
      };
    } catch (error) {
      logger.error('Error authenticating user', { error: error.message });
      throw error;
    }
  }

  /**
   * Update user profile
   */
  static async update(userId, updates) {
    try {
      if (useInMemoryDB) {
        const user = inMemoryDB.users.get(userId);
        if (!user) {
          const error = new Error('User not found');
          error.statusCode = 404;
          throw error;
        }

        // Update only allowed fields
        if (updates.username) user.username = updates.username;
        if (updates.email) user.email = updates.email;

        logger.info('User updated (in-memory)', { userId });
        return user;
      }

      let query = 'UPDATE users SET ';
      const values = [];
      let paramCount = 1;

      if (updates.username) {
        query += `username = $${paramCount++}, `;
        values.push(updates.username);
      }
      if (updates.email) {
        query += `email = $${paramCount++}, `;
        values.push(updates.email);
      }

      query += `updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount} RETURNING id, email, username`;
      values.push(userId);

      const result = await pool.query(query, values);
      if (result.rows.length === 0) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
      }

      logger.info('User updated in PostgreSQL', { userId });
      return result.rows[0];
    } catch (error) {
      logger.error('Error updating user', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Delete user account
   */
  static async delete(userId) {
    try {
      if (useInMemoryDB) {
        if (!inMemoryDB.users.has(userId)) {
          const error = new Error('User not found');
          error.statusCode = 404;
          throw error;
        }

        inMemoryDB.users.delete(userId);
        logger.info('User deleted (in-memory)', { userId });
        return true;
      }

      const result = await pool.query('DELETE FROM users WHERE id = $1', [userId]);

      if (result.rowCount === 0) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
      }

      logger.info('User deleted from PostgreSQL', { userId });
      return true;
    } catch (error) {
      logger.error('Error deleting user', { error: error.message, userId });
      throw error;
    }
  }
}

export default User;
