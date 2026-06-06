import { useState, useEffect } from 'react';
import { getStoryById, getStorySources, getStoryNotices, getStoryPracticalCues } from '../lib/localDb';
import type { Story, StorySource, StoryNotice, StoryPracticalCue } from '../types';

interface StoryDetailData {
  story: Story | null;
  sources: StorySource[];
  notices: StoryNotice[];
  practicalCues: StoryPracticalCue[];
  isLoading: boolean;
  error: string | null;
}

export function useStoryDetail(storyId: string | null): StoryDetailData {
  const [story, setStory] = useState<Story | null>(null);
  const [sources, setSources] = useState<StorySource[]>([]);
  const [notices, setNotices] = useState<StoryNotice[]>([]);
  const [practicalCues, setPracticalCues] = useState<StoryPracticalCue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storyId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const foundStory = getStoryById(storyId);
    if (!foundStory) {
      setError('Story not found');
      setIsLoading(false);
      return;
    }

    setStory(foundStory);
    setSources(getStorySources(storyId));
    setNotices(getStoryNotices(storyId));
    setPracticalCues(getStoryPracticalCues(storyId));
    setIsLoading(false);
  }, [storyId]);

  return { story, sources, notices, practicalCues, isLoading, error };
}
