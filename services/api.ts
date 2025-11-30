import { API_URL } from '../constants/config';

let authToken: string | null = null;

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

      const response = await fetch(`${API_URL}${endpoint}`, {
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const text = await response.text();
      if (!text) {
        throw new Error('Empty response from server');
      }
      
      return JSON.parse(text);
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
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

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
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
  }
};
