import { api } from '@/services/api';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

export interface Task {
  id: string;
  title: string;
  description: string;
  type: string;
  isCompleted: boolean;
  spentAmount: number;
  presupuesto: {
    id: number;
    name: string;
    presupuesto: number;
    card?: { id: number; number: string; balance: string };
  };
  createdAt?: string;
  users: any[];
}

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get('/api/v1/taskt');
      setTasks(data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('No se pudieron cargar las tareas');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = async (title: string, type: string, presupuestoId: number, userIds: number[] = []) => {
    try {
      const newTask = await api.post('/api/v1/taskt', {
        title,
        description: type,
        type,
        presupuestoId,
        isCompleted: false,
        userIds
      });
      setTasks(prev => [...prev, newTask]);
      return true;
    } catch (err) {
      console.error('Error creating task:', err);
      Alert.alert('Error', 'No se pudo crear la tarea');
      return false;
    }
  };

  const toggleTaskCompletion = async (taskId: string, _currentStatus: boolean, amount?: number) => {
    try {
      await api.patch(`/api/v1/taskt/${taskId}/completed`, { amount });
      const updated = await api.get(`/api/v1/taskt/${taskId}`);
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
    } catch (err) {
      console.error('Error completing task:', err);
      Alert.alert('Error', 'No se pudo completar la tarea. Verifica fondos suficientes.');
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await api.delete(`/api/v1/taskt/${taskId}`);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      return true;
    } catch (err) {
      console.error('Error deleting task:', err);
      Alert.alert('Error', 'No se pudo eliminar la tarea');
      return false;
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    toggleTaskCompletion,
    deleteTask
  };
};
