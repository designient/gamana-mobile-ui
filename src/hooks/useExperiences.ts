import { useState, useEffect } from 'react';
import {
  getExperienceBySlug,
  getRecommendedExperiences,
  listExperiences,
} from '../lib/experience-mock-api';
import type {
  Experience,
  ExperienceFilters,
  ExperienceListItemView,
  ExperienceSort,
  ExperienceTab,
} from '../types/experience';

export function useRecommendedExperiences(city: string, limit = 6) {
  const [items, setItems] = useState<ExperienceListItemView[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    getRecommendedExperiences({ city, limit })
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [city, limit]);

  return { items, isLoading };
}

export function useExperienceList(
  city: string,
  tab: ExperienceTab,
  filters: ExperienceFilters,
  sort: ExperienceSort,
) {
  const [items, setItems] = useState<ExperienceListItemView[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    listExperiences({ city, tab, filters, sort })
      .then((res) => {
        if (!cancelled) setItems(res.listViews);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [city, tab, filters, sort]);

  return { items, isLoading };
}

export function useExperienceDetail(slug: string | null) {
  const [experience, setExperience] = useState<Experience | null>(null);
  const [isLoading, setIsLoading] = useState(!!slug);

  useEffect(() => {
    if (!slug) {
      setExperience(null);
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    getExperienceBySlug(slug)
      .then((data) => {
        if (!cancelled) setExperience(data ?? null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { experience, isLoading };
}
