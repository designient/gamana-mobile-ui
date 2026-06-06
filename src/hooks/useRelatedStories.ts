import { useState, useEffect } from 'react';
import { getRelatedStories } from '../lib/localDb';
import type { StoryRelatedLink } from '../types';

export function useRelatedStories(storyId: string | null) {
  const [related, setRelated] = useState<StoryRelatedLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!storyId) {
      setRelated([]);
      setIsLoading(false);
      return;
    }

    setRelated(getRelatedStories(storyId));
    setIsLoading(false);
  }, [storyId]);

  return { related, isLoading };
}
