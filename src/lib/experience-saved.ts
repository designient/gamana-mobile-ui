const STORAGE_KEY = 'gamana_saved_experiences';

export function getSavedExperienceIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

export function isExperienceSaved(id: string): boolean {
  return getSavedExperienceIds().includes(id);
}

export function toggleExperienceSaved(id: string): boolean {
  const ids = getSavedExperienceIds();
  const exists = ids.includes(id);
  const next = exists ? ids.filter((x) => x !== id) : [...ids, id];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('gamana_wishlist_changed'));
  return !exists;
}
