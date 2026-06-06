import { useState, useCallback, useEffect, useRef } from 'react';
import type { TourSession, TourSessionStop, Story } from '../types';
import { saveTourSession, getTourSession, deleteTourSession, getUserTourById } from '../lib/localDb';
import { cityPacks, cityPackStories, stories as allStories } from '../lib/seed-data';
import { getTourStops } from '../lib/localDb';

function uuid(): string {
  return crypto.randomUUID();
}

function buildRecommendedStops(tourId: string): TourSessionStop[] {
  const storyIds = cityPackStories.filter((ps) => ps.pack_id === tourId).map((ps) => ps.story_id);
  return storyIds.map((sid) => {
    const story = allStories.find((s) => s.id === sid) as Story | undefined;
    return {
      id: uuid(),
      storyId: sid,
      story: story ?? undefined,
      lat: story?.lat ?? 12.9716,
      lng: story?.lng ?? 77.5946,
      status: 'locked' as const,
      arrivedAt: null,
      playedAt: null,
    };
  });
}

function buildUserTourStops(tourId: string): TourSessionStop[] {
  const stops = getTourStops(tourId);
  return stops.map((stop) => ({
    id: uuid(),
    storyId: stop.story_id,
    story: stop.story ?? undefined,
    pinnedLabel: stop.pinned_label ?? undefined,
    lat: stop.story?.lat ?? stop.pinned_lat ?? 12.9716,
    lng: stop.story?.lng ?? stop.pinned_lng ?? 77.5946,
    status: 'locked' as const,
    arrivedAt: null,
    playedAt: null,
  }));
}

export function useTourSession(tourType: 'recommended' | 'user', tourId: string) {
  const [session, setSession] = useState<TourSession | null>(null);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // On mount — resume or build new session
  useEffect(() => {
    const existing = getTourSession(tourId);
    if (existing && existing.status !== 'completed') {
      // Unlock the current stop & set previous as completed
      const updated = { ...existing };
      if (updated.currentStopIndex < updated.stops.length) {
        updated.stops = updated.stops.map((s, i) => {
          if (i < updated.currentStopIndex) return { ...s, status: 'completed' as const };
          if (i === updated.currentStopIndex) return { ...s, status: 'locked' as const };
          return s;
        });
      }
      setSession(updated);
      return;
    }

    // Build fresh session
    const title =
      tourType === 'recommended'
        ? cityPacks.find((p) => p.id === tourId)?.title ?? 'Tour'
        : getUserTourById(tourId)?.title ?? 'My Tour';

    const stops =
      tourType === 'recommended'
        ? buildRecommendedStops(tourId)
        : buildUserTourStops(tourId);

    // Unlock the first stop
    if (stops.length > 0) stops[0].status = 'locked';

    const newSession: TourSession = {
      id: uuid(),
      tourType,
      tourId,
      title,
      stops,
      currentStopIndex: 0,
      status: 'preparing',
      startedAt: null,
      completedAt: null,
      totalDistanceMeters: 0,
      totalTimeSeconds: 0,
    };

    setSession(newSession);
    saveTourSession(newSession);
  }, [tourType, tourId]);

  // Elapsed time tracking
  useEffect(() => {
    if (session?.status === 'active') {
      startTimeRef.current = Date.now();
      timerRef.current = window.setInterval(() => {
        setSession((prev) => {
          if (!prev || prev.status !== 'active') return prev;
          const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
          return { ...prev, totalTimeSeconds: (prev.totalTimeSeconds || 0) + 1 };
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [session?.status]);

  // Auto-persist on change
  useEffect(() => {
    if (session) {
      saveTourSession(session);
    }
  }, [session]);

  const startTour = useCallback(() => {
    setSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        status: 'active',
        startedAt: new Date().toISOString(),
      };
    });
  }, []);

  const arriveAtStop = useCallback((stopIndex: number) => {
    setSession((prev) => {
      if (!prev) return prev;
      const stops = prev.stops.map((s, i) => {
        if (i === stopIndex) return { ...s, status: 'arrived' as const, arrivedAt: new Date().toISOString() };
        return s;
      });
      return { ...prev, stops, currentStopIndex: stopIndex };
    });
  }, []);

  const completeStop = useCallback((stopIndex: number) => {
    setSession((prev) => {
      if (!prev) return prev;
      const stops = prev.stops.map((s, i) => {
        if (i === stopIndex) return { ...s, status: 'completed' as const, playedAt: new Date().toISOString() };
        return s;
      });
      const nextIndex = stopIndex + 1;
      const isLastStop = nextIndex >= prev.stops.length;

      if (isLastStop) {
        return {
          ...prev,
          stops,
          currentStopIndex: stopIndex,
          status: 'completed',
          completedAt: new Date().toISOString(),
        };
      }

      return { ...prev, stops, currentStopIndex: nextIndex };
    });
  }, []);

  const pauseTour = useCallback(() => {
    setSession((prev) => prev ? { ...prev, status: 'paused' } : prev);
  }, []);

  const resumeTour = useCallback(() => {
    setSession((prev) => prev ? { ...prev, status: 'active' } : prev);
  }, []);

  const exitTour = useCallback(() => {
    if (session) {
      saveTourSession({ ...session, status: 'paused' });
    }
  }, [session]);

  const currentStop = session?.stops[session.currentStopIndex] ?? null;
  const nextStop = session && session.currentStopIndex + 1 < session.stops.length
    ? session.stops[session.currentStopIndex + 1]
    : null;
  const progress = session
    ? Math.round((session.stops.filter((s) => s.status === 'completed').length / session.stops.length) * 100)
    : 0;

  return {
    session,
    currentStop,
    nextStop,
    progress,
    startTour,
    arriveAtStop,
    completeStop,
    pauseTour,
    resumeTour,
    exitTour,
  };
}
