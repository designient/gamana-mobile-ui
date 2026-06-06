import { useState, useEffect } from 'react';
import { useOrgContext } from './useOrgContext';
import { nearbyStories } from '../lib/localDb';
import type { Story } from '../types';

export function useNearbyStories(lat: number, lng: number, radius: number = 10000) {
  const { config: orgConfig } = useOrgContext();
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const results = nearbyStories(lat, lng, radius);
      const filtered = orgConfig.enabledRegions.length > 0
        ? results.filter((s) => orgConfig.enabledRegions.includes(s.city_id))
        : results;
      setStories(filtered);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStories([]);
    }
    setIsLoading(false);
  }, [lat, lng, radius, orgConfig.enabledRegions]);

  return { stories, isLoading, error };
}
