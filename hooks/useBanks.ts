import { api } from '@/services/api';
import { useCallback, useEffect, useState } from 'react';

export interface Bank {
  id: number;
  name: string;
  address: string;
}

export const useBanks = () => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBanks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get('/api/v1/bank');
      console.log('Banks data:', JSON.stringify(data, null, 2));
      
      const banksList = Array.isArray(data) ? data : (data.banks || []);
      setBanks(banksList);
    } catch (err) {
      console.error('Error fetching banks:', err);
      setError('Failed to fetch banks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanks();
  }, [fetchBanks]);

  const addBank = async (bankData: { name: string; address: string }) => {
    try {
      const newBank = await api.post('/api/v1/bank', bankData);
      console.log('Bank created:', newBank);
      await fetchBanks(); // Refresh the list
      return true;
    } catch (err) {
      console.error('Error creating bank:', err);
      throw err;
    }
  };

  return { banks, loading, error, addBank, refetch: fetchBanks };
};
