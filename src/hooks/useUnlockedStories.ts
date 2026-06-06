import { useState, useEffect, useCallback } from 'react';
import { getUnlockedStories, getStoriesByIds } from '../lib/localDb';
import type { Story } from '../types';

interface UnlockedStoryItem {
  story: Story;
  expires_at: string;
  is_expired: boolean;
}

export function useUnlockedStories() {
  const [items, setItems] = useState<UnlockedStoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchItems = useCallback(() => {
    setIsLoading(true);

    const unlocked = getUnlockedStories();
    if (unlocked.length === 0) {
      setItems([]);
      setIsLoading(false);
      return;
    }

    const storyIds = unlocked.map((u) => u.item_id);
    const stories = getStoriesByIds(storyIds);
    const storyMap = new Map(stories.map((s) => [s.id, s]));
    const nowDate = new Date();

    const result: UnlockedStoryItem[] = unlocked
      .map((u) => {
        const story = storyMap.get(u.item_id);
        if (!story) return null;
        return {
          story,
          expires_at: u.expires_at,
          is_expired: new Date(u.expires_at) <= nowDate,
        };
      })
      .filter(Boolean) as UnlockedStoryItem[];

    setItems(result);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return { items, isLoading, refresh: fetchItems };
}
