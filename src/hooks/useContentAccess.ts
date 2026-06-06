import { useState, useEffect, useCallback } from 'react';
import type { ContentAccessStatus } from '../types';
import { getContentAccess } from '../lib/localDb';

const DEFAULT_STATUS: ContentAccessStatus = {
  is_unlocked: false,
  is_expired: false,
  days_remaining: 0,
};

export function useContentAccess(itemType: 'story' | 'pack', itemId: string | null) {
  const [access, setAccess] = useState<ContentAccessStatus>(DEFAULT_STATUS);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAccess = useCallback(() => {
    if (!itemId) {
      setIsLoading(false);
      return;
    }

    setAccess(getContentAccess(itemType, itemId));
    setIsLoading(false);
  }, [itemType, itemId]);

  useEffect(() => {
    setIsLoading(true);
    fetchAccess();
  }, [fetchAccess]);

  return { access, isLoading, refresh: fetchAccess };
}
