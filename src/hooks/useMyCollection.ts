import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getUnlockedStories,
  getUnlockedPacks,
  getCityPackById,
  getStoriesByIds,
} from '../lib/localDb';
import { getExperienceBookings, type ExperienceBookingRecord } from '../lib/experience-bookings';
import { getUserTours } from '../lib/localDb';
import type { Story, CityPack, UserTour } from '../types';
import type { ExperienceTab } from '../types/experience';

export type CollectionTab = 'stories' | 'audio_tours' | 'my_tours' | 'bookings';

export interface CollectionStoryItem {
  kind: 'story';
  story: Story;
  expires_at: string;
  is_expired: boolean;
}

export interface CollectionPackItem {
  kind: 'audio_tour';
  pack: CityPack;
  expires_at: string;
  is_expired: boolean;
}

export interface CollectionUserTourItem {
  kind: 'my_tour';
  tour: UserTour;
}

export interface CollectionBookingItem {
  kind: 'booking';
  booking: ExperienceBookingRecord;
}

export type CollectionPreviewItem = {
  id: string;
  kind: CollectionTab extends infer _ ? 'story' | 'audio_tour' | 'my_tour' | 'booking' : never;
  title: string;
  subtitle: string;
  imageUrl?: string;
  sortAt: string;
  isExpired?: boolean;
  storyId?: string;
  packId?: string;
  tourId?: string;
  slug?: string;
  experienceId?: string;
  uiTabIntent?: ExperienceTab;
};

function toPreviewFromStory(item: CollectionStoryItem): CollectionPreviewItem {
  return {
    id: `story-${item.story.id}`,
    kind: 'story',
    title: item.story.title,
    subtitle: item.story.subtitle,
    imageUrl: item.story.image_url,
    sortAt: item.expires_at,
    isExpired: item.is_expired,
    storyId: item.story.id,
  };
}

function toPreviewFromPack(item: CollectionPackItem): CollectionPreviewItem {
  return {
    id: `pack-${item.pack.id}`,
    kind: 'audio_tour',
    title: item.pack.title,
    subtitle: item.pack.subtitle ?? `${item.pack.story_count} stops`,
    imageUrl: item.pack.image_url ?? undefined,
    sortAt: item.expires_at,
    isExpired: item.is_expired,
    packId: item.pack.id,
  };
}

function toPreviewFromTour(item: CollectionUserTourItem): CollectionPreviewItem {
  return {
    id: `tour-${item.tour.id}`,
    kind: 'my_tour',
    title: item.tour.title,
    subtitle: item.tour.description || `${item.tour.stop_count ?? 0} stops`,
    sortAt: item.tour.updated_at,
    tourId: item.tour.id,
  };
}

function toPreviewFromBooking(item: CollectionBookingItem): CollectionPreviewItem {
  return {
    id: `booking-${item.booking.id}`,
    kind: 'booking',
    title: item.booking.title,
    subtitle: item.booking.operatorName,
    imageUrl: item.booking.heroImageUrl,
    sortAt: item.booking.bookedAt,
    slug: item.booking.slug,
    experienceId: item.booking.experienceId,
    uiTabIntent: item.booking.uiTabIntent,
  };
}

export function useMyCollection(cityId: string) {
  const [stories, setStories] = useState<CollectionStoryItem[]>([]);
  const [audioTours, setAudioTours] = useState<CollectionPackItem[]>([]);
  const [myTours, setMyTours] = useState<CollectionUserTourItem[]>([]);
  const [bookings, setBookings] = useState<CollectionBookingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(() => {
    setIsLoading(true);
    const nowDate = new Date();

    const unlockedStories = getUnlockedStories();
    const storyIds = unlockedStories.map((u) => u.item_id);
    const storyRecords = getStoriesByIds(storyIds);
    const storyMap = new Map(storyRecords.map((s) => [s.id, s]));
    const storyItems: CollectionStoryItem[] = unlockedStories
      .map((u) => {
        const story = storyMap.get(u.item_id);
        if (!story) return null;
        return {
          kind: 'story' as const,
          story,
          expires_at: u.expires_at,
          is_expired: new Date(u.expires_at) <= nowDate,
        };
      })
      .filter(Boolean) as CollectionStoryItem[];
    setStories(storyItems);

    const unlockedPacks = getUnlockedPacks();
    const packItems: CollectionPackItem[] = unlockedPacks
      .map((u) => {
        const pack = getCityPackById(u.item_id);
        if (!pack) return null;
        return {
          kind: 'audio_tour' as const,
          pack,
          expires_at: u.expires_at,
          is_expired: new Date(u.expires_at) <= nowDate,
        };
      })
      .filter(Boolean) as CollectionPackItem[];
    setAudioTours(packItems);

    const tours = getUserTours(cityId);
    setMyTours(tours.map((tour) => ({ kind: 'my_tour' as const, tour })));

    const bookingRecords = getExperienceBookings();
    setBookings(bookingRecords.map((booking) => ({ kind: 'booking' as const, booking })));

    setIsLoading(false);
  }, [cityId]);

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    window.addEventListener('gamana_collection_changed', onChange);
    return () => window.removeEventListener('gamana_collection_changed', onChange);
  }, [refresh]);

  const previewItems = useMemo(() => {
    const all: CollectionPreviewItem[] = [
      ...stories.map(toPreviewFromStory),
      ...audioTours.map(toPreviewFromPack),
      ...myTours.map(toPreviewFromTour),
      ...bookings.map(toPreviewFromBooking),
    ];
    return all
      .sort((a, b) => new Date(b.sortAt).getTime() - new Date(a.sortAt).getTime())
      .slice(0, 4);
  }, [stories, audioTours, myTours, bookings]);

  const totalCount = stories.length + audioTours.length + myTours.length + bookings.length;

  return {
    stories,
    audioTours,
    myTours,
    bookings,
    previewItems,
    totalCount,
    isLoading,
    refresh,
  };
}
