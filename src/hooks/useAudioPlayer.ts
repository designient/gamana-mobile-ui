import { useState, useRef, useCallback, useEffect } from 'react';
import type { Story, Narrator, PlaybackState } from '../types';
import { getStoryNarration } from '../lib/localDb';
import { getCachedAudioUrl } from '../lib/downloadManager';

export function useAudioPlayer() {
  const [state, setState] = useState<PlaybackState>({
    isPlaying: false,
    currentNarration: null,
    currentStory: null,
    progress: 0,
    duration: 0,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<number | null>(null);

  const clearProgress = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startProgressTracking = useCallback(() => {
    clearProgress();
    intervalRef.current = window.setInterval(() => {
      const audio = audioRef.current;
      if (audio && audio.duration) {
        setState((s) => ({
          ...s,
          progress: (audio.currentTime / audio.duration) * 100,
          duration: audio.duration,
        }));
      }
    }, 500);
  }, [clearProgress]);

  const playStory = useCallback(async (story: Story, narrator: Narrator | null) => {
    const narratorId = narrator?.id ?? '00000000-0000-0000-0000-000000000010';
    const narration = getStoryNarration(story.id, narratorId);

    if (!narration) return;

    const cachedUrl = await getCachedAudioUrl(narration.audio_url);

    if (audioRef.current) {
      audioRef.current.pause();
    }

    setState({
      isPlaying: true,
      currentNarration: narration,
      currentStory: story,
      progress: 0,
      duration: story.duration_seconds,
    });

    if (cachedUrl) {
      console.info('offline_playback_started', { story_id: story.id, narrator_id: narratorId });
    }

    startProgressTracking();
  }, [startProgressTracking]);

  const togglePlay = useCallback(() => {
    setState((s) => {
      const newPlaying = !s.isPlaying;
      if (newPlaying) {
        startProgressTracking();
      } else {
        clearProgress();
      }
      return { ...s, isPlaying: newPlaying };
    });
  }, [startProgressTracking, clearProgress]);

  const stop = useCallback(() => {
    clearProgress();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setState({
      isPlaying: false,
      currentNarration: null,
      currentStory: null,
      progress: 0,
      duration: 0,
    });
  }, [clearProgress]);

  useEffect(() => {
    return () => clearProgress();
  }, [clearProgress]);

  return {
    ...state,
    playStory,
    togglePlay,
    stop,
  };
}
