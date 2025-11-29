import { api } from '@/services/api';
import { useEffect, useState } from 'react';

export interface Account {
  id: string;
  type: string;
  name: string;
  bank: string;
  lastDigits: string;
  balance: number;
  color: string[];
}

// Colors for different account types
const accountColors: { [key: string]: string[] } = {
  ahorros: ['#10B981', '#059669'],
  corriente: ['#0EA5A4', '#0D8F8E'],
  default: ['#FB923C', '#F97316'],
};

export const useAccounts = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await api.get('/api/v1/accounts');
        console.log('Accounts data:', JSON.stringify(data, null, 2));
        
        // Ensure data is an array, or extract it if nested
        const accountsList = Array.isArray(data) ? data : (data.accounts || []);
        
        // Transform backend data to match AccountCard interface
        const transformedAccounts: Account[] = accountsList.map((acc: any) => ({
          id: String(acc.id),
          type: acc.type || 'ahorros',
          name: acc.name,
          bank: acc.bank?.name || 'Banco',
          lastDigits: String(acc.id).slice(-4).padStart(4, '0'), // Use last 4 digits of ID
          balance: parseFloat(acc.balance) || 0,
          color: accountColors[acc.type] || accountColors.default,
        }));
        
        setAccounts(transformedAccounts);
      } catch (err) {
        console.error('Error fetching accounts:', err);
        setError('Failed to fetch accounts');
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  return { accounts, loading, error };
};
