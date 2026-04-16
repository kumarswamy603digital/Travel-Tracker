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
          content: `You are an expert travel guide and tourism advisor. 
            You provide helpful, accurate information about countries, attractions, 
            travel tips, cultural insights, and trip planning. 
            Keep responses concise and engaging. 
            Be friendly and enthusiastic about travel.`
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
        response = `The best time to visit ${country.name} is ${country.bestTime}. ` +
          `This period offers the most pleasant weather and the best experience for tourism.`;
      }
    } else if (message.includes('what to do') || message.includes('activities')) {
      const country = tourismDatabase.countries[countryCode];
      if (country) {
        response = `In ${country.name}, you can:
        • Visit famous attractions: ${country.highlights.slice(0, 3).join(', ')}
        • Explore local culture and cuisine
        • Try adventure activities like hiking or water sports
        • Visit museums and historical sites
        
        Popular attractions: ${country.attractions.map(a => a.name).join(', ')}`;
      }
    } else if (message.includes('budget') || message.includes('cost') || message.includes('expense')) {
      const country = tourismDatabase.countries[countryCode];
      if (country) {
        response = `Daily budget for ${country.name}: ${country.avgBudget}\n\n` +
          `Tips to save money:
        • Eat at local restaurants
        • Use public transport
        • Book accommodations in advance
        • Look for free attractions`;
      }
    } else if (message.includes('safety')) {
      const country = tourismDatabase.countries[countryCode];
      if (country) {
        response = `Safety in ${country.name}: ${country.safety}\n\n` +
          `General safety tips:
        • Register with your embassy
        • Keep valuables secure
        • Follow local laws and customs
        • Stay aware of your surroundings`;
      }
    } else if (message.includes('packing') || message.includes('prepare')) {
      response = `Here's what you should pack:\n\n` +
        `• Light, comfortable clothing
        • Universal power adapter
        • Travel insurance documents
        • Medications and first-aid supplies
        • Comfortable walking shoes
        • Sun protection (sunscreen, hat)
        • Camera or smartphone`;
    } else if (message.includes('tip') || message.includes('advice')) {
      response = tourismDatabase.travelTips.culture.join('\n• ');
    } else {
      response = `I'm your AI travel guide! I can help you with:
        • Information about countries and attractions
        • Travel tips and advice
        • Budget planning
        • Activity recommendations
        • Packing suggestions
        • Safety information
        
        What would you like to know?`;
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
