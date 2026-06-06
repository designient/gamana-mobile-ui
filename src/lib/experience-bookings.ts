import type { ExperienceTab } from '../types/experience';

const STORAGE_KEY = 'gamana_experience_bookings';

export interface ExperienceBookingRecord {
  id: string;
  experienceId: string;
  slug: string;
  title: string;
  heroImageUrl?: string;
  category: string;
  uiTabIntent: ExperienceTab;
  operatorName: string;
  bookedAt: string;
}

function load(): ExperienceBookingRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function save(records: ExperienceBookingRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function getExperienceBookings(): ExperienceBookingRecord[] {
  return load().sort(
    (a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime(),
  );
}

export function recordExperienceBooking(
  record: Omit<ExperienceBookingRecord, 'id' | 'bookedAt'> & { bookedAt?: string },
): ExperienceBookingRecord {
  const bookedAt = record.bookedAt ?? new Date().toISOString();
  const items = load();
  const existingIdx = items.findIndex((b) => b.experienceId === record.experienceId);
  const entry: ExperienceBookingRecord = {
    id: existingIdx >= 0 ? items[existingIdx].id : crypto.randomUUID(),
    experienceId: record.experienceId,
    slug: record.slug,
    title: record.title,
    heroImageUrl: record.heroImageUrl,
    category: record.category,
    uiTabIntent: record.uiTabIntent,
    operatorName: record.operatorName,
    bookedAt,
  };
  if (existingIdx >= 0) {
    items[existingIdx] = entry;
  } else {
    items.unshift(entry);
  }
  save(items);
  window.dispatchEvent(new CustomEvent('gamana_collection_changed'));
  return entry;
}
