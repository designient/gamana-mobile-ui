import { useState, useEffect } from 'react';
import type { CoinPack } from '../types';
import { getCoinPacks } from '../lib/localDb';

export function useCoinPacks() {
  const [packs, setPacks] = useState<CoinPack[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setPacks(getCoinPacks());
    setIsLoading(false);
  }, []);

  return { packs, isLoading };
}
