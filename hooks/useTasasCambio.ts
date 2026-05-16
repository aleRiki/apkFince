import { api } from '@/services/api';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface TasaCambio {
  currency: string;
  rate: number;
  symbol: string;
  name: string;
  updatedAt: string;
}

const CURRENCY_INFO: Record<string, { name: string; symbol: string; flag: string }> = {
  USD: { name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  EUR: { name: 'Euro', symbol: '€', flag: '🇪🇺' },
  CUP: { name: 'Peso Cubano', symbol: '₱', flag: '🇨🇺' },
  MXN: { name: 'Peso Mexicano', symbol: '$', flag: '🇲🇽' },
  BRL: { name: 'Real Brasileño', symbol: 'R$', flag: '🇧🇷' },
  COP: { name: 'Peso Colombiano', symbol: '$', flag: '🇨🇴' },
  ARS: { name: 'Peso Argentino', symbol: '$', flag: '🇦🇷' },
  CLP: { name: 'Peso Chileno', symbol: '$', flag: '🇨🇱' },
};

export const useTasasCambio = () => {
  const [rates, setRates] = useState<TasaCambio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchRates = useCallback(async () => {
    try {
      const data = await api.get('/api/v1/tasa-cambio');
      const ratesList = Array.isArray(data) ? data : (data.rates || data.data || []);
      const enriched = ratesList.map((r: any) => {
        const currency = (r.currency || r.moneda || '').toUpperCase();
        const info = CURRENCY_INFO[currency] || { name: currency, symbol: currency, flag: '💱' };
        return {
          currency,
          rate: parseFloat(r.rateToUSD ?? r.rate ?? r.tasa ?? r.valor ?? 0),
          symbol: info.symbol,
          name: info.name,
          updatedAt: r.updatedAt || r.fecha || new Date().toISOString(),
        };
      }).filter((r: TasaCambio) => r.rate > 0);
      setRates(enriched);
      setError(null);
    } catch (err) {
      setError('Error al obtener tasas de cambio');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(fetchRates, 30000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, fetchRates]);

  return { rates, loading, error, refetch: fetchRates, autoRefresh, setAutoRefresh };
};
