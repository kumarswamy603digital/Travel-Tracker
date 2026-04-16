/**
 * Voice Guide Service
 * Uses ElevenLabs to generate speech from tourism guide text
 */

import axios from 'axios';
import { logger } from '../config/logger.js';

class VoiceGuideService {
  constructor() {
    this.apiKey = process.env.ELEVENLABS_API_KEY;
    this.apiUrl = 'https://api.elevenlabs.io/v1';
    this.voiceId = 'EXAVITQu4vr4xnSDxMaL'; // Default voice - Bella
    this.voiceCache = new Map(); // Cache for generated audio
  }

  /**
   * Get available voices
   */
  async getAvailableVoices() {
    try {
      const response = await axios.get(
        `${this.apiUrl}/voices`,
        { headers: { 'xi-api-key': this.apiKey } }
      );

      return {
        success: true,
        voices: response.data.voices.map(v => ({
          id: v.voice_id,
          name: v.name,
          category: v.category
        }))
      };
    } catch (error) {
      logger.warn('Could not fetch ElevenLabs voices', { error: error.message });
      // Return default voices if API fails
      return {
        success: true,
        voices: [
          { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', category: 'professional' },
          { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', category: 'professional' },
          { id: 'AZnzlk1XvdvUBZXVr8i5', name: 'Domi', category: 'expressive' }
        ]
      };
    }
  }

  /**
   * Generate speech from text
   */
  async textToSpeech(text, voiceId = null, language = 'en') {
    try {
      // Check cache
      const cacheKey = `${text.substring(0, 100)}_${voiceId || this.voiceId}`;
      if (this.voiceCache.has(cacheKey)) {
        logger.info('Returning cached voice');
        return {
          success: true,
          audio: this.voiceCache.get(cacheKey),
          cached: true
        };
      }

      // Ensure text is not too long (ElevenLabs limit is 5000 characters)
      if (text.length > 5000) {
        text = text.substring(0, 5000) + '...';
      }

      const response = await axios.post(
        `${this.apiUrl}/text-to-speech/${voiceId || this.voiceId}`,
        {
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        },
        {
          headers: { 'xi-api-key': this.apiKey },
          responseType: 'arraybuffer'
        }
      );

      // Convert to base64 for easy transmission
      const audioBase64 = Buffer.from(response.data).toString('base64');
      const audioDataUrl = `data:audio/mpeg;base64,${audioBase64}`;

      // Cache the result
      this.voiceCache.set(cacheKey, audioDataUrl);

      logger.info('Speech generated successfully', { textLength: text.length });

      return {
        success: true,
        audio: audioDataUrl,
        mimeType: 'audio/mpeg'
      };
    } catch (error) {
      logger.error('Error generating speech', { error: error.message });

      // Return fallback response
      return {
        success: false,
        error: 'Could not generate voice guide',
        message: 'Please try again later'
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
