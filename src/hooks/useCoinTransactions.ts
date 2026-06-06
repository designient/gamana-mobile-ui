import { useState, useEffect, useCallback } from 'react';
import type { CoinTransaction } from '../types';
import { getCoinTransactions } from '../lib/localDb';

export function useCoinTransactions() {
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransactions = useCallback(() => {
    setTransactions(getCoinTransactions());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return { transactions, isLoading, refresh: fetchTransactions };
}
