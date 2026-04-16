/**
 * Google OAuth Strategy Configuration
 * Configures Passport.js for Google Sign-in
 */

import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import { logger } from '../config/logger.js';

export function configureGoogleStrategy(passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        passReqToCallback: true
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          // Extract user info from Google profile
          const email = profile.emails[0].value;
          const username = profile.displayName.replace(/\s+/g, '_').toLowerCase();
          const googleId = profile.id;
          const profilePhoto = profile.photos[0]?.value;

          // Check if user already exists
          let user = await User.findByEmail(email);

          if (user) {
            // User exists, update Google ID if not set
            logger.info('Google user login', { email });
            return done(null, user);
          }

          // Create new user from Google profile
          // Generate a random password since Google OAuth users don't have passwords
          const randomPassword = Math.random().toString(36).slice(-16);

          const newUser = await User.create(email, username, randomPassword, {
            googleId: googleId,
            profilePhoto: profilePhoto,
            isGoogleUser: true
          });

          logger.info('New Google user created', { email, username });
          return done(null, newUser);
        } catch (error) {
          logger.error('Error in Google OAuth strategy', { error: error.message });
          return done(error);
        }
      }
    )
  );

  // Serialize user
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
}

export default configureGoogleStrategy;
