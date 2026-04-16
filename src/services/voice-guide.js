/**
 * Voice Guide Service
 * Uses ElevenLabs to generate speech from tourism guide text
 */

import axios from 'axios';
import { logger } from '../config/logger.js';

class VoiceGuideService {
  constructor() {
    // ElevenLabs Voice Agent Configuration
    this.apiKey = process.env.ELEVENLABS_API_KEY;
    this.agentId = process.env.VOICE_AGENT_ID;
    this.agentEndpoint = process.env.VOICE_AGENT_ENDPOINT;
    this.voiceCache = new Map(); // Cache for generated audio
  }

  /**
   * Generate speech from text using ElevenLabs Voice Agent
   */
  async textToSpeech(text, voiceId = null, language = 'en') {
    try {
      // Check if API key is configured
      if (!this.apiKey) {
        logger.warn('ElevenLabs API key not configured');
        return {
          success: false,
          error: 'Voice guide service unavailable',
          message: 'ElevenLabs API is not configured. Set ELEVENLABS_API_KEY environment variable.',
          fallback: true
        };
      }

      if (!this.agentEndpoint) {
        logger.warn('Voice agent endpoint not configured');
        return {
          success: false,
          error: 'Voice agent not configured',
          message: 'Set VOICE_AGENT_ENDPOINT environment variable.',
          fallback: true
        };
      }

      // Check cache
      const cacheKey = `${text.substring(0, 100)}_${voiceId || 'agent'}`;
      if (this.voiceCache.has(cacheKey)) {
        logger.info('Returning cached voice');
        return {
          success: true,
          audio: this.voiceCache.get(cacheKey),
          cached: true
        };
      }

      // Ensure text is not too long
      if (text.length > 5000) {
        text = text.substring(0, 5000) + '...';
      }

      logger.info('Sending text to ElevenLabs Voice Agent:', { textLength: text.length });

      // Call ElevenLabs Agent API with conversation format
      const response = await axios.post(
        this.agentEndpoint,
        {
          user_message: text
          // Agent will process and respond with voice
        },
        {
          headers: {
            'xi-api-key': this.apiKey,
            'Content-Type': 'application/json'
          },
          timeout: 30000,
          responseType: 'arraybuffer'
        }
      );

      // Convert response to base64 for easy transmission
      const audioBase64 = Buffer.from(response.data).toString('base64');
      const audioDataUrl = `data:audio/mpeg;base64,${audioBase64}`;

      // Cache the result
      this.voiceCache.set(cacheKey, audioDataUrl);

      logger.info('Voice generated via ElevenLabs Agent');

      return {
        success: true,
        audio: audioDataUrl,
        mimeType: 'audio/mpeg'
      };
    } catch (error) {
      logger.error('Error generating speech via agent', { error: error.message, code: error.code });

      // Provide specific error messages
      let errorMessage = 'Could not generate voice guide';
      if (error.code === 'ECONNREFUSED') {
        errorMessage = 'Cannot connect to voice service';
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid ElevenLabs API key or Agent ID';
      } else if (error.response?.status === 429) {
        errorMessage = 'Voice service rate limit exceeded';
      } else if (error.response?.status === 404) {
        errorMessage = 'Voice agent not found';
      }

      // Return fallback response
      return {
        success: false,
        error: errorMessage,
        message: 'Please try again later or check your API configuration',
        fallback: true
      };
    }
  }

  /**
   * Generate audio for tourism guide
   */
  async generateTourGuide(countryName, attractions, voiceId = null) {
    try {
      let text = `Welcome to ${countryName}! `;
      text += `In this tour, we'll explore some amazing attractions: `;
      text += attractions.map(a => a.name).join(', ');
      text += '. ';
      text += `Enjoy your virtual tour and let this guide help you plan your visit!`;

      return this.textToSpeech(text, voiceId);
    } catch (error) {
      logger.error('Error generating tour guide', { error: error.message });
      return {
        success: false,
        error: 'Could not generate tour guide'
      };
    }
  }

  /**
   * Generate audio for travel tips
   */
  async generateTravelTips(tips, voiceId = null) {
    try {
      let text = 'Here are some important travel tips: ';
      text += tips.join('. ');
      text += '. Safe travels!';

      return this.textToSpeech(text, voiceId);
    } catch (error) {
      logger.error('Error generating travel tips', { error: error.message });
      return {
        success: false,
        error: 'Could not generate travel tips'
      };
    }
  }

  /**
   * Generate multilingual greeting
   */
  async generateGreeting(countryName, language = 'en', voiceId = null) {
    try {
      const greetings = {
        en: `Welcome to ${countryName}! We're excited to help you explore this amazing destination.`,
        es: `¡Bienvenido a ${countryName}! Estamos emocionados de ayudarte a explorar este destino increíble.`,
        fr: `Bienvenue en ${countryName}! Nous sommes heureux de vous aider à explorer cette destination incroyable.`,
        de: `Willkommen in ${countryName}! Wir freuen uns, Ihnen bei der Erkundung dieses fantastischen Reiseziels zu helfen.`,
        ja: `${countryName}へようこそ！この素晴らしい目的地を探索するのを楽しみにしています。`,
        hi: `${countryName}में आपका स्वागत है! हम इस अद्भुत गंतव्य की खोज करने में आपकी मदद करने के लिए उत्साहित हैं।`
      };

      const text = greetings[language] || greetings['en'];
      return this.textToSpeech(text, voiceId);
    } catch (error) {
      logger.error('Error generating greeting', { error: error.message });
      return {
        success: false,
        error: 'Could not generate greeting'
      };
    }
  }

  /**
   * Clear voice cache
   */
  clearCache() {
    this.voiceCache.clear();
    return { success: true, message: 'Voice cache cleared' };
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      cacheSize: this.voiceCache.size,
      maxCacheSize: 100,
      cachedItems: Array.from(this.voiceCache.keys()).map(k => k.substring(0, 50))
    };
  }
}

export const voiceGuide = new VoiceGuideService();
export default VoiceGuideService;
