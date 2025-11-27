import React, { createContext, useContext, useState, useEffect } from 'react';
import { isAuthenticated, getUserData, clearTokens, storeTokens, getAccessToken, getRefreshToken } from '../services/auth/tokenManager';
import { logoutUser, getUserProfile } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check authentication status on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authenticated = await isAuthenticated();
      if (authenticated) {
        // Fetch fresh profile from API
        await refreshProfile();
      } else {
        // Clear state if not authenticated
        setUser(null);
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      // On error, assume not authenticated
      setUser(null);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async (updatedUserData = null) => {
    try {
      // If updated user data is provided (from update API responses), use it directly
      if (updatedUserData) {
        setUser(updatedUserData);
        setIsLoggedIn(true);
        // Update stored user data
        const accessToken = await getAccessToken();
        const refreshToken = await getRefreshToken();
        if (accessToken && refreshToken) {
          await storeTokens(accessToken, refreshToken, updatedUserData);
        }
        return updatedUserData;
      }

      // Try to fetch from API (may return 404 if endpoint doesn't exist)
      const profileResult = await getUserProfile();
      if (profileResult.success && profileResult.data) {
        const userData = profileResult.data;
        setUser(userData);
        setIsLoggedIn(true);
        // Update stored user data
        const accessToken = await getAccessToken();
        const refreshToken = await getRefreshToken();
        if (accessToken && refreshToken) {
          await storeTokens(accessToken, refreshToken, userData);
        }
        return userData;
      } else {
        // Fallback to stored user data if API fails (including 404)
        console.log('⚠️ Profile API not available, using stored user data');
        const userData = await getUserData();
        if (userData) {
          setUser(userData);
          setIsLoggedIn(true);
        } else {
          setUser(null);
          setIsLoggedIn(false);
        }
        return userData;
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
      // Fallback to stored user data
      const userData = await getUserData();
      if (userData) {
        setUser(userData);
        setIsLoggedIn(true);
      }
      return userData;
    }
  };

  const login = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
  };

  const logout = async () => {
    try {
      // Call logout API
      await logoutUser();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  const value = {
    user,
    isLoggedIn,
    isLoading,
    login,
    logout,
    checkAuthStatus,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
