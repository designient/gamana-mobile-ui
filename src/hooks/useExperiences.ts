import { useState, useEffect } from 'react';
import type { ExperienceSheetFilters } from '../components/experiences/ExperienceFilterSheet';
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
  sheetFilters?: ExperienceSheetFilters,
) {
  const [items, setItems] = useState<ExperienceListItemView[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const filtersSignature = JSON.stringify(filters);
  const sheetFiltersSignature = JSON.stringify(sheetFilters ?? {});

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    listExperiences({ city, tab, filters, sheetFilters, sort })
      .then((res) => {
        if (!cancelled) {
          setItems(res.listViews);
          setTotal(res.total);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [city, tab, filtersSignature, sort, sheetFiltersSignature]);

  return { items, total, isLoading };
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
