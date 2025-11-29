import { api } from '@/services/api';
import { useCallback, useEffect, useState } from 'react';

export interface Card {
  id: string;
  number: string;
  account: {
    id: number;
    name: string;
  };
}

export const useCards = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCards = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get('/api/v1/card');
      console.log('Cards data:', JSON.stringify(data, null, 2));
      
      const cardsList = Array.isArray(data) ? data : (data.cards || []);
      setCards(cardsList);
    } catch (err) {
      console.error('Error fetching cards:', err);
      setError('Failed to fetch cards');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const addCard = async (cardData: { number: string; account: number }) => {
    try {
      const newCard = await api.post('/api/v1/card', cardData);
      console.log('Card created:', newCard);
      await fetchCards(); // Refresh the list
      return true;
    } catch (err) {
      console.error('Error creating card:', err);
      throw err;
    }
  };

  return { cards, loading, error, addCard, refetch: fetchCards };
};
