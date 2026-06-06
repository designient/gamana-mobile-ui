import { useState, useEffect } from 'react';
import { getStoryNarrations } from '../lib/localDb';
import type { StoryNarration } from '../types';

export function useStoryNarrations(storyId: string | null) {
  const [narrations, setNarrations] = useState<StoryNarration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!storyId) {
      setNarrations([]);
      setIsLoading(false);
      return;
    }

    setNarrations(getStoryNarrations(storyId));
    setIsLoading(false);
  }, [storyId]);

  return { narrations, isLoading };
}
