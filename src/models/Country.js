import config from '../config/env.js';
import { logger } from '../config/logger.js';
import { COUNTRIES_LIST, findCountry, searchCountries } from '../utils/countries-list.js';

const { pool } = await import('../database/connection.js');

let useInMemoryDB = false;

// In-memory database for when PostgreSQL is not available
const inMemoryDB = {
  countries: [],
  visitedCountries: new Set(),
};

/**
 * Initialize database - try real DB first, fallback to in-memory
 */
export async function initializeDatabase() {
  try {
    const testResult = await pool.query('SELECT NOW()');
    logger.info('Connected to PostgreSQL database');
    useInMemoryDB = false;
    return true;
  } catch (error) {
    logger.warn('PostgreSQL not available, using in-memory database (development mode)');
    logger.warn('For production, please set up PostgreSQL properly');
    useInMemoryDB = true;
    loadSampleCountries();
    return false;
  }
}

/**
 * Load all countries for in-memory DB
 */
function loadSampleCountries() {
  inMemoryDB.countries = COUNTRIES_LIST.map(c => ({
    country_code: c.code,
    country_name: c.name,
  }));
}

export class CountryModel {
  /**
   * Get all visited country codes
   */
  static async getVisitedCountries() {
    try {
      if (useInMemoryDB) {
        return Array.from(inMemoryDB.visitedCountries).sort();
      }

      const result = await pool.query(
        'SELECT country_code FROM visited_countries ORDER BY country_code'
      );
      return result.rows.map((row) => row.country_code);
    } catch (error) {
      logger.error('Error fetching visited countries', { error: error.message });
      throw error;
    }
  }

  /**
   * Get visited countries with full details
   */
  static async getVisitedCountriesDetails() {
    try {
      if (useInMemoryDB) {
        return Array.from(inMemoryDB.visitedCountries)
          .map(code => inMemoryDB.countries.find(c => c.country_code === code))
          .filter(Boolean)
          .sort((a, b) => a.country_name.localeCompare(b.country_name));
      }

      const result = await pool.query(`
        SELECT c.country_code, c.country_name
        FROM countries c
        INNER JOIN visited_countries vc ON c.country_code = vc.country_code
        ORDER BY c.country_name
      `);
      return result.rows;
    } catch (error) {
      logger.error('Error fetching visited countries details', { error: error.message });
      throw error;
    }
  }

  /**
   * Add a visited country
   */
  static async addVisitedCountry(countryCode) {
    try {
      const code = countryCode.trim().toUpperCase();

      if (useInMemoryDB) {
        const exists = inMemoryDB.countries.find(c => c.country_code === code);
        if (!exists) {
          const error = new Error('Country not found');
          error.statusCode = 400;
          throw error;
        }

        if (inMemoryDB.visitedCountries.has(code)) {
          const error = new Error('Country already visited');
          error.statusCode = 409;
          throw error;
        }

        inMemoryDB.visitedCountries.add(code);
        logger.info('Country added to visited list (in-memory)', { countryCode: code });
        return { country_code: code };
      }

      // PostgreSQL path
      const countryExists = await pool.query(
        'SELECT country_code FROM countries WHERE UPPER(country_code) = UPPER($1)',
        [code]
      );

      if (countryExists.rows.length === 0) {
        const error = new Error('Country not found');
        error.statusCode = 400;
        throw error;
      }

      const result = await pool.query(
        'INSERT INTO visited_countries (country_code) VALUES (UPPER($1)) ON CONFLICT DO NOTHING RETURNING country_code',
        [code]
      );

      logger.info('Country added to visited list', { countryCode: code });
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      if (error.code === '23505') {
        logger.warn('Country already visited', { countryCode });
        const conflictError = new Error('Country already visited');
        conflictError.statusCode = 409;
        throw conflictError;
      }
      logger.error('Error adding visited country', { error: error.message, countryCode });
      throw error;
    }
  }

  /**
   * Find country by name and return the country code
   * Supports fuzzy matching
   */
  static findCountryCodeByName(countryName) {
    try {
      if (!countryName || !countryName.trim()) {
        const error = new Error('Country name is required');
        error.statusCode = 400;
        throw error;
      }

      const country = findCountry(countryName);
      if (!country) {
        const error = new Error('Country not found');
        error.statusCode = 400;
        throw error;
      }

      return country.code;
    } catch (error) {
      logger.error('Error finding country by name', { error: error.message, countryName });
      throw error;
    }
  }

  /**
   * Remove a visited country
   */
  static async removeVisitedCountry(countryCode) {
    try {
      const code = countryCode.trim().toUpperCase();

      if (useInMemoryDB) {
        if (inMemoryDB.visitedCountries.has(code)) {
          inMemoryDB.visitedCountries.delete(code);
          logger.info('Country removed from visited list (in-memory)', { countryCode: code });
          return true;
        }
        return false;
      }

      const result = await pool.query(
        'DELETE FROM visited_countries WHERE UPPER(country_code) = UPPER($1) RETURNING country_code',
        [code]
      );

      if (result.rows.length > 0) {
        logger.info('Country removed from visited list', { countryCode: code });
      }

      return result.rows.length > 0;
    } catch (error) {
      logger.error('Error removing visited country', { error: error.message, countryCode });
      throw error;
    }
  }

  /**
   * Search countries by name (fuzzy search)
   */
  static async searchCountries(searchTerm) {
    try {
      const term = searchTerm.toLowerCase();

      if (useInMemoryDB) {
        return inMemoryDB.countries
          .filter(c => c.country_name.toLowerCase().includes(term))
          .slice(0, 10);
      }

      const result = await pool.query(
        `SELECT country_code, country_name 
         FROM countries 
         WHERE LOWER(country_name) LIKE LOWER($1) 
         ORDER BY country_name 
         LIMIT 10`,
        [`%${searchTerm}%`]
      );
      return result.rows;
    } catch (error) {
      logger.error('Error searching countries', { error: error.message, searchTerm });
      throw error;
    }
  }

  /**
   * Get country count statistics
   */
  static async getStatistics() {
    try {
      if (useInMemoryDB) {
        return {
          total_countries: inMemoryDB.countries.length,
          visited_countries: inMemoryDB.visitedCountries.size,
        };
      }

      const result = await pool.query(`
        SELECT 
          (SELECT COUNT(*) FROM countries) as total_countries,
          (SELECT COUNT(*) FROM visited_countries) as visited_countries
      `);
      return result.rows[0];
    } catch (error) {
      logger.error('Error fetching statistics', { error: error.message });
      throw error;
    }
  }
}

export function isUsingInMemoryDB() {
  return useInMemoryDB;
}

export default CountryModel;
