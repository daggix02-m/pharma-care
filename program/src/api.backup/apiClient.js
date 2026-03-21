import logger from '@/utils/logger';

// Base URL for backend API
// Uses environment variable from .env.development or .env.production
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://pharmacare-api.onrender.com/api';

// Environment configuration
const ENV_CONFIG = {
  API_BASE_URL,
  ENABLE_DEBUG: import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEBUG === 'true',
  TOKEN_EXPIRY_MINUTES: parseInt(import.meta.env.VITE_TOKEN_EXPIRY_MINUTES) || 60,
  SESSION_TIMEOUT_MINUTES: parseInt(import.meta.env.VITE_SESSION_TIMEOUT_MINUTES) || 120,
  MAX_FILE_SIZE_MB: parseInt(import.meta.env.VITE_MAX_FILE_SIZE_MB) || 10,
  ALLOWED_FILE_TYPES: import.meta.env.VITE_ALLOWED_FILE_TYPES || '.xlsx,.xls,.csv',
  DEFAULT_PAGE_SIZE: parseInt(import.meta.env.VITE_DEFAULT_PAGE_SIZE) || 20,
  MAX_PAGE_SIZE: parseInt(import.meta.env.VITE_MAX_PAGE_SIZE) || 100,
};

export { ENV_CONFIG };

// Check if localStorage is available and working
const isStorageAvailable = () => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};

// Generic helper to add a timeout to fetch calls so the UI
// doesn't stay in a loading state forever if the backend
// is unreachable or very slow.
const fetchWithTimeout = (url, options = {}, timeoutMs = 60000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(id));
};

// CSRF token helper
const getCsrfToken = () => {
  return null;
};

export const getToken = (key) => {
  if (isStorageAvailable()) {
    return localStorage.getItem(key);
  } else {
    try {
      return sessionStorage.getItem(key);
    } catch (e) {
      logger.error('Storage access failure');
      return null;
    }
  }
};

export const setToken = (key, value) => {
  if (isStorageAvailable()) {
    localStorage.setItem(key, value);
    if (key === 'auth_token') {
      localStorage.setItem('token_timestamp', Date.now().toString());
    }
  } else {
    try {
      sessionStorage.setItem(key, value);
      if (key === 'auth_token') {
        sessionStorage.setItem('token_timestamp', Date.now().toString());
      }
    } catch (e) {
      logger.error('Storage modification failure');
    }
  }
};

export const removeToken = (key) => {
  if (isStorageAvailable()) {
    localStorage.removeItem(key);
    if (key === 'auth_token') {
      localStorage.removeItem('token_timestamp');
    }
  } else {
    try {
      sessionStorage.removeItem(key);
      if (key === 'auth_token') {
        sessionStorage.removeItem('token_timestamp');
      }
    } catch (e) {
      logger.error('Storage modification failure');
    }
  }
};

export const isTokenExpired = () => {
  const tokenTimestamp = getToken('token_timestamp');
  if (!tokenTimestamp) return true;
  
  const expiryMinutes = ENV_CONFIG.TOKEN_EXPIRY_MINUTES;
  const now = Date.now();
  const tokenAge = (now - parseInt(tokenTimestamp)) / 1000 / 60;
  
  return tokenAge > expiryMinutes;
};

export const apiClient = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  // Check token expiry before making request
  const isAuthEndpoint = endpoint === '/auth/login' ||
                         endpoint === '/auth/register' ||
                         endpoint.includes('/login') ||
                         endpoint.includes('/register') ||
                         endpoint.includes('/verify-email') ||
                         endpoint.includes('/forgot-password') ||
                         endpoint.includes('/reset-password') ||
                         endpoint.includes('/resend-verification') ||
                         endpoint === '/admin/pharmacies' ||
                         endpoint.includes('/debug/account-status');
  
  if (!isAuthEndpoint && isTokenExpired()) {
    const storageAvailable = isStorageAvailable();
    if (storageAvailable) {
      removeToken('auth_token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('roleId');
      localStorage.removeItem('pharmacyName');
    }
    if (typeof window !== 'undefined' && window.location.pathname !== '/auth/login') {
      window.location.href = '/auth/login';
    }
    throw new Error('Session expired. Please login again.');
  }

  const storageAvailable = isStorageAvailable();
  const currentToken = storageAvailable ? localStorage.getItem('auth_token') : null;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(currentToken && { Authorization: `Bearer ${currentToken}` }),
      ...(getCsrfToken() && { 'X-CSRF-Token': getCsrfToken() }),
      ...options.headers,
    },
    ...options,
  };

  if (ENV_CONFIG.ENABLE_DEBUG) {
    logger.api(config.method || 'GET', url);
  }

  try {
    let response = await fetchWithTimeout(url, config, options.timeout || 60000);

    if (response.status === 401) {
      if (endpoint === '/auth/login' || endpoint.includes('/login')) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Invalid credentials');
      }

      // Don't redirect to login if user is on the signup page
      const isOnSignupPage = typeof window !== 'undefined' && window.location.pathname === '/auth/signup';

      if (isOnSignupPage || isAuthEndpoint) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Authentication required');
      }

      if (storageAvailable) {
        removeToken('auth_token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('roleId');
        localStorage.removeItem('pharmacyName');
      }

      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        if (path !== '/auth/login' && path !== '/') {
          window.location.href = '/auth/login';
        }
      }

      throw new Error('Session expired. Please login again.');
    }

    if (!response.ok) {
      const errorText = await response.text();
      if (!options.silent) {
        logger.error(`API Error (${response.status})`);
      }
      let errorData = {};
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        // If errorText is not valid JSON, errorData remains empty object
      }
      const errorMessage = errorData.message || errorData.error || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw error;
  }
};

export const makeApiCall = async (endpoint, options = {}) => {
  try {
    const response = await apiClient(endpoint, options);
    if (Array.isArray(response)) {
      return { success: true, data: response };
    }
    return { success: true, ...response };
  } catch (error) {
    return { success: false, message: error.message || 'An error occurred' };
  }
};

export const getAccessToken = () => {
  return getToken('auth_token');
};

export const isAuthenticated = () => {
  return !!getToken('auth_token');
};
