/**
 * Response Normalizer
 * Standardizes API responses across all endpoints
 * Handles variations in response structure ({data}, {users}, {user}, direct arrays)
 */

/**
 * Normalizes API response data
 * @param {Object|Array} response - Raw API response
 * @param {string} [key] - Optional key to extract from response
 * @returns {any} Normalized data
 */
export const normalizeResponse = (response, key) => {
  if (!response) return null;

  // Handle null/undefined response
  if (response === null || response === undefined) {
    return null;
  }

  // Handle direct data property
  if (response.data !== undefined) {
    return response.data;
  }

  // Handle users/user variation (common in auth endpoints)
  if (response.users !== undefined) {
    return response.users;
  }

  if (response.user !== undefined) {
    return response.user;
  }

  // Handle specific key extraction
  if (key && response[key] !== undefined) {
    return response[key];
  }

  // Handle common variations
  const commonKeys = [
    'items',
    'results',
    'records',
    'list',
    'collection',
    'medicines',
    'sales',
    'staff',
    'branches',
    'pharmacies',
    'managers',
  ];

  for (const commonKey of commonKeys) {
    if (response[commonKey] !== undefined) {
      return response[commonKey];
    }
  }

  // Return response itself if it's an array
  if (Array.isArray(response)) {
    return response;
  }

  // Return the entire response if no specific structure found
  return response;
};

/**
 * Extracts success status from response
 * @param {Object} response - Raw API response
 * @returns {boolean} Success status
 */
export const isSuccess = (response) => {
  if (!response) return false;
  
  // Explicit success flag
  if (response.success !== undefined) {
    return response.success === true;
  }

  // HTTP status-like success
  if (response.status !== undefined) {
    return response.status >= 200 && response.status < 300;
  }

  // Default: assume success if no error and has data
  if (response.error || response.message?.toLowerCase().includes('error')) {
    return false;
  }

  return true;
};

/**
 * Extracts error message from response
 * @param {Object} response - Raw API response
 * @returns {string} Error message or null
 */
export const getErrorMessage = (response) => {
  if (!response) return 'An unknown error occurred';

  // Direct error field
  if (response.error) {
    return typeof response.error === 'string' ? response.error : response.error.message;
  }

  // Message field
  if (response.message) {
    return response.message;
  }

  // Error details
  if (response.details) {
    return typeof response.details === 'string' ? response.details : JSON.stringify(response.details);
  }

  // Validation errors
  if (response.errors) {
    if (Array.isArray(response.errors)) {
      return response.errors.map(e => e.msg || e.message).join(', ');
    }
    if (typeof response.errors === 'string') {
      return response.errors;
    }
  }

  return null;
};

/**
 * Paginated response handler
 * @param {Object} response - Raw API response
 * @returns {Object} { data, pagination } or { data: null, pagination: null }
 */
export const handlePaginatedResponse = (response) => {
  const data = normalizeResponse(response);

  if (!data || !Array.isArray(data)) {
    return { data: null, pagination: null };
  }

  const pagination = {
    page: response.page || response.currentPage || 1,
    limit: response.limit || response.pageSize || response.perPage || 20,
    total: response.total || response.totalCount || response.count || data.length,
    totalPages: response.totalPages || Math.ceil((response.total || data.length) / (response.limit || 20)),
  };

  return { data, pagination };
};

/**
 * Wraps API call with consistent error handling
 * @param {Promise<*>} apiCall - API call promise
 * @param {Object} options - Options
 * @param {boolean} [options.silent] - Suppress error toasts
 * @param {Function} [options.onError] - Custom error handler
 * @returns {Promise<{success: boolean, data: any, error: string|null}>}
 */
export const wrapApiCall = async (apiCall, options = {}) => {
  const { silent = false, onError } = options;

  try {
    const response = await apiCall;

    return {
      success: true,
      data: normalizeResponse(response),
      raw: response,
    };
  } catch (error) {
    const errorMessage = getErrorMessage(error) || error.message || 'API request failed';

    if (onError) {
      onError(errorMessage);
    }

    if (!silent) {
      console.error('API Error:', errorMessage, error);
    }

    return {
      success: false,
      data: null,
      error: errorMessage,
      raw: error,
    };
  }
};

/**
 * Transform response with mapping function
 * @param {Object|Array} response - Raw API response
 * @param {Function} mapper - Mapping function
 * @param {string} [key] - Optional key to extract
 * @returns {Array} Mapped array
 */
export const mapResponse = (response, mapper, key) => {
  const data = normalizeResponse(response, key);

  if (!data) return [];

  if (Array.isArray(data)) {
    return data.map(mapper);
  }

  if (typeof data === 'object') {
    return [mapper(data)];
  }

  return [];
};
