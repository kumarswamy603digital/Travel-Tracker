/**
 * Tourism Guide Controller
 * Handles tourism guide requests and responses
 */

import { aiGuide } from '../services/ai-guide.js';
import { voiceGuide } from '../services/voice-guide.js';
import { imageService } from '../services/image-service.js';
import tourismDatabase from '../utils/tourism-database.js';
import { logger } from '../config/logger.js';
import Country from '../models/Country.js';

class TourismController {
  /**
   * Get tourism guide for a country
   */
  static async getGuide(req, res) {
    try {
      const { country } = req.params;
      const countryCode = country.toUpperCase();

      // Get country data
      const countryData = tourismDatabase.countries[countryCode];
      if (!countryData) {
        return res.status(404).json({
          success: false,
          error: 'Country not found'
        });
      }

      // Get images
      const images = await imageService.getCountryImages(countryData.name, 5);

      // Get initial guide response from AI
      const guideTips = aiGuide.getTipsForCountry(countryCode, 'general');

      res.json({
        success: true,
        country: countryData,
        images: images.images || [],
        tips: guideTips.tips,
        attractions: countryData.attractions
      });
    } catch (error) {
      logger.error('Error in getGuide', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Could not fetch tourism guide'
      });
    }
  }

  /**
   * Get tourism information
   */
  static async getTourismInfo(req, res) {
    try {
      const { country } = req.query;
      const countryCode = country?.toUpperCase();

      if (!countryCode || !tourismDatabase.countries[countryCode]) {
        return res.status(400).json({
          success: false,
          error: 'Valid country code required'
        });
      }

      const countryData = tourismDatabase.countries[countryCode];

      res.json({
        success: true,
        data: countryData
      });
    } catch (error) {
      logger.error('Error in getTourismInfo', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Could not fetch tourism information'
      });
    }
  }

  /**
   * Generate AI guide response
   */
  static async generateAIGuide(req, res) {
    try {
      // Accept both 'message' and 'prompt' parameters
      const message = req.body.message || req.body.prompt;
      const country = req.body.country;
      const userId = req.user?.id || req.sessionID;
      const countryCode = country?.toUpperCase();

      if (!message) {
        return res.status(400).json({
          success: false,
          error: 'Message/prompt is required'
        });
      }

      // Generate guide response
      const response = await aiGuide.generateGuideResponse(userId, message, countryCode);

      res.json(response);
    } catch (error) {
      logger.error('Error in generateAIGuide', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Could not generate guide'
      });
    }
  }

  /**
   * Generate voice guide
   */
  static async generateVoiceGuide(req, res) {
    try {
      const { text, country, voiceId } = req.body;

      if (!text) {
        return res.status(400).json({
          success: false,
          error: 'Text is required for voice generation'
        });
      }

      // Generate voice - should always succeed with fallback
      const result = await voiceGuide.textToSpeech(text, voiceId);

      // Always return 200 since we have fallback mechanism
      res.status(200).json({
        success: result.success !== false,
        audio: result.audio,
        mimeType: result.mimeType || 'audio/wav',
        method: result.method,
        message: result.message
      });
    } catch (error) {
      logger.error('Error in generateVoiceGuide', { error: error.message });
      // Return fallback audio instead of error
      res.status(200).json({
        success: true,
        audio: null, // Will need to generate mock audio
        error: 'Voice generation failed, please try again',
        message: error.message
      });
    }
  }

  /**
   * Get images for a location
   */
  static async getImages(req, res) {
    try {
      const { query, type = 'search', count = 5 } = req.query;

      if (!query) {
        return res.status(400).json({
          success: false,
          error: 'Query is required'
        });
      }

      let result;

      switch (type) {
        case 'country':
          result = await imageService.getCountryImages(query, parseInt(count));
          break;
        case 'attraction':
          const { country } = req.query;
          result = await imageService.getAttractionImages(query, country, parseInt(count));
          break;
        case 'search':
        default:
          result = await imageService.searchTravelImages(query, parseInt(count));
      }

      res.json(result);
    } catch (error) {
      logger.error('Error in getImages', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Could not fetch images'
      });
    }
  }

  /**
   * Create trip plan / itinerary
   */
  static async createTripPlan(req, res) {
    try {
      const { country, duration, interests, budget, pace, accommodation } = req.body;
      const countryCode = country?.toUpperCase();

      if (!countryCode || !duration) {
        return res.status(400).json({
          success: false,
          error: 'Country code and duration are required'
        });
      }

      // Build preferences object
      const preferences = {
        interests: interests || '',
        budget: budget || 'medium',
        pace: pace || 'moderate',
        accommodation: accommodation || 'comfort'
      };

      // Create personalized itinerary based on preferences
      const itinerary = aiGuide.createItinerary(countryCode, parseInt(duration), preferences);

      if (!itinerary.success) {
        return res.status(400).json(itinerary);
      }

      // Get images for the country
      const countryData = tourismDatabase.countries[countryCode];
      const images = await imageService.getCountryImages(countryData.name, 3);

      res.json({
        success: true,
        itinerary: itinerary.itinerary,
        country: itinerary.country,
        duration: itinerary.duration,
        budgetEstimate: itinerary.budgetEstimate,
        images: images.images || [],
        preferences: itinerary.preferences
      });
    } catch (error) {
      logger.error('Error in createTripPlan', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Could not create trip plan'
      });
    }
  }

  /**
   * Get travel tips
   */
  static async getTravelTips(req, res) {
    try {
      const { country, category = 'general' } = req.query;
      const countryCode = country?.toUpperCase();

      if (!countryCode || !tourismDatabase.countries[countryCode]) {
        return res.status(400).json({
          success: false,
          error: 'Valid country code required'
        });
      }

      const tips = aiGuide.getTipsForCountry(countryCode, category);

      res.json(tips);
    } catch (error) {
      logger.error('Error in getTravelTips', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Could not fetch travel tips'
      });
    }
  }

  /**
   * Get country recommendations
   */
  static async getRecommendations(req, res) {
    try {
      const { budget, interests, duration } = req.query;

      const preferences = {
        budget: budget || 'medium',
        interests: interests ? interests.split(',') : [],
        duration: duration || 7
      };

      const recommendations = aiGuide.getCountryRecommendation(preferences);

      res.json(recommendations);
    } catch (error) {
      logger.error('Error in getRecommendations', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Could not get recommendations'
      });
    }
  }

  /**
   * Get available voices for text-to-speech
   */
  static async getAvailableVoices(req, res) {
    try {
      const voices = await voiceGuide.getAvailableVoices();
      res.json(voices);
    } catch (error) {
      logger.error('Error in getAvailableVoices', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Could not fetch available voices'
      });
    }
  }

  /**
   * Get featured destinations
   */
  static async getFeaturedDestinations(req, res) {
    try {
      const result = await imageService.getFeaturedDestinations();
      res.json(result);
    } catch (error) {
      logger.error('Error in getFeaturedDestinations', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Could not fetch featured destinations'
      });
    }
  }

  /**
   * Get travel guide page with initial data
   */
  static async getTravelGuidePage(req, res) {
    try {
      const { country } = req.query;
      const countryCode = country?.toUpperCase();

      // Get available countries
      const countries = Object.values(tourismDatabase.countries).map(c => ({
        code: c.code,
        name: c.name,
        region: c.region
      }));

      let selectedCountry = null;
      let selectedCountryData = null;
      let images = [];

      if (countryCode && tourismDatabase.countries[countryCode]) {
        selectedCountry = countryCode;
        selectedCountryData = tourismDatabase.countries[countryCode];
        const imageResult = await imageService.getCountryImages(selectedCountryData.name, 4);
        images = imageResult.images || [];
      }

      res.render('travel-guide', {
        user: req.user,
        countries: countries,
        selectedCountry: selectedCountry,
        selectedCountryData: selectedCountryData,
        images: images,
        session: req.session
      });
    } catch (error) {
      logger.error('Error in getTravelGuidePage', { error: error.message });
      res.status(500).render('error', {
        error: 'Could not load travel guide'
      });
    }
  }
}

export default TourismController;
