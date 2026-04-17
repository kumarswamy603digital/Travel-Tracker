/**
 * AI Tourism Guide Service
 * Uses Ollama to provide intelligent tourism recommendations and information
 */

import axios from 'axios';
import config from '../config/env.js';
import { logger } from '../config/logger.js';
import tourismDatabase from '../utils/tourism-database.js';

class AITourismGuide {
  constructor() {
    this.ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    this.model = process.env.OLLAMA_MODEL || 'neural-chat';
    this.conversationHistory = new Map(); // userId -> conversation messages
  }

  /**
   * Initialize conversation for a user
   */
  initializeConversation(userId) {
    if (!this.conversationHistory.has(userId)) {
      this.conversationHistory.set(userId, [
        {
          role: 'system',
          content: `You are a friendly and enthusiastic travel companion! You love talking about destinations, 
            sharing travel tips, and helping people plan amazing trips. 
            You're casual, conversational, and genuinely excited about travel. 
            Use natural language like a friend would - don't sound robotic or overly formal. 
            Keep responses concise but engaging. 
            Add casual expressions, friendly tone, and enthusiasm!
            For example: "Oh, Paris is absolutely amazing! You'll love it there..." 
            instead of "Paris is a famous destination with many attractions."
            Be helpful, warm, and authentic in your responses.`
        }
      ]);
    }
  }

  /**
   * Generate tourism guide response using Ollama
   */
  async generateGuideResponse(userId, userMessage, countryCode = null) {
    try {
      this.initializeConversation(userId);

      // Build context from tourism database if country provided
      let context = '';
      if (countryCode) {
        const countryData = tourismDatabase.countries[countryCode];
        if (countryData) {
          context = `
            Country: ${countryData.name}
            Capital: ${countryData.capital}
            Region: ${countryData.region}
            Language: ${countryData.language}
            Currency: ${countryData.currency}
            Best Time to Visit: ${countryData.bestTime}
            Description: ${countryData.description}
            Key Attractions: ${countryData.highlights.join(', ')}
          `;
        }
      }

      // Get conversation history
      const history = this.conversationHistory.get(userId) || [];
      const messages = [...history];

      // Add user message
      messages.push({
        role: 'user',
        content: context ? `${context}\n\nUser Question: ${userMessage}` : userMessage
      });

      // Call Ollama API
      const response = await axios.post(
        `${this.ollamaUrl}/api/chat`,
        {
          model: this.model,
          messages: messages,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            top_k: 40
          }
        },
        { timeout: 30000 }
      );

      const aiResponse = response.data.message.content;

      // Update conversation history
      messages.push({
        role: 'assistant',
        content: aiResponse
      });

      // Keep only last 20 messages to avoid context overflow
      if (messages.length > 20) {
        messages.shift();
      }

      this.conversationHistory.set(userId, messages);

      logger.info('AI Guide response generated', { userId, messageLength: aiResponse.length });

      return {
        success: true,
        response: aiResponse,
        source: 'ollama'
      };
    } catch (error) {
      logger.error('Error generating guide response', { error: error.message });
      
      // Fallback to template-based responses
      return this.generateTemplateResponse(userMessage, countryCode);
    }
  }

  /**
   * Fallback template-based responses when Ollama is unavailable
   */
  generateTemplateResponse(userMessage, countryCode) {
    const message = userMessage.toLowerCase();
    let response = '';

    // Check for question type
    if (message.includes('best time') || message.includes('when')) {
      const country = tourismDatabase.countries[countryCode];
      if (country) {
        response = `Oh, great question! The best time to visit ${country.name} is definitely ${country.bestTime}. 
        That's when you'll get the most amazing weather and the best experience overall. You're gonna love it!`;
      }
    } else if (message.includes('what to do') || message.includes('activities')) {
      const country = tourismDatabase.countries[countryCode];
      if (country) {
        response = `So many amazing things to do in ${country.name}! Here's what I'd recommend:\n
        • Don't miss: ${country.highlights.slice(0, 3).join(', ')} - seriously, these are incredible!\n
        • Explore the local culture and try the amazing food\n
        • If you're adventurous, try hiking or water sports\n
        • Check out the museums and historical sites\n
        Popular spots everyone loves: ${country.attractions.map(a => a.name).slice(0, 5).join(', ')}\n
        You'll have an unforgettable time!`;
      }
    } else if (message.includes('budget') || message.includes('cost') || message.includes('expense')) {
      const country = tourismDatabase.countries[countryCode];
      if (country) {
        response = `Perfect! For ${country.name}, you're looking at around ${country.avgBudget} per day.\n
        Here are some money-saving tips:\n
        • Eat at local restaurants - the food is way better and cheaper!\n
        • Use public transport - it's super affordable\n
        • Book your place early to get great deals\n
        • Look for free attractions - there's usually tons!\n
        You can definitely travel smart without breaking the bank!`;
      }
    } else if (message.includes('safety')) {
      const country = tourismDatabase.countries[countryCode];
      if (country) {
        response = `Good thinking! Safety in ${country.name} is ${country.safety}.\n
        Here's what I always tell travelers:\n
        • Let someone know where you're going\n
        • Keep your valuables in a safe place\n
        • Respect local customs and laws\n
        • Stay aware of your surroundings\n
        But honestly, with common sense, you'll be totally fine!`;
      }
    } else if (message.includes('packing') || message.includes('prepare')) {
      response = `Great, let me help you pack smart!\n
        • Light, comfy clothes (trust me, you'll wear them)\n
        • Universal power adapter - total lifesaver\n
        • Travel insurance docs and your ID\n
        • Any medications you need\n
        • Comfortable walking shoes - you'll do tons of exploring!\n
        • Sunscreen and a hat\n
        • Your camera or phone to capture memories\n
        You're all set for an amazing trip!`;
    } else if (message.includes('tip') || message.includes('advice')) {
      response = `Here are my favorite travel tips:\n
        ${tourismDatabase.travelTips.culture.slice(0, 3).join('\n')}\n
        Trust me, these will make your trip so much better!`;
    } else {
      response = `Hey! I'm your AI travel buddy! 🌍 I'm here to help with:\n
        • Awesome facts about countries and attractions\n
        • Real travel tips that actually work\n
        • Budget planning so you can travel more\n
        • Activity ideas that match your style\n
        • Packing advice\n
        • Safety info\n
        What would you like to explore?`;
    }

    return {
      success: true,
      response: response,
      source: 'template'
    };
  }

  /**
   * Get country recommendation
   */
  getCountryRecommendation(preferences) {
    try {
      const { budget, interests, climate, duration } = preferences;
      
      // Score countries based on preferences
      const scores = {};

      Object.entries(tourismDatabase.countries).forEach(([code, country]) => {
        let score = 0;

        // Budget scoring
        if (budget === 'low' && country.avgBudget.includes('$30') || country.avgBudget.includes('$40') ||
            country.avgBudget.includes('$50')) {
          score += 30;
        } else if (budget === 'medium' && country.avgBudget.includes('$70') || country.avgBudget.includes('$80') ||
                   country.avgBudget.includes('$90') || country.avgBudget.includes('$100')) {
          score += 30;
        } else if (budget === 'high') {
          score += 20;
        }

        // Interest matching
        if (interests && interests.includes('adventure')) {
          if (['JP', 'AU', 'BR'].includes(code)) score += 25;
        }
        if (interests && interests.includes('culture')) {
          if (['IN', 'FR', 'JP', 'GB'].includes(code)) score += 25;
        }
        if (interests && interests.includes('beaches')) {
          if (['BR', 'AU', 'GB'].includes(code)) score += 25;
        }
        if (interests && interests.includes('nature')) {
          if (['BR', 'AU', 'US', 'DE'].includes(code)) score += 25;
        }

        scores[code] = score;
      });

      // Sort and get top 3 recommendations
      const recommendations = Object.entries(scores)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([code, _]) => tourismDatabase.countries[code]);

      return {
        success: true,
        recommendations: recommendations
      };
    } catch (error) {
      logger.error('Error getting country recommendation', { error: error.message });
      return {
        success: false,
        error: 'Could not generate recommendations'
      };
    }
  }

  /**
   * Get tips for a country
   */
  getTipsForCountry(countryCode, category = 'general') {
    try {
      const country = tourismDatabase.countries[countryCode];
      if (!country) {
        return { success: false, error: 'Country not found' };
      }

      let tips = [];

      switch (category) {
        case 'packing':
          tips = tourismDatabase.travelTips.packing;
          break;
        case 'safety':
          tips = tourismDatabase.travelTips.safety;
          tips.push(country.safety);
          break;
        case 'budgeting':
          tips = tourismDatabase.travelTips.budgeting;
          tips.push(`Daily budget: ${country.avgBudget}`);
          break;
        case 'culture':
          tips = tourismDatabase.travelTips.culture;
          tips.push(`Language: ${country.language}`);
          tips.push(`Currency: ${country.currency}`);
          break;
        case 'transportation':
          tips = tourismDatabase.transportation.tips;
          break;
        default:
          tips = [
            `Best time to visit: ${country.bestTime}`,
            `Language: ${country.language}`,
            `Currency: ${country.currency}`,
            `Average budget: ${country.avgBudget}`,
            `Safety: ${country.safety}`
          ];
      }

      return {
        success: true,
        country: country.name,
        category: category,
        tips: tips
      };
    } catch (error) {
      logger.error('Error getting tips', { error: error.message });
      return { success: false, error: 'Could not retrieve tips' };
    }
  }

  /**
   * Create an itinerary
   */
  createItinerary(countryCode, duration, preferences = {}) {
    try {
      const country = tourismDatabase.countries[countryCode];
      if (!country) {
        return { success: false, error: 'Country not found' };
      }

      const { interests = '', budget = 'medium', pace = 'moderate', accommodation = 'comfort' } = preferences;
      
      // Parse interests into array
      const userInterests = interests.split(',').map(i => i.trim().toLowerCase()).filter(i => i);

      const itinerary = [];
      const attractionsPerDay = Math.ceil(country.attractions.length / duration);

      // Get activities based on interests
      const getActivitiesForDay = (day) => {
        const activities = [];
        const paceMultiplier = pace === 'relaxed' ? 1 : pace === 'moderate' ? 2 : 3;
        
        // Select activities based on interests
        if (userInterests.includes('adventure')) {
          activities.push(...tourismDatabase.activities.adventure?.slice(0, 2) || ['Hiking', 'Outdoor sports']);
        }
        if (userInterests.includes('culture') || userInterests.includes('cultural')) {
          activities.push(...tourismDatabase.activities.cultural?.slice(0, 2) || ['Museum visit', 'Local tours']);
        }
        if (userInterests.includes('food')) {
          activities.push('Local food tour', 'Street food exploration');
        }
        if (userInterests.includes('nature')) {
          activities.push('Nature walk', 'Wildlife spotting');
        }
        if (userInterests.includes('relaxation') || userInterests.includes('relax')) {
          activities.push('Spa experience', 'Leisurely exploration');
        }
        if (userInterests.includes('beaches') || userInterests.includes('beach')) {
          activities.push('Beach time', 'Water activities');
        }
        
        // Default activities if no interests specified
        if (activities.length === 0) {
          activities.push(...tourismDatabase.activities.cultural?.slice(0, 2) || ['Local exploration', 'Sightseeing']);
        }

        return activities.slice(0, paceMultiplier);
      };

      // Get accommodation-specific tips
      const accommodationTips = {
        budget: 'Book budget hostels/hotels in advance. Check reviews on travel sites.',
        comfort: 'Mid-range hotels offer good value. Book 2-3 weeks ahead for best rates.',
        luxury: 'Reserve luxury hotels now for best availability and special amenities.'
      };

      // Get pace-specific tips
      const paceTips = {
        relaxed: 'Take your time to immerse in the culture. No rush!',
        moderate: 'Balanced exploration - enjoy attractions without exhausting yourself.',
        fast: 'Packed itinerary! Wear comfortable shoes and stay energized.'
      };

      for (let day = 1; day <= duration; day++) {
        const startIdx = (day - 1) * attractionsPerDay;
        const dayAttractions = country.attractions.slice(
          startIdx,
          Math.min(startIdx + attractionsPerDay, country.attractions.length)
        );

        let dayTip = '';
        if (day === 1) {
          dayTip = `Day 1: Arrive and settle in. ${accommodationTips[accommodation] || accommodationTips.comfort}`;
        } else if (day === duration) {
          dayTip = `Final day: Explore at leisure and prepare departure. ${paceTips[pace] || paceTips.moderate}`;
        } else {
          dayTip = paceTips[pace] || paceTips.moderate;
        }

        itinerary.push({
          day: day,
          attractions: dayAttractions.length > 0 ? dayAttractions : ['Explore the city', 'Visit local markets'],
          activities: getActivitiesForDay(day),
          tips: dayTip,
          budget: budget,
          pace: pace,
          accommodation: accommodation
        });
      }

      return {
        success: true,
        country: country.name,
        duration: `${duration} days`,
        itinerary: itinerary,
        budgetEstimate: country.avgBudget,
        preferences: {
          interests: userInterests,
          budget: budget,
          pace: pace,
          accommodation: accommodation
        }
      };
    } catch (error) {
      logger.error('Error creating itinerary', { error: error.message });
      return { success: false, error: 'Could not create itinerary' };
    }
  }

  /**
   * Clear conversation history
   */
  clearConversation(userId) {
    this.conversationHistory.delete(userId);
    return { success: true, message: 'Conversation cleared' };
  }
}

export const aiGuide = new AITourismGuide();
export default AITourismGuide;
