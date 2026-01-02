import { getToken, removeToken } from '../auth/authUtils';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Custom error class to carry status and message
export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

/**
 * Centralized HTTP client
 * - Attaches JWT automatically
 * - Handles response parsing (JSON or text)
 * - Throws ApiError with status for error handling
 */
const httpClient = {
  /**
   * Make an HTTP request
   * @param {string} endpoint - API endpoint (e.g., '/api/notes')
   * @param {object} options - Fetch options
   * @param {boolean} expectText - If true, expect text/plain response
   * @returns {Promise<any>} Parsed response data
   */
  async request(endpoint, options = {}, expectText = false) {
    const token = getToken();

    const headers = {
      ...options.headers
    };

    // Add Content-Type for requests with body
    if (options.body && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    // Add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    // Handle 401 - Force logout
    if (response.status === 401) {
      removeToken();
      // The error will be caught and handled by the caller
      throw new ApiError(401, 'Session expired. Please log in again.');
    }

    // Handle error responses
    if (!response.ok) {
      let errorMessage;
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        // Handle field-based validation errors or message
        errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
      } else {
        errorMessage = await response.text();
      }

      throw new ApiError(response.status, errorMessage || `Request failed with status ${response.status}`);
    }

    // Handle successful responses
    if (response.status === 204) {
      return null; // No content
    }

    const contentType = response.headers.get('content-type');

    if (expectText || (contentType && contentType.includes('text/plain'))) {
      return response.text();
    }

    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }

    // Default to text
    return response.text();
  },

  // Convenience methods
  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  post(endpoint, data, expectText = false) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    }, expectText);
  },

  put(endpoint, data, expectText = false) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    }, expectText);
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
};

export default httpClient;

