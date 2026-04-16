import TravelController from '../controllers/TravelController.js';
import AuthController from '../controllers/AuthController.js';
import TourismController from '../controllers/TourismController.js';
import { isAuthenticated, isNotAuthenticated } from '../middleware/auth.js';
import passport from 'passport';

export function setupRoutes(app) {
  // ============================================
  // Public Routes (No Authentication Required)
  // ============================================

  // Authentication routes - Local
  app.get('/login', isNotAuthenticated, AuthController.getLogin);
  app.post('/login', isNotAuthenticated, AuthController.postLogin);
  app.get('/register', isNotAuthenticated, AuthController.getRegister);
  app.post('/register', isNotAuthenticated, AuthController.postRegister);

  // Authentication routes - Google OAuth
  app.get('/auth/google',
    passport.authenticate('google', {
      scope: ['profile', 'email']
    })
  );

  app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
      // Successful authentication, redirect to home
      res.redirect('/');
    }
  );

  // Health check (public)
  app.get('/health', TravelController.getHealth);

  // ============================================
  // Protected Routes (Authentication Required)
  // ============================================

  // Main application
  app.get('/', isAuthenticated, TravelController.getHome);
  app.post('/', isAuthenticated, TravelController.addCountry);

  // User Dashboard
  app.get('/dashboard', isAuthenticated, AuthController.getDashboard);

  // Travel Tracker API endpoints
  app.get('/api/statistics', isAuthenticated, TravelController.getStatistics);
  app.get('/api/search', isAuthenticated, TravelController.searchCountries);
  app.post('/api/countries', isAuthenticated, TravelController.addCountry);
  app.delete('/api/countries/:countryCode', isAuthenticated, TravelController.deleteCountry);

  // Tourism Guide Routes
  app.get('/travel-guide', isAuthenticated, TourismController.getTravelGuidePage);
  app.get('/api/guide/:country', isAuthenticated, TourismController.getGuide);
  app.get('/api/tourism-info', isAuthenticated, TourismController.getTourismInfo);
  
  // AI Guide API endpoints
  app.post('/api/guide/ai', isAuthenticated, TourismController.generateAIGuide);
  app.post('/api/voice-guide', isAuthenticated, TourismController.generateVoiceGuide);
  app.get('/api/voices', isAuthenticated, TourismController.getAvailableVoices);
  
  // Images API endpoints
  app.get('/api/images', isAuthenticated, TourismController.getImages);
  app.get('/api/featured-destinations', isAuthenticated, TourismController.getFeaturedDestinations);
  
  // Trip Planning API endpoints
  app.post('/api/trip-plan', isAuthenticated, TourismController.createTripPlan);
  app.get('/api/travel-tips', isAuthenticated, TourismController.getTravelTips);
  app.get('/api/recommendations', isAuthenticated, TourismController.getRecommendations);

  // User profile
  app.get('/api/profile', isAuthenticated, AuthController.getProfile);

  // Logout
  app.get('/logout', AuthController.logout);

  // ============================================
  // Error Handling
  // ============================================

  // 404 handler (must be last)
  app.use((req, res) => {
    res.status(404).render('error', {
      message: 'Page not found',
      error: { status: 404, stack: '' },
    });
  });
}

export default setupRoutes;
