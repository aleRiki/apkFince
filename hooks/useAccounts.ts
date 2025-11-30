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
  currency: string;
}

// Colors for different currencies
const currencyColors: { [key: string]: string[] } = {
  'USD': ['#10B981', '#059669'],      // Green
  'EUR': ['#94A3B8', '#64748B'],      // Silver/Gray
  'CUP': ['#F97316', '#EA580C'],      // Copper/Orange
  'CRYPTO': ['#F59E0B', '#D97706'],   // Gold
  'DEFAULT': ['#94A3B8', '#64748B'],  // Default Silver
};

export const useAccounts = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const data = await api.get('/api/v1/accounts');
      console.log('Accounts data:', JSON.stringify(data, null, 2));
      
      // Ensure data is an array, or extract it if nested
      const accountsList = Array.isArray(data) ? data : (data.accounts || []);
      
      // Transform backend data to match AccountCard interface
      const transformedAccounts: Account[] = accountsList.map((acc: any) => {
        // Determine currency from type field or fallback to name
        let currency = 'EUR';
        const type = (acc.type || '').toUpperCase();
        const accountInfo = `${acc.name} ${acc.address || ''}`.toUpperCase();

        if (['USD', 'EUR', 'CUP', 'CRYPTO', 'USDT', 'BTC', 'ETH'].includes(type)) {
            currency = type;
        } else {
            // Fallback to name detection if type is not a currency (e.g. 'AHORROS')
            if (accountInfo.includes('USD') || accountInfo.includes('DOLLAR')) {
                currency = 'USD';
            } else if (accountInfo.includes('CUP') || accountInfo.includes('PESO')) {
                currency = 'CUP';
            } else if (accountInfo.includes('CRYPTO') || accountInfo.includes('BTC') || accountInfo.includes('ETH')) {
                currency = 'CRYPTO';
            }
        }

        return {
          id: String(acc.id),
          type: acc.type || 'ahorros',
          name: acc.name,
          bank: acc.bank?.name || 'Banco',
          lastDigits: String(acc.id).slice(-4).padStart(4, '0'),
          balance: parseFloat(acc.balance) || 0,
          color: currencyColors[currency] || currencyColors['DEFAULT'],
          currency: currency,
        };
      });
      
      setAccounts(transformedAccounts);
    } catch (err) {
      console.error('Error fetching accounts:', err);
      setError('Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  return { accounts, loading, error, refetch: fetchAccounts };
};
