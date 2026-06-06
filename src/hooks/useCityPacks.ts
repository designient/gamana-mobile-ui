import { useState, useEffect } from 'react';
import { getCityPacks } from '../lib/localDb';
import type { CityPack } from '../types';

export function useCityPacks(cityId: string) {
  const [packs, setPacks] = useState<CityPack[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setPacks(getCityPacks(cityId));
    setIsLoading(false);
  }, [cityId]);

  return { packs, isLoading };
}
