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
interface NormalizableResponse {
  [key: string]: unknown;
  data?: unknown;
  users?: unknown;
  user?: unknown;
}

export const normalizeResponse = (response: unknown, key?: string): unknown => {
  if (!response) return null;

  // Handle null/undefined response
  if (response === null || response === undefined) {
    return null;
  }

  const resp = response as NormalizableResponse;

  // Handle direct data property
  if (resp.data !== undefined) {
    return resp.data;
  }

  // Handle users/user variation (common in auth endpoints)
  if (resp.users !== undefined) {
    return resp.users;
  }

  if (resp.user !== undefined) {
    return resp.user;
  }

  // Handle specific key extraction
  if (key && resp[key] !== undefined) {
    return resp[key];
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
    if (resp[commonKey] !== undefined) {
      return resp[commonKey];
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
interface SuccessResponse {
  success?: boolean;
  status?: number;
  error?: unknown;
  message?: string;
}

export const isSuccess = (response: unknown): boolean => {
  if (!response) return false;

  const resp = response as SuccessResponse;

  // Explicit success flag
  if (resp.success !== undefined) {
    return resp.success === true;
  }

  // HTTP status-like success
  if (resp.status !== undefined) {
    return resp.status >= 200 && resp.status < 300;
  }

  // Default: assume success if no error and has data
  if (resp.error || resp.message?.toLowerCase().includes('error')) {
    return false;
  }

  return true;
};

/**
 * Extracts error message from response
 * @param {Object} response - Raw API response
 * @returns {string} Error message or null
 */
interface ErrorResponse {
  error?: string | { message?: string };
  message?: string;
  details?: string | unknown;
  errors?: Array<{ msg?: string; message?: string }> | string;
}

export const getErrorMessage = (response: unknown): string | null => {
  if (!response) return 'An unknown error occurred';

  const resp = response as ErrorResponse;

  // Direct error field
  if (resp.error) {
    return typeof resp.error === 'string' ? resp.error : resp.error.message || 'An error occurred';
  }

  // Message field
  if (resp.message) {
    return resp.message;
  }

  // Error details
  if (resp.details) {
    return typeof resp.details === 'string' ? resp.details : JSON.stringify(resp.details);
  }

  // Validation errors
  if (resp.errors) {
    if (Array.isArray(resp.errors)) {
      return resp.errors.map((e) => e.msg || e.message).join(', ');
    }
    if (typeof resp.errors === 'string') {
      return resp.errors;
    }
  }

  return null;
};

/**
 * Paginated response handler
 * @param {Object} response - Raw API response
 * @returns {Object} { data, pagination } or { data: null, pagination: null }
 */
interface PaginatedResponse {
  page?: number;
  currentPage?: number;
  limit?: number;
  pageSize?: number;
  perPage?: number;
  total?: number;
  totalCount?: number;
  count?: number;
  totalPages?: number;
}

export const handlePaginatedResponse = (response: unknown) => {
  const data = normalizeResponse(response);
  const resp = response as PaginatedResponse;

  if (!data || !Array.isArray(data)) {
    return { data: null, pagination: null };
  }

  const pagination = {
    page: resp.page || resp.currentPage || 1,
    limit: resp.limit || resp.pageSize || resp.perPage || 20,
    total: resp.total || resp.totalCount || resp.count || data.length,
    totalPages: resp.totalPages || Math.ceil((resp.total || data.length) / (resp.limit || 20)),
  };

  return { data, pagination };
};

interface ApiResponse {
  [key: string]: unknown;
}

interface WrapApiCallOptions {
  silent?: boolean;
  onError?: (message: string) => void;
}

interface ApiCallResult<T> {
  success: boolean;
  data: T | null;
  error?: string | null;
  raw?: unknown;
}

/**
 * Wraps API call with consistent error handling
 * @param {Promise<*>} apiCall - API call promise
 * @param {Object} options - Options
 * @param {boolean} [options.silent] - Suppress error toasts
 * @param {Function} [options.onError] - Custom error handler
 * @returns {Promise<{success: boolean, data: any, error: string|null}>}
 */
export const wrapApiCall = async <T = unknown>(
  apiCall: Promise<ApiResponse>,
  options: WrapApiCallOptions = {}
): Promise<ApiCallResult<T>> => {
  const { silent = false, onError } = options;

  try {
    const response = await apiCall;

    return {
      success: true,
      data: normalizeResponse(response) as T,
      raw: response,
    };
  } catch (error) {
    const errorMessage =
      getErrorMessage(error) || (error instanceof Error ? error.message : 'API request failed');

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
export const mapResponse = <T, R>(response: unknown, mapper: (item: T) => R, key?: string): R[] => {
  const data = normalizeResponse(response, key);

  if (!data) return [];

  if (Array.isArray(data)) {
    return data.map(mapper);
  }

  if (typeof data === 'object') {
    return [mapper(data as T)];
  }

  return [];
};
