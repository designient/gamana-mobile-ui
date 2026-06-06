import type { Badge, BadgeId, TourSession } from '../types';

// ---------------------------------------------------------------------------
// Badge Catalog — Static definitions for all available badges
// ---------------------------------------------------------------------------

export const BADGE_CATALOG: Record<BadgeId, Omit<Badge, 'earnedAt' | 'tourId'>> = {
  first_tour: {
    id: 'first_tour',
    title: 'First Steps',
    description: 'Complete your very first walking tour',
    icon: 'footprints',
  },
  heritage_explorer: {
    id: 'heritage_explorer',
    title: 'Heritage Explorer',
    description: 'Complete the Heritage Walk tour',
    icon: 'landmark',
  },
  temple_pilgrim: {
    id: 'temple_pilgrim',
    title: 'Temple Pilgrim',
    description: 'Complete the Temple Trail tour',
    icon: 'church',
  },
  nature_lover: {
    id: 'nature_lover',
    title: 'Nature Lover',
    description: 'Complete the Garden City tour',
    icon: 'trees',
  },
  speed_walker: {
    id: 'speed_walker',
    title: 'Speed Walker',
    description: 'Complete a tour in under 30 minutes',
    icon: 'zap',
  },
  marathon_tourist: {
    id: 'marathon_tourist',
    title: 'Marathon Tourist',
    description: 'Complete 5 tours total',
    icon: 'trophy',
  },
  city_master: {
    id: 'city_master',
    title: 'City Master',
    description: 'Complete all tours in a city',
    icon: 'crown',
  },
  night_owl: {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Complete a tour after 6 PM',
    icon: 'moon',
  },
  early_bird: {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Complete a tour before 9 AM',
    icon: 'sunrise',
  },
  offline_adventurer: {
    id: 'offline_adventurer',
    title: 'Offline Adventurer',
    description: 'Complete a tour in offline mode',
    icon: 'wifi-off',
  },
};

// Tour title → badge ID mapping for specific tour badges
const TOUR_BADGE_MAP: Record<string, BadgeId> = {
  'Heritage Walk': 'heritage_explorer',
  'Temple Trail': 'temple_pilgrim',
  'Garden City': 'nature_lover',
};

// ---------------------------------------------------------------------------
// Badge Evaluator — After a tour is completed, determine which new badges
// the user has earned
// ---------------------------------------------------------------------------

export function evaluateBadges(
  session: TourSession,
  completedTourCount: number,
  totalToursInCity: number,
  earnedBadgeIds: Set<BadgeId>,
  isOffline: boolean,
): BadgeId[] {
  const newBadges: BadgeId[] = [];

  // 1. First tour badge
  if (!earnedBadgeIds.has('first_tour')) {
    newBadges.push('first_tour');
  }

  // 2. Specific tour badges
  const tourBadge = TOUR_BADGE_MAP[session.title];
  if (tourBadge && !earnedBadgeIds.has(tourBadge)) {
    newBadges.push(tourBadge);
  }

  // 3. Speed walker — tour completed in under 30 minutes
  if (!earnedBadgeIds.has('speed_walker') && session.totalTimeSeconds > 0 && session.totalTimeSeconds < 1800) {
    newBadges.push('speed_walker');
  }

  // 4. Marathon tourist — 5 tours completed (including this one)
  if (!earnedBadgeIds.has('marathon_tourist') && completedTourCount >= 5) {
    newBadges.push('marathon_tourist');
  }

  // 5. City master — all tours in the city completed
  if (!earnedBadgeIds.has('city_master') && completedTourCount >= totalToursInCity && totalToursInCity > 0) {
    newBadges.push('city_master');
  }

  // 6. Night owl — completed after 6 PM
  if (!earnedBadgeIds.has('night_owl') && session.completedAt) {
    const hour = new Date(session.completedAt).getHours();
    if (hour >= 18) {
      newBadges.push('night_owl');
    }
  }

  // 7. Early bird — completed before 9 AM
  if (!earnedBadgeIds.has('early_bird') && session.completedAt) {
    const hour = new Date(session.completedAt).getHours();
    if (hour < 9) {
      newBadges.push('early_bird');
    }
  }

  // 8. Offline adventurer
  if (!earnedBadgeIds.has('offline_adventurer') && isOffline) {
    newBadges.push('offline_adventurer');
  }

  return newBadges;
}

export function getAllBadges(): Badge[] {
  return Object.values(BADGE_CATALOG).map((b) => ({
    ...b,
    earnedAt: null,
  }));
}
