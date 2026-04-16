import User from '../models/User.js';
import { logger } from '../config/logger.js';

export class AuthController {
  /**
   * Render login page
   */
  static async getLogin(req, res) {
    try {
      // If already logged in, redirect to home
      if (req.session.userId) {
        return res.redirect('/');
      }

      res.render('login', {
        error: null,
        email: '',
      });
    } catch (error) {
      logger.error('Error rendering login page', { error: error.message });
      res.status(500).render('error', { error: 'Failed to load login page' });
    }
  }

  /**
   * Handle login form submission
   */
  static async postLogin(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.render('login', {
          error: 'Email and password are required',
          email,
        });
      }

      // Authenticate user
      let user;
      try {
        user = await User.authenticate(email, password);
      } catch (authError) {
        // Handle authentication failure (invalid credentials)
        logger.error('Authentication failed', { email, error: authError.message });
        return res.render('login', {
          error: 'Invalid email or password',
          email,
        });
      }

      // Set session
      req.session.userId = user.id;
      req.session.userEmail = user.email;
      req.session.username = user.username;

      logger.info('User logged in', { email });
      res.redirect('/dashboard');
    } catch (error) {
      logger.error('Error during login', { error: error.message });
      res.status(500).render('error', { error: 'An error occurred during login. Please try again.' });
    }
  }

  /**
   * Render registration page
   */
  static async getRegister(req, res) {
    try {
      // If already logged in, redirect to home
      if (req.session.userId) {
        return res.redirect('/');
      }

      res.render('register', {
        error: null,
        email: '',
        username: '',
      });
    } catch (error) {
      logger.error('Error rendering register page', { error: error.message });
      res.status(500).render('error', { error: 'Failed to load registration page' });
    }
  }

  /**
   * Handle registration form submission
   */
  static async postRegister(req, res, next) {
    try {
      const { email, username, password, confirmPassword } = req.body;

      // Validate input
      if (!email || !username || !password || !confirmPassword) {
        return res.render('register', {
          error: 'All fields are required',
          email,
          username,
        });
      }

      if (password !== confirmPassword) {
        return res.render('register', {
          error: 'Passwords do not match',
          email,
          username,
        });
      }

      // Create user
      const user = await User.create(email, username, password);

      // Set session
      req.session.userId = user.id;
      req.session.userEmail = user.email;
      req.session.username = user.username;

      logger.info('User registered', { email, username });
      res.redirect('/');
    } catch (error) {
      const errorMessage =
        error.statusCode === 409
          ? error.message
          : error.statusCode === 400
          ? error.message
          : 'Registration failed. Please try again.';

      return res.render('register', {
        error: errorMessage,
        email: req.body.email || '',
        username: req.body.username || '',
      });
    }
  }

  /**
   * Handle logout
   */
  static async logout(req, res) {
    try {
      const email = req.session.userEmail;
      req.session.destroy((err) => {
        if (err) {
          logger.error('Error destroying session', { error: err.message });
        }
        logger.info('User logged out', { email });
        res.redirect('/login');
      });
    } catch (error) {
      logger.error('Error during logout', { error: error.message });
      res.redirect('/');
    }
  }

  /**
   * Get current user info
   */
  static async getProfile(req, res) {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const user = await User.findById(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      logger.error('Error fetching user profile', { error: error.message });
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  }
}

export default AuthController;
