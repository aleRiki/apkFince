import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { useEffect, useState } from 'react';

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  deletedAt: string | null;
}

interface UpdateUserData {
  name?: string;
  email?: string;
  role?: string;
  password?: string;
}

export const useUser = () => {
  const { user, updateUser } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = async () => {
    if (!user?.id) {
      console.log('No user ID available, skipping fetch');
      return;
    }

    console.log('Fetching user data for ID:', user.id);
    setLoading(true);
    setError(null);
    try {
      const data = await api.get(`/api/v1/users/${user.id}`);
      console.log('User data received:', data);
      
      if (!data) {
        throw new Error('Empty response from server');
      }
      
      setUserData(data);
      // Update auth context with complete user data including role
      updateUser({
        id: data.id.toString(),
        name: data.name,
        email: data.email,
        role: data.role,
      });
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Error al cargar los datos del usuario');
    } finally {
      setLoading(false);
    }
  };

  const updateUserData = async (updates: UpdateUserData) => {
    if (!user?.id) {
      throw new Error('No user ID available');
    }

    setLoading(true);
    setError(null);
    try {
      await api.patch(`/api/v1/users/${user.id}`, updates);
      // Fetch updated data
      await fetchUserData();
      return true;
    } catch (err) {
      console.error('Error updating user data:', err);
      setError('Error al actualizar los datos del usuario');
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [user?.id]);

  return {
    userData,
    loading,
    error,
    refetch: fetchUserData,
    updateUserData,
  };
};
