import { LOG_CONFIG } from '../services/config/googleMapsConfig';

/**
 * Centralized logging utility
 */
export const logger = {
  /**
   * Log API calls
   * @param {string} service - Service name
   * @param {string} message - Log message
   * @param {any} data - Additional data to log
   */
  api: (service, message, data = null) => {
    if (LOG_CONFIG.enableApiLogs) {
      console.log(`[${service.toUpperCase()} API] ${message}`, data || '');
    }
  },

  /**
   * Log debug information
   * @param {string} service - Service name
   * @param {string} message - Log message
   * @param {any} data - Additional data to log
   */
  debug: (service, message, data = null) => {
    if (LOG_CONFIG.enableDebugLogs) {
      console.log(`[${service.toUpperCase()}] ${message}`, data || '');
    }
  },

  /**
   * Log errors
   * @param {string} service - Service name
   * @param {string} message - Error message
   * @param {any} error - Error object or data
   */
  error: (service, message, error = null) => {
    console.error(`[${service.toUpperCase()} ERROR] ${message}`, error || '');
  },

  /**
   * Log warnings
   * @param {string} service - Service name
   * @param {string} message - Warning message
   * @param {any} data - Additional data to log
   */
  warn: (service, message, data = null) => {
    console.warn(`[${service.toUpperCase()} WARNING] ${message}`, data || '');
  },

  /**
   * Log info messages
   * @param {string} service - Service name
   * @param {string} message - Info message
   * @param {any} data - Additional data to log
   */
  info: (service, message, data = null) => {
    console.log(`[${service.toUpperCase()}] ${message}`, data || '');
  }
};

/**
 * Service-specific loggers
 */
export const geocodingLogger = {
  api: (message, data) => logger.api('GEOCODING', message, data),
  debug: (message, data) => logger.debug('GEOCODING', message, data),
  error: (message, error) => logger.error('GEOCODING', message, error),
  warn: (message, data) => logger.warn('GEOCODING', message, data),
  info: (message, data) => logger.info('GEOCODING', message, data)
};

export const distanceLogger = {
  api: (message, data) => logger.api('DISTANCE', message, data),
  debug: (message, data) => logger.debug('DISTANCE', message, data),
  error: (message, error) => logger.error('DISTANCE', message, error),
  warn: (message, data) => logger.warn('DISTANCE', message, data),
  info: (message, data) => logger.info('DISTANCE', message, data)
};

export const pricingLogger = {
  api: (message, data) => logger.api('PRICING', message, data),
  debug: (message, data) => logger.debug('PRICING', message, data),
  error: (message, error) => logger.error('PRICING', message, error),
  warn: (message, data) => logger.warn('PRICING', message, data),
  info: (message, data) => logger.info('PRICING', message, data)
};

export const contextLogger = {
  api: (message, data) => logger.api('CONTEXT', message, data),
  debug: (message, data) => logger.debug('CONTEXT', message, data),
  error: (message, error) => logger.error('CONTEXT', message, error),
  warn: (message, data) => logger.warn('CONTEXT', message, data),
  info: (message, data) => logger.info('CONTEXT', message, data)
};
