import type { Experience } from '../types/experience';
import type { ExperienceSheetFilters } from '../components/experiences/ExperienceFilterSheet';

export function applySheetFilters(
  experiences: Experience[],
  sheet: ExperienceSheetFilters,
): Experience[] {
  return experiences.filter((e) => {
    if (
      sheet.categories.length > 0 &&
      !sheet.categories.some((c) => e.category.toLowerCase().includes(c.toLowerCase()))
    ) {
      return false;
    }

    if (sheet.duration) {
      const mins = e.durationMinutes ?? 0;
      if (sheet.duration === '< 1h' && mins >= 60) return false;
      if (sheet.duration === '1–3h' && (mins < 60 || mins > 180)) return false;
      if (sheet.duration === 'Half Day' && (mins < 180 || mins > 300)) return false;
      if (sheet.duration === 'Full Day' && mins < 300) return false;
    }

    if (sheet.type === 'guided' && e.experienceType === 'Self-Guided Audio Tour') {
      return false;
    }
    if (sheet.type === 'audio' && e.experienceType !== 'Self-Guided Audio Tour') {
      return false;
    }

    if (
      sheet.languages.length > 0 &&
      !sheet.languages.some((lang) =>
        e.languages.some((l) => l.toLowerCase() === lang.toLowerCase()),
      )
    ) {
      return false;
    }

    if (sheet.maxPrice != null && (e.priceFrom ?? 0) > sheet.maxPrice) {
      return false;
    }

    const isOnRequest = e.capacityType === 'on_request' || !e.instantConfirmation;
    if (sheet.bookingType === 'instant' && isOnRequest) return false;
    if (sheet.bookingType === 'on_request' && !isOnRequest) return false;

    if (sheet.difficulty) {
      const level = e.difficultyLevel ?? 'not_specified';
      const target = sheet.difficulty.toLowerCase();
      if (target === 'easy' && level !== 'easy') return false;
      if (target === 'moderate' && level !== 'moderate') return false;
      if (target === 'strenuous' && level !== 'challenging') return false;
    }

    return true;
  });
}
