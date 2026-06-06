import { experienceSeedData } from './experience-seed-data';
import { toListItemView } from './experience-mappers';
import { OPERATOR_NAMES, resolveOperatorName } from './experience-seed-helpers';
import type {
  AvailabilitySlot,
  BookingEvent,
  BookingHandoff,
  DifficultyLevel,
  Experience,
  ExperienceAvailability,
  ExperienceFilterMeta,
  ExperienceFilters,
  ExperienceListItemView,
  ExperienceSort,
  ExperienceTab,
} from '../types/experience';

const AVAILABILITY_CACHE_TTL_MS = 5 * 60 * 1000;
const availabilityCache = new Map<string, ExperienceAvailability>();

function publishedBookable(exp: Experience): boolean {
  return exp.publicationStatus === 'published' && exp.bookableInApp;
}

function filterByCity(experiences: Experience[], city: string): Experience[] {
  return experiences.filter(
    (e) => e.city.toLowerCase() === city.toLowerCase() && publishedBookable(e),
  );
}

function filterByTab(experiences: Experience[], tab: ExperienceTab): Experience[] {
  return experiences.filter((e) => e.uiTabIntent === tab);
}

function applyFilters(experiences: Experience[], filters: ExperienceFilters): Experience[] {
  return experiences.filter((e) => {
    if (filters.category && e.category !== filters.category) return false;
    if (filters.experienceType && e.experienceType !== filters.experienceType) return false;
    if (filters.difficulty && e.difficultyLevel !== filters.difficulty) return false;
    if (filters.priceMin != null && (e.priceFrom ?? 0) < filters.priceMin) return false;
    if (filters.priceMax != null && (e.priceFrom ?? Infinity) > filters.priceMax) return false;
    if (filters.durationMin != null && (e.durationMinutes ?? 0) < filters.durationMin) return false;
    if (filters.durationMax != null && (e.durationMinutes ?? Infinity) > filters.durationMax) return false;
    if (filters.pickupAvailable != null && e.pickupAvailable !== filters.pickupAvailable) return false;
    if (filters.instantConfirmation != null && e.instantConfirmation !== filters.instantConfirmation) return false;
    if (filters.language && !e.languages.some((l) => l.toLowerCase() === filters.language!.toLowerCase())) {
      return false;
    }
    if (filters.minAge != null && (e.minAge ?? 0) > filters.minAge) return false;
    if (filters.ratingMin != null && (e.ratingValue ?? 0) < filters.ratingMin) return false;
    return true;
  });
}

function sortExperiences(experiences: Experience[], sort: ExperienceSort): Experience[] {
  const copy = [...experiences];
  switch (sort) {
    case 'price_asc':
      return copy.sort((a, b) => (a.priceFrom ?? 0) - (b.priceFrom ?? 0));
    case 'price_desc':
      return copy.sort((a, b) => (b.priceFrom ?? 0) - (a.priceFrom ?? 0));
    case 'duration_asc':
      return copy.sort((a, b) => (a.durationMinutes ?? 0) - (b.durationMinutes ?? 0));
    case 'duration_desc':
      return copy.sort((a, b) => (b.durationMinutes ?? 0) - (a.durationMinutes ?? 0));
    case 'rating':
      return copy.sort((a, b) => (b.ratingValue ?? 0) - (a.ratingValue ?? 0));
    case 'newly_added':
      return copy.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    case 'recommended':
    default:
      return copy.sort((a, b) => {
        const scoreA =
          a.qualityScore +
          (a.hasLinkedStory ? 15 : 0) +
          (a.ratingValue ?? 0) * 2 +
          (a.instantConfirmation ? 5 : 0);
        const scoreB =
          b.qualityScore +
          (b.hasLinkedStory ? 15 : 0) +
          (b.ratingValue ?? 0) * 2 +
          (b.instantConfirmation ? 5 : 0);
        return scoreB - scoreA;
      });
  }
}

const TOURS_CATEGORIES = [
  'Heritage',
  'Walking',
  'Food & Drink',
  'Spiritual',
  'Day Trips',
  'Adventure',
];

const ACTIVITIES_CATEGORIES = [
  'Workshops & Classes',
  'Water Activities',
  'Adventure',
  'Attractions & Tickets',
  'Nature & Wildlife',
  'Nightlife & Entertainment',
  'Shopping & Local Crafts',
  'Other',
  'Transport & Transfers',
];

export function getFilterMeta(tab: ExperienceTab, city: string): ExperienceFilterMeta {
  const base = filterByTab(filterByCity(experienceSeedData, city), tab);
  const categories =
    tab === 'tours'
      ? TOURS_CATEGORIES.filter((c) => base.some((e) => e.category === c))
      : ACTIVITIES_CATEGORIES.filter((c) => base.some((e) => e.category === c));

  const difficulties = [
    ...new Set(base.map((e) => e.difficultyLevel).filter(Boolean)),
  ] as DifficultyLevel[];

  const languages = [...new Set(base.flatMap((e) => e.languages))].sort();
  const experienceTypes = [...new Set(base.map((e) => e.experienceType))].sort();

  return { categories, difficulties, languages, experienceTypes };
}

export interface ListExperiencesParams {
  city: string;
  tab: ExperienceTab;
  filters?: ExperienceFilters;
  sort?: ExperienceSort;
  page?: number;
  limit?: number;
}

export interface ListExperiencesResult {
  items: Experience[];
  listViews: ExperienceListItemView[];
  total: number;
  page: number;
  limit: number;
}

const MOCK_DELAY_MS = 280;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_DELAY_MS));
}

export async function listExperiences(params: ListExperiencesParams): Promise<ListExperiencesResult> {
  const {
    city,
    tab,
    filters = {},
    sort = 'recommended',
    page = 1,
    limit = 20,
  } = params;

  let results = filterByTab(filterByCity(experienceSeedData, city), tab);
  results = applyFilters(results, filters);
  results = sortExperiences(results, sort);

  const total = results.length;
  const start = (page - 1) * limit;
  const items = results.slice(start, start + limit);
  const listViews = items.map(toListItemView);

  return delay({ items, listViews, total, page, limit });
}

export async function getRecommendedExperiences(params: {
  city: string;
  limit?: number;
}): Promise<ExperienceListItemView[]> {
  const { city, limit = 6 } = params;
  const sorted = sortExperiences(filterByCity(experienceSeedData, city), 'recommended');
  return delay(sorted.slice(0, limit).map(toListItemView));
}

export function getExperienceByIdSync(id: string): Experience | undefined {
  return experienceSeedData.find((e) => e.id === id && publishedBookable(e));
}

export function getExperienceBySlugSync(slug: string): Experience | undefined {
  return experienceSeedData.find((e) => e.slug === slug && publishedBookable(e));
}

export function getExperiencesByIds(ids: string[]): ExperienceListItemView[] {
  const idSet = new Set(ids);
  return experienceSeedData
    .filter((e) => idSet.has(e.id) && publishedBookable(e))
    .map(toListItemView);
}

export async function getExperiencesByIdsAsync(ids: string[]): Promise<ExperienceListItemView[]> {
  return delay(getExperiencesByIds(ids));
}

export async function getExperienceBySlug(slug: string): Promise<Experience | undefined> {
  return delay(getExperienceBySlugSync(slug));
}

function cacheKey(experienceId: string, dateFrom: string, dateTo: string): string {
  return `${experienceId}:${dateFrom}:${dateTo}`;
}

function generateMockSlots(
  experienceId: string,
  dateFrom: string,
  dateTo: string,
  basePrice: number,
): AvailabilitySlot[] {
  const slots: AvailabilitySlot[] = [];
  const start = new Date(dateFrom);
  const end = new Date(dateTo);
  const times = ['07:00', '09:30', '14:00', '16:30'];
  let day = new Date(start);

  while (day <= end && slots.length < 12) {
    const dateStr = day.toISOString().slice(0, 10);
    for (const t of times) {
      if (slots.length >= 12) break;
      slots.push({
        id: `${experienceId}-${dateStr}-${t}`,
        date: dateStr,
        startTime: t,
        vacancies: Math.floor(Math.random() * 8) + 2,
        pricePerPerson: basePrice + Math.floor(Math.random() * 400),
        currency: 'INR',
        pickupOptions: ['Hotel pickup', 'Meet on location'],
      });
    }
    day.setDate(day.getDate() + 1);
  }
  return slots;
}

export async function getAvailability(
  experienceId: string,
  dateFrom: string,
  dateTo: string,
  options?: { forceRefresh?: boolean },
): Promise<ExperienceAvailability> {
  const key = cacheKey(experienceId, dateFrom, dateTo);
  const cached = availabilityCache.get(key);
  if (cached && !options?.forceRefresh && Date.now() - cached.cachedAt < AVAILABILITY_CACHE_TTL_MS) {
    return delay(cached);
  }

  const exp = experienceSeedData.find((e) => e.id === experienceId);
  const basePrice = exp?.priceFrom ?? 2000;

  await new Promise((r) => setTimeout(r, MOCK_DELAY_MS + 200));

  if (Math.random() < 0.05) {
    throw new Error('Availability service temporarily unavailable');
  }

  const result: ExperienceAvailability = {
    experienceId,
    dateFrom,
    dateTo,
    slots: generateMockSlots(experienceId, dateFrom, dateTo, basePrice),
    cachedAt: Date.now(),
  };
  availabilityCache.set(key, result);
  return result;
}

export async function getBookingLink(experienceId: string): Promise<BookingHandoff> {
  await new Promise((r) => setTimeout(r, MOCK_DELAY_MS));
  const exp = experienceSeedData.find((e) => e.id === experienceId);
  if (!exp) throw new Error('Experience not found');

  const operatorName = resolveOperatorName(exp);

  const url = `https://book.example.com/gamana/${exp.slug}?ref=gamana_app&track=${experienceId}`;

  return { experienceId, url, operatorName };
}

export function postBookingEvent(event: BookingEvent): void {
  console.info('[booking_event]', event);
}
