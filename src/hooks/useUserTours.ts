import { useState, useEffect, useCallback } from 'react';
import {
  getUserTours,
  createTour as dbCreateTour,
  deleteTour as dbDeleteTour,
  updateTour as dbUpdateTour,
} from '../lib/localDb';
import type { UserTour } from '../types';

export function useUserTours(cityId: string) {
  const [tours, setTours] = useState<UserTour[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTours = useCallback(() => {
    setIsLoading(true);
    setTours(getUserTours(cityId));
    setIsLoading(false);
  }, [cityId]);

  useEffect(() => {
    fetchTours();
  }, [fetchTours]);

  const createTour = useCallback(async (title: string, description: string) => {
    const tour = dbCreateTour(cityId, title, description);
    fetchTours();
    return tour;
  }, [cityId, fetchTours]);

  const deleteTour = useCallback(async (tourId: string) => {
    const ok = dbDeleteTour(tourId);
    if (ok) {
      setTours((prev) => prev.filter((t) => t.id !== tourId));
    }
    return ok;
  }, []);

  const updateTour = useCallback(async (tourId: string, fields: Partial<Pick<UserTour, 'title' | 'description' | 'is_shared' | 'share_code'>>) => {
    const updated = dbUpdateTour(tourId, fields);
    if (updated) {
      setTours((prev) => prev.map((t) => t.id === tourId ? { ...t, ...updated } as UserTour : t));
    }
    return updated;
  }, []);

  return { tours, isLoading, createTour, deleteTour, updateTour, refresh: fetchTours };
}
