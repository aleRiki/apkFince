import { api } from '@/services/api';
import { Budget, BudgetCreateData, BudgetUpdateData } from '@/types/budget';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

export const useBudgets = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get('/api/v1/presupuesto');
      setBudgets(data);
    } catch (err) {
      console.error('Error fetching budgets:', err);
      setError('No se pudieron cargar los presupuestos');
    } finally {
      setLoading(false);
    }
  }, []);

  const createBudget = async (budgetData: BudgetCreateData) => {
    try {
      const newBudget = await api.post('/api/v1/presupuesto', budgetData);
      setBudgets(prev => [...prev, newBudget]);
      return true;
    } catch (err) {
      console.error('Error creating budget:', err);
      Alert.alert('Error', 'No se pudo crear el presupuesto');
      return false;
    }
  };

  const updateBudget = async (id: number, budgetData: BudgetUpdateData) => {
    try {
      const updatedBudget = await api.patch(`/api/v1/presupuesto/${id}`, budgetData);
      setBudgets(prev => prev.map(b => b.id === id ? updatedBudget : b));
      return true;
    } catch (err) {
      console.error('Error updating budget:', err);
      Alert.alert('Error', 'No se pudo actualizar el presupuesto');
      return false;
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  return {
    budgets,
    loading,
    error,
    fetchBudgets,
    createBudget,
    updateBudget,
  };
};
