import { api } from '@/services/api';
import React, { createContext, ReactNode, useContext, useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post('/api/v1/auth/login', { email, password });
      console.log('Login response:', JSON.stringify(response, null, 2));

      // Extract token from response (assuming it's in 'token' field)
      const token = response.token;
      if (token) {
        api.setToken(token);
      }

      // Decode token to extract user name if not in response directly
      const userName = response.name || response.user?.name || 'Usuario';

      if (token) {
        setUser({
          id: response.id || response.user?.id || '1',
          name: userName,
          email: response.email || email,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
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
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  };

  const logout = () => {
    console.log('Logout called - clearing user and token');
    setUser(null);
    api.setToken(null);
    console.log('User logged out successfully');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
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
