import { useState, useEffect, useCallback } from 'react';
import {
  getTourStops,
  addTourStoryStop,
  addTourPinnedStop,
  removeTourStop,
} from '../lib/localDb';
import type { UserTourStop } from '../types';

export function useUserTourStops(tourId: string | null) {
  const [stops, setStops] = useState<UserTourStop[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStops = useCallback(() => {
    if (!tourId) {
      setStops([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setStops(getTourStops(tourId));
    setIsLoading(false);
  }, [tourId]);

  useEffect(() => {
    fetchStops();
  }, [fetchStops]);

  const addStoryStop = useCallback(async (storyId: string) => {
    if (!tourId) return false;
    const ok = addTourStoryStop(tourId, storyId, stops.length);
    if (ok) fetchStops();
    return ok;
  }, [tourId, stops.length, fetchStops]);

  const addPinnedStop = useCallback(async (label: string, lat: number, lng: number) => {
    if (!tourId) return false;
    const ok = addTourPinnedStop(tourId, label, lat, lng, stops.length);
    if (ok) fetchStops();
    return ok;
  }, [tourId, stops.length, fetchStops]);

  const removeStop = useCallback(async (stopId: string) => {
    const ok = removeTourStop(stopId);
    if (ok) {
      setStops((prev) => prev.filter((s) => s.id !== stopId));
    }
    return ok;
  }, []);

  return { stops, isLoading, addStoryStop, addPinnedStop, removeStop, refresh: fetchStops };
}
