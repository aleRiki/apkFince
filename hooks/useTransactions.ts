import { api } from '@/services/api';
import { useEffect, useState } from 'react';

export interface Transaction {
  id: number;
  transactionType: 'deposit' | 'withdrawal';
  amount: number;
  description: string;
  cardId: number;
  card?: {
    id: number;
    number: string;
    account: {
      id: number;
      name: string;
    };
  };
  createdAt: string;
}

interface CreateTransactionData {
  transactionType: 'deposit' | 'withdrawal';
  amount: number;
  description: string;
  cardId: number;
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await api.get('/api/v1/transaction');
      setTransactions(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transactions');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const createTransaction = async (transactionData: CreateTransactionData) => {
    try {
      const newTransaction = await api.post('/api/v1/transaction', transactionData);
      await fetchTransactions(); // Refresh the list
      return newTransaction;
    } catch (err) {
      console.error('Error creating transaction:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return {
    transactions,
    loading,
    error,
    createTransaction,
    refetch: fetchTransactions,
  };
}
