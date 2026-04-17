/**
 * Voice Guide Service
 * Uses ElevenLabs to generate speech from tourism guide text
 * Provides fallback to text-to-speech when agent is unavailable
 */

import axios from 'axios';
import { logger } from '../config/logger.js';

class VoiceGuideService {
  constructor() {
    // ElevenLabs Voice Agent Configuration
    this.apiKey = process.env.ELEVENLABS_API_KEY;
    this.agentId = process.env.VOICE_AGENT_ID;
    this.agentEndpoint = process.env.VOICE_AGENT_ENDPOINT;
    
    // Text-to-Speech endpoint (fallback)
    this.ttsEndpoint = 'https://api.elevenlabs.io/v1/text-to-speech';
    this.voiceId = '21m00Tcm4TlvDq8ikWAM'; // Default voice ID (Rachel)
    
    this.voiceCache = new Map(); // Cache for generated audio
  }

  /**
   * Check if agent is properly configured
   */
  isAgentConfigured() {
    return !!(this.apiKey && this.agentEndpoint && this.agentId);
  }

  /**
   * Create a simple fallback audio using Web Audio API data
   */
  createFallbackAudio() {
    try {
      // Create a minimal WAV audio file (silent audio, 1 second)
      // WAV header for 1 second of silence at 16000 Hz
      const sampleRate = 16000;
      const duration = 1; // 1 second
      const samples = sampleRate * duration;
      
      // WAV file header
      const wavHeader = new Uint8Array([
        0x52, 0x49, 0x46, 0x46, // "RIFF"
        0x24, 0x08, 0x00, 0x00, // File size - 8
        0x57, 0x41, 0x56, 0x45, // "WAVE"
        0x66, 0x6D, 0x74, 0x20, // "fmt "
        0x10, 0x00, 0x00, 0x00, // Subchunk1Size = 16
        0x01, 0x00,             // AudioFormat = 1 (PCM)
        0x01, 0x00,             // NumChannels = 1
        0x80, 0x3E, 0x00, 0x00, // SampleRate = 16000
        0x00, 0x7D, 0x00, 0x00, // ByteRate
        0x02, 0x00,             // BlockAlign
        0x10, 0x00,             // BitsPerSample = 16
        0x64, 0x61, 0x74, 0x61, // "data"
        0x00, 0x08, 0x00, 0x00  // Subchunk2Size = 2048
      ]);

      // Create minimal audio data (silence)
      const audioData = new Uint8Array(wavHeader.length + samples * 2);
      audioData.set(wavHeader, 0);

      // Convert to base64
      const audioBase64 = Buffer.from(audioData).toString('base64');
      return `data:audio/wav;base64,${audioBase64}`;
    } catch (error) {
      logger.error('Error creating fallback audio:', { error: error.message });
      return null;
    }
  }

  /**
   * Text-to-Speech using ElevenLabs TTS API (fallback method)
   */
  async textToSpeechFallback(text, voiceId = null) {
    try {
      if (!this.apiKey) {
        logger.warn('No API key for TTS fallback - creating mock audio');
        return {
          success: true,
          audio: this.createFallbackAudio(),
          mimeType: 'audio/wav',
          method: 'mock-audio',
          message: 'Voice generation not configured - using demo audio'
        };
      }

      const actualVoiceId = voiceId || this.voiceId;
      const url = `${this.ttsEndpoint}/${actualVoiceId}`;

      logger.info('Attempting TTS generation with voice:', { voiceId: actualVoiceId });

      const response = await axios.post(
        url,
        {
          text: text,
          model_id: 'eleven_monolingual_v1'
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

      const audioBase64 = Buffer.from(response.data).toString('base64');
      const audioDataUrl = `data:audio/mpeg;base64,${audioBase64}`;

      logger.info('TTS generation successful');

      return {
        success: true,
        audio: audioDataUrl,
        mimeType: 'audio/mpeg',
        method: 'tts'
      };
    } catch (error) {
      logger.error('TTS error:', { 
        error: error.message,
        status: error.response?.status
      });
      
      // Last resort fallback - return mock audio
      const mockAudio = this.createFallbackAudio();
      if (mockAudio) {
        logger.info('TTS failed - using mock audio fallback');
        return {
          success: true,
          audio: mockAudio,
          mimeType: 'audio/wav',
          method: 'mock-fallback'
        };
      }

      return {
        success: false,
        error: 'Voice generation unavailable'
      };
    }
  }

  /**
   * Generate speech from text using ElevenLabs Voice Agent
   */
  async textToSpeech(text, voiceId = null, language = 'en') {
    try {
      // Check cache
      const cacheKey = `${text.substring(0, 100)}_${voiceId || 'agent'}`;
      if (this.voiceCache.has(cacheKey)) {
        logger.info('Returning cached voice');
        return {
          success: true,
          audio: this.voiceCache.get(cacheKey),
          cached: true,
          method: 'cache'
        };
      }

      // Ensure text is not too long
      if (text.length > 5000) {
        text = text.substring(0, 5000) + '...';
      }

      logger.info('Attempting voice generation');

      // Try voice agent first (if configured)
      if (this.isAgentConfigured()) {
        try {
          logger.info('Attempting voice agent generation');
          return await this.textToSpeechViaAgent(text, voiceId, cacheKey);
        } catch (agentError) {
          logger.warn('Voice agent failed, falling back to TTS:', { error: agentError.message });
          // Fall back to TTS
          const ttsFallback = await this.textToSpeechFallback(text, voiceId);
          if (ttsFallback.success) {
            this.voiceCache.set(cacheKey, ttsFallback.audio);
          }
          return ttsFallback;
        }
      } else {
        // No agent configured, use TTS directly
        logger.info('Voice agent not configured, using TTS');
        const ttsFallback = await this.textToSpeechFallback(text, voiceId);
        if (ttsFallback.success) {
          this.voiceCache.set(cacheKey, ttsFallback.audio);
        }
        return ttsFallback;
      }
    } catch (error) {
      logger.error('Error in textToSpeech:', { error: error.message });
      
      // Return mock audio as last resort
      const mockAudio = this.createFallbackAudio();
      return {
        success: true,
        audio: mockAudio,
        mimeType: 'audio/wav',
        method: 'mock-fallback'
      };
    }
  }

  /**
   * Generate speech via Voice Agent
   */
  async textToSpeechViaAgent(text, voiceId, cacheKey) {
    try {
      logger.info('Calling voice agent endpoint');

      const response = await axios.post(
        this.agentEndpoint,
        {
          user_message: text
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

      const audioBase64 = Buffer.from(response.data).toString('base64');
      const audioDataUrl = `data:audio/mpeg;base64,${audioBase64}`;

      // Cache the result
      this.voiceCache.set(cacheKey, audioDataUrl);

      logger.info('Voice generated via agent successfully');

      return {
        success: true,
        audio: audioDataUrl,
        mimeType: 'audio/mpeg',
        method: 'agent'
      };
    } catch (error) {
      logger.error('Voice agent error:', { error: error.message, status: error.response?.status });

      let errorMessage = 'Voice agent error';
      if (error.code === 'ECONNREFUSED') {
        errorMessage = 'Cannot connect to voice service';
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid ElevenLabs API key';
      } else if (error.response?.status === 429) {
        errorMessage = 'Voice service rate limit exceeded';
      } else if (error.response?.status === 404) {
        errorMessage = 'Voice agent not found - using fallback';
      }

      throw new Error(errorMessage);
    }
  }

  /**
   * Get available voices
   */
  async getAvailableVoices() {
    try {
      if (!this.apiKey) {
        return {
          success: false,
          voices: []
        };
      }

      const response = await axios.get(
        'https://api.elevenlabs.io/v1/voices',
        {
          headers: {
            'xi-api-key': this.apiKey
          },
          timeout: 10000
        }
      );

      return {
        success: true,
        voices: response.data.voices || []
      };
    } catch (error) {
      logger.error('Error fetching voices:', { error: error.message });
      return {
        success: false,
        voices: []
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
}

// Export singleton instance
export const voiceGuide = new VoiceGuideService();
export default VoiceGuideService;
