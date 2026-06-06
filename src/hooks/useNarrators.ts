import { useState, useEffect } from 'react';
import { getNarrators } from '../lib/localDb';
import type { Narrator } from '../types';

export function useNarrators() {
  const [narrators, setNarrators] = useState<Narrator[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setNarrators(getNarrators());
    setIsLoading(false);
  }, []);

  return { narrators, isLoading };
}
