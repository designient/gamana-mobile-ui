import { useState, useEffect, useCallback } from 'react';
import { getSavedExperienceIds } from '../lib/experience-saved';
import { getExperiencesByIdsAsync } from '../lib/experience-mock-api';
import type { ExperienceListItemView } from '../types/experience';

export function useWishlistedExperiences() {
  const [items, setItems] = useState<ExperienceListItemView[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(() => {
    setIsLoading(true);
    const ids = getSavedExperienceIds();
    if (ids.length === 0) {
      setItems([]);
      setIsLoading(false);
      return;
    }
    getExperiencesByIdsAsync(ids).then((list) => {
      const order = new Map(ids.map((id, i) => [id, i]));
      const sorted = [...list].sort(
        (a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0),
      );
      setItems(sorted);
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    window.addEventListener('gamana_wishlist_changed', onChange);
    return () => window.removeEventListener('gamana_wishlist_changed', onChange);
  }, [refresh]);

  return { items, isLoading, refresh, count: items.length };
}
