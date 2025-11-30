import { api } from '@/services/api';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

export interface Task {
  id: string;
  title: string;
  category: string;
  completed: boolean;
  createdAt: string;
  userId?: string;
}

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Using the specific endpoint mentioned by the user: /api/v1/taskt
      const data = await api.get('/api/v1/taskt');
      setTasks(data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('No se pudieron cargar las tareas');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = async (title: string, category: string) => {
    try {
      const newTask = await api.post('/api/v1/taskt', {
        title,
        category,
        completed: false
      });
      setTasks(prev => [...prev, newTask]);
      return true;
    } catch (err) {
      console.error('Error creating task:', err);
      Alert.alert('Error', 'No se pudo crear la tarea');
      return false;
    }
  };

  const toggleTaskCompletion = async (taskId: string, currentStatus: boolean) => {
    try {
      // Optimistic update
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, completed: !currentStatus } : t
      ));

      await api.patch(`/api/v1/taskt/${taskId}`, {
        completed: !currentStatus
      });
    } catch (err) {
      console.error('Error updating task:', err);
      // Revert optimistic update
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, completed: currentStatus } : t
      ));
      Alert.alert('Error', 'No se pudo actualizar la tarea');
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
    toggleTaskCompletion
  };
};
