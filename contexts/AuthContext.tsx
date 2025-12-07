import { api, ApiError } from '@/services/api';
import React, { createContext, ReactNode, useContext, useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await api.post('/api/v1/auth/login', { email, password });
      console.log('Login response:', JSON.stringify(response, null, 2));

      // Extract token from response (assuming it's in 'token' field)
      const token = response.token;
      if (token) {
        api.setToken(token);

        // Decode JWT token to extract user data
        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          const payload = JSON.parse(jsonPayload);

          console.log('Decoded token payload:', payload);

          setUser({
            id: payload.id?.toString() || '1',
            name: payload.name || response.name || 'Usuario',
            email: payload.email || response.email || email,
            role: payload.role,
          });
          return { success: true };
        } catch (decodeError) {
          console.error('Error decoding token:', decodeError);
          // Fallback to response data
          setUser({
            id: response.id?.toString() || '1',
            name: response.name || 'Usuario',
            email: response.email || email,
          });
          return { success: true };
        }
      }
      return { success: false, error: 'No se recibió token del servidor' };
    } catch (error: any) {
      console.error('Login failed:', error);

      // Handle ApiError with specific messages
      if (error instanceof ApiError) {
        switch (error.type) {
          case 'NETWORK':
            return { success: false, error: 'Error de conexión. Verifica tu conexión a internet.' };
          case 'TIMEOUT':
            return { success: false, error: 'La conexión tardó demasiado. Intenta de nuevo.' };
          case 'SERVER':
            return { success: false, error: 'Error del servidor. Intenta más tarde.' };
          case 'CLIENT':
            if (error.statusCode === 401) {
              return { success: false, error: 'Credenciales inválidas' };
            }
            return { success: false, error: 'Error en la solicitud' };
          default:
            return { success: false, error: error.message };
        }
      }

      return { success: false, error: 'Error desconocido. Intenta de nuevo.' };
    }
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await api.post('/api/v1/auth/register', { name, email, password });
      console.log('Register response:', JSON.stringify(response, null, 2));

      const token = response.token;
      if (token) {
        api.setToken(token);
      }

      const userData = response.user || response;

      if (userData) {
        setUser({
          id: userData.id || '1',
          name: userData.name || name,
          email: userData.email || email,
        });
        return { success: true };
      }
      return { success: false, error: 'No se recibió información del usuario' };
    } catch (error: any) {
      console.error('Registration failed:', error);

      // Handle ApiError with specific messages
      if (error instanceof ApiError) {
        switch (error.type) {
          case 'NETWORK':
            return { success: false, error: 'Error de conexión. Verifica tu conexión a internet.' };
          case 'TIMEOUT':
            return { success: false, error: 'La conexión tardó demasiado. Intenta de nuevo.' };
          case 'SERVER':
            return { success: false, error: 'Error del servidor. Intenta más tarde.' };
          case 'CLIENT':
            if (error.statusCode === 400) {
              return { success: false, error: 'Email ya registrado o datos inválidos' };
            }
            return { success: false, error: 'Error en la solicitud' };
          default:
            return { success: false, error: error.message };
        }
      }

      return { success: false, error: 'Error desconocido. Intenta de nuevo.' };
    }
  };

  const logout = () => {
    console.log('Logout called - clearing user and token');
    setUser(null);
    api.setToken(null);
    console.log('User logged out successfully');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
