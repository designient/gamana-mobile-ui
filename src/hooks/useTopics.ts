import { useState, useEffect } from 'react';
import { getTopics } from '../lib/localDb';
import type { Topic } from '../types';

export function useTopics(cityId: string) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTopics(getTopics(cityId));
    setIsLoading(false);
  }, [cityId]);

  return { topics, isLoading };
}
