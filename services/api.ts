import { API_URL } from '../constants/config';

let authToken: string | null = null;

// Helper function to create fetch with timeout
// 60 seconds timeout to allow Render.com free tier to wake up from sleep
const fetchWithTimeout = (url: string, options: RequestInit = {}, timeout = 60000) => {
  return Promise.race([
    fetch(url, options),
    new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error('TIMEOUT')), timeout)
    )
  ]);
};

// Custom error class for better error handling
export class ApiError extends Error {
  constructor(
    message: string,
    public type: 'NETWORK' | 'TIMEOUT' | 'SERVER' | 'CLIENT' | 'UNKNOWN',
    public statusCode?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const api = {
  setToken: (token: string | null) => {
    authToken = token;
  },
  get: async (endpoint: string) => {
    try {
      const headers: HeadersInit = {};
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetchWithTimeout(`${API_URL}${endpoint}`, {
        headers,
      });
      
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
            const errorBody = await response.text();
            console.log('API Error Response Body:', errorBody);
            
            // Try to parse JSON to get a cleaner message if possible
            try {
                const errorJson = JSON.parse(errorBody);
                if (errorJson.message) {
                    errorMessage = typeof errorJson.message === 'string' 
                        ? errorJson.message 
                        : JSON.stringify(errorJson.message);
                } else {
                    errorMessage = JSON.stringify(errorJson);
                }
            } catch (jsonError) {
                // If not JSON, use the raw text if available
                 if (errorBody && errorBody.trim().length > 0) {
                    errorMessage = errorBody;
                 }
            }
        } catch (readError) {
            console.warn('Could not read error response body:', readError);
        }

        const errorType = response.status >= 500 ? 'SERVER' : 'CLIENT';
        throw new ApiError(
          errorMessage,
          errorType,
          response.status
        );
      }
      
      const text = await response.text();
      if (!text) {
        throw new ApiError('Empty response from server', 'SERVER');
      }
      
      return JSON.parse(text);
    } catch (error: any) {
      console.error('API Request Error:', error);
      
      // Handle timeout
      if (error.message === 'TIMEOUT') {
        throw new ApiError(
          'La conexión tardó demasiado. Verifica tu conexión a internet.',
          'TIMEOUT'
        );
      }
      
      // Handle network errors
      if (error.message === 'Network request failed' || error.name === 'TypeError') {
        throw new ApiError(
          'Error de conexión. Verifica tu conexión a internet.',
          'NETWORK'
        );
      }
      
      // Re-throw ApiError as is
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Unknown error
      throw new ApiError(
        error.message || 'Error desconocido',
        'UNKNOWN'
      );
    }
  },
  post: async (endpoint: string, body: any) => {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetchWithTimeout(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
      
      if (!response.ok) {
        const errorType = response.status >= 500 ? 'SERVER' : 'CLIENT';
        throw new ApiError(
          `HTTP error! status: ${response.status}`,
          errorType,
          response.status
        );
      }
      
      return await response.json();
    } catch (error: any) {
      console.error('API Request Error:', error);
      
      // Handle timeout
      if (error.message === 'TIMEOUT') {
        throw new ApiError(
          'La conexión tardó demasiado. Verifica tu conexión a internet.',
          'TIMEOUT'
        );
      }
      
      // Handle network errors
      if (error.message === 'Network request failed' || error.name === 'TypeError') {
        throw new ApiError(
          'Error de conexión. Verifica tu conexión a internet.',
          'NETWORK'
        );
      }
      
      // Re-throw ApiError as is
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Unknown error
      throw new ApiError(
        error.message || 'Error desconocido',
        'UNKNOWN'
      );
    }
  },
  patch: async (endpoint: string, body: any) => {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  },
  delete: async (endpoint: string) => {
    try {
      const headers: HeadersInit = {};
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
        headers,
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // DELETE might return empty response
      const text = await response.text();
      return text ? JSON.parse(text) : null;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }
};
