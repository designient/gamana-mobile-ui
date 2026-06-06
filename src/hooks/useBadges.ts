import { useState, useCallback, useEffect } from 'react';
import type { Badge, BadgeId, TourSession } from '../types';
import { getEarnedBadges, awardBadge, getCompletedTourCount } from '../lib/localDb';
import { evaluateBadges, BADGE_CATALOG } from '../lib/badges';
import { cityPacks } from '../lib/seed-data';

export function useBadges() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [newlyEarned, setNewlyEarned] = useState<Badge[]>([]);

  useEffect(() => {
    setBadges(getEarnedBadges());
  }, []);

  const checkAndAward = useCallback((session: TourSession, isOffline: boolean): Badge[] => {
    const existing = getEarnedBadges();
    const earnedIds = new Set<BadgeId>(existing.map((b) => b.id));
    const completedCount = getCompletedTourCount();
    const totalToursInCity = cityPacks.length;

    const newBadgeIds = evaluateBadges(session, completedCount, totalToursInCity, earnedIds, isOffline);

    const awarded: Badge[] = newBadgeIds.map((id) => ({
      ...BADGE_CATALOG[id],
      earnedAt: new Date().toISOString(),
      tourId: session.tourId,
    }));

    awarded.forEach((b) => awardBadge(b));

    const allBadges = [...existing, ...awarded];
    setBadges(allBadges);
    setNewlyEarned(awarded);

    return awarded;
  }, []);

  const clearNewlyEarned = useCallback(() => {
    setNewlyEarned([]);
  }, []);

  return { badges, newlyEarned, checkAndAward, clearNewlyEarned };
}
