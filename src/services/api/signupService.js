import { createResource } from './baseService';

/**
 * Register a new user
 */
export const registerUser = async (userData) => {
  return createResource('/api/auth/signup', userData);
};
