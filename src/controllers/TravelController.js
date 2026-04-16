import CountryModel from '../models/Country.js';
import { logger } from '../config/logger.js';

export class TravelController {
  /**
   * Render home page with visited countries
   */
  static async getHome(req, res, next) {
    try {
      const countries = await CountryModel.getVisitedCountries();
      const stats = await CountryModel.getStatistics();

      res.status(200).render('index', {
        countries,
        total: countries.length,
        totalCountries: stats.total_countries,
        formError: null,
        inputError: false,
        dbOffline: false,
        session: req.session,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add a visited country
   */
  static async addCountry(req, res, next) {
    try {
      const { country } = req.body;

      if (!country || !country.trim()) {
        return res.status(200).render('index', {
          countries: await CountryModel.getVisitedCountries(),
          total: await CountryModel.getVisitedCountries().then((c) => c.length),
          inputError: true,
          formError: 'Please enter a country name',
          dbOffline: false,
          session: req.session,
        });
      }

      // Find the country code by name
      const countryCode = CountryModel.findCountryCodeByName(country);
      await CountryModel.addVisitedCountry(countryCode);

      // Redirect to home to refresh the list
      res.redirect('/');
    } catch (error) {
      if (error.statusCode === 400) {
        const countries = await CountryModel.getVisitedCountries();
        return res.status(200).render('index', {
          countries,
          total: countries.length,
          inputError: true,
          formError: 'Country not found. Please check the spelling.',
          dbOffline: false,
          session: req.session,
        });
      }

      if (error.statusCode === 409) {
        // Already visited
        res.redirect('/');
        return;
      }

      next(error);
    }
  }

  /**
   * Delete a visited country
   */
  static async deleteCountry(req, res, next) {
    try {
      const { countryCode } = req.params;

      if (!countryCode || !countryCode.trim()) {
        return res.status(400).json({ error: 'Country code is required' });
      }

      const deleted = await CountryModel.removeVisitedCountry(countryCode);

      if (!deleted) {
        return res.status(404).json({ error: 'Country not found in visited list' });
      }

      res.status(200).json({ success: true, countryCode });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search countries
   */
  static async searchCountries(req, res, next) {
    try {
      const { query } = req.query;

      if (!query || !query.trim()) {
        return res.status(200).json([]);
      }

      const results = await CountryModel.searchCountries(query);
      res.status(200).json(results);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Health check endpoint
   */
  static getHealth(req, res) {
    res.status(200).json({
      status: 'ok',
      service: 'travel-tracker',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Get statistics
   */
  static async getStatistics(req, res, next) {
    try {
      const stats = await CountryModel.getStatistics();
      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  }
}

export default TravelController;
