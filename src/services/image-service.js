/**
 * Tourism Image Service
 * Fetches tourism images from Unsplash API
 */

import axios from 'axios';
import { logger } from '../config/logger.js';

class TourismImageService {
  constructor() {
    this.apiKey = process.env.UNSPLASH_API_KEY;
    this.apiUrl = 'https://api.unsplash.com';
    this.imageCache = new Map();
  }

  /**
   * Get images for a country or attraction
   */
  async getCountryImages(countryName, count = 5) {
    try {
      const cacheKey = `${countryName}_${count}`;
      
      // Check cache
      if (this.imageCache.has(cacheKey)) {
        logger.info('Returning cached images', { country: countryName });
        return {
          success: true,
          images: this.imageCache.get(cacheKey),
          cached: true
        };
      }

      const response = await axios.get(
        `${this.apiUrl}/search/photos`,
        {
          params: {
            query: `${countryName} tourism travel`,
            per_page: count,
            orientation: 'landscape'
          },
          headers: { Authorization: `Client-ID ${this.apiKey}` }
        }
      );

      const images = response.data.results.map(photo => ({
        id: photo.id,
        url: photo.urls.regular,
        thumbUrl: photo.urls.thumb,
        alt: photo.alt_description || 'Tourism image',
        photographer: photo.user.name,
        photographerUrl: photo.user.links.html,
        description: photo.description || ''
      }));

      // Cache the results
      this.imageCache.set(cacheKey, images);

      logger.info('Images fetched from Unsplash', { country: countryName, count: images.length });

      return {
        success: true,
        images: images
      };
    } catch (error) {
      logger.error('Error fetching country images', { error: error.message });
      
      // Return placeholder images if API fails
      return this.getPlaceholderImages(countryName);
    }
  }

  /**
   * Get images for a specific attraction
   */
  async getAttractionImages(attractionName, countryName, count = 3) {
    try {
      const cacheKey = `${attractionName}_${countryName}_${count}`;

      if (this.imageCache.has(cacheKey)) {
        return {
          success: true,
          images: this.imageCache.get(cacheKey),
          cached: true
        };
      }

      const response = await axios.get(
        `${this.apiUrl}/search/photos`,
        {
          params: {
            query: `${attractionName} ${countryName}`,
            per_page: count,
            orientation: 'landscape'
          },
          headers: { Authorization: `Client-ID ${this.apiKey}` }
        }
      );

      const images = response.data.results.map(photo => ({
        id: photo.id,
        url: photo.urls.regular,
        thumbUrl: photo.urls.thumb,
        alt: photo.alt_description || 'Attraction image',
        photographer: photo.user.name,
        photographerUrl: photo.user.links.html
      }));

      this.imageCache.set(cacheKey, images);

      logger.info('Attraction images fetched', { attraction: attractionName });

      return {
        success: true,
        images: images
      };
    } catch (error) {
      logger.error('Error fetching attraction images', { error: error.message });
      return this.getPlaceholderImages(`${attractionName} ${countryName}`);
    }
  }

  /**
   * Get placeholder images when API fails
   */
  getPlaceholderImages(query) {
    const placeholders = [
      {
        id: 'placeholder_1',
        url: `https://via.placeholder.com/1200x800?text=${encodeURIComponent(query)}`,
        thumbUrl: `https://via.placeholder.com/300x200?text=${encodeURIComponent(query)}`,
        alt: query,
        photographer: 'Placeholder',
        description: 'Placeholder image'
      },
      {
        id: 'placeholder_2',
        url: `https://via.placeholder.com/1200x800?text=Travel+${encodeURIComponent(query)}`,
        thumbUrl: `https://via.placeholder.com/300x200?text=Travel`,
        alt: `Travel - ${query}`,
        photographer: 'Placeholder',
        description: 'Placeholder image'
      },
      {
        id: 'placeholder_3',
        url: `https://via.placeholder.com/1200x800?text=Explore`,
        thumbUrl: `https://via.placeholder.com/300x200?text=Explore`,
        alt: 'Explore',
        photographer: 'Placeholder',
        description: 'Placeholder image'
      }
    ];

    return {
      success: true,
      images: placeholders,
      isPlaceholder: true
    };
  }

  /**
   * Search for travel-related images
   */
  async searchTravelImages(query, count = 10) {
    try {
      const cacheKey = `search_${query}_${count}`;

      if (this.imageCache.has(cacheKey)) {
        return {
          success: true,
          images: this.imageCache.get(cacheKey),
          cached: true
        };
      }

      const response = await axios.get(
        `${this.apiUrl}/search/photos`,
        {
          params: {
            query: query,
            per_page: count,
            orientation: 'landscape'
          },
          headers: { Authorization: `Client-ID ${this.apiKey}` }
        }
      );

      const images = response.data.results.map(photo => ({
        id: photo.id,
        url: photo.urls.regular,
        thumbUrl: photo.urls.thumb,
        alt: photo.alt_description || query,
        photographer: photo.user.name,
        photographerUrl: photo.user.links.html
      }));

      this.imageCache.set(cacheKey, images);

      logger.info('Travel images searched', { query, count: images.length });

      return {
        success: true,
        images: images
      };
    } catch (error) {
      logger.error('Error searching travel images', { error: error.message });
      return this.getPlaceholderImages(query);
    }
  }

  /**
   * Get images for featured destinations
   */
  async getFeaturedDestinations() {
    try {
      const destinations = ['Paris', 'Tokyo', 'India', 'Brazil', 'Australia'];
      const results = {};

      for (const destination of destinations) {
        const images = await this.getCountryImages(destination, 2);
        results[destination] = images.images;
      }

      return {
        success: true,
        destinations: results
      };
    } catch (error) {
      logger.error('Error fetching featured destinations', { error: error.message });
      return {
        success: false,
        error: 'Could not fetch featured destinations'
      };
    }
  }

  /**
   * Get seasonal travel images
   */
  async getSeasonalImages(season = 'spring') {
    try {
      const seasonalQueries = {
        spring: 'spring travel flowers',
        summer: 'summer beach vacation',
        autumn: 'autumn leaves travel',
        winter: 'winter snow vacation'
      };

      const query = seasonalQueries[season] || seasonalQueries.spring;
      return this.searchTravelImages(query, 6);
    } catch (error) {
      logger.error('Error fetching seasonal images', { error: error.message });
      return {
        success: false,
        error: 'Could not fetch seasonal images'
      };
    }
  }

  /**
   * Clear image cache
   */
  clearCache() {
    this.imageCache.clear();
    return { success: true, message: 'Image cache cleared' };
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      cacheSize: this.imageCache.size,
      cachedQueries: Array.from(this.imageCache.keys()).slice(0, 10)
    };
  }
}

export const imageService = new TourismImageService();
export default TourismImageService;
