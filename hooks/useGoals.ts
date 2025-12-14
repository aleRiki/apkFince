import { api } from '@/services/api';
import { Goal, GoalCreateData, GoalUpdateData } from '@/types/goal';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

export const useGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get('/api/v1/metas');
      setGoals(data);
    } catch (err) {
      console.error('Error fetching goals:', err);
      setError('No se pudieron cargar las metas');
    } finally {
      setLoading(false);
    }
  }, []);

  const createGoal = async (goalData: GoalCreateData) => {
    try {
      const newGoal = await api.post('/api/v1/metas', goalData);
      setGoals(prev => [...prev, newGoal]);
      return true;
    } catch (err) {
      console.error('Error creating goal:', err);
      Alert.alert('Error', 'No se pudo crear la meta');
      return false;
    }
  };

  const updateGoal = async (id: number, goalData: GoalUpdateData) => {
    try {
      const updatedGoal = await api.patch(`/api/v1/metas/${id}`, goalData);
      setGoals(prev => prev.map(g => g.id === id ? updatedGoal : g));
      return true;
    } catch (err) {
      console.error('Error updating goal:', err);
      Alert.alert('Error', 'No se pudo actualizar la meta');
      return false;
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  return {
    goals,
    loading,
    error,
    fetchGoals,
    createGoal,
    updateGoal
  };
};
