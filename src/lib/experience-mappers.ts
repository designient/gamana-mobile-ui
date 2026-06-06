import type {
  Experience,
  ExperienceCtaLabel,
  ExperienceListItemView,
  ExperiencePromoBadge,
  ExperienceSourceLabel,
} from '../types/experience';

export function formatDurationLabel(minutes?: number): string | undefined {
  if (!minutes) return undefined;
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h >= 8) return `${h} hours`;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function formatDurationRangeLabel(minutes?: number): string | undefined {
  if (!minutes) return undefined;
  const h = Math.floor(minutes / 60);
  if (h < 1) return `${minutes} min`;
  if (minutes % 60 > 0 && h < 8) return `${h} - ${h + 1} hours`;
  return formatDurationLabel(minutes);
}

export function formatPriceLabel(priceFrom?: number, currency = 'INR'): string | undefined {
  if (priceFrom == null) return undefined;
  if (currency === 'INR') return `From ₹${priceFrom.toLocaleString('en-IN')}`;
  return `From ${currency} ${priceFrom}`;
}

export const PROMO_BADGE_LABELS: Record<ExperiencePromoBadge, string> = {
  gamana_certified: 'Gamana Certified',
  selling_out: 'Selling Out Shortly',
  top_pick: 'Top Pick',
  new_activity: 'New Activity',
};

export const PROMO_BADGE_STYLES: Record<ExperiencePromoBadge, string> = {
  gamana_certified: 'bg-gamana-600 text-white',
  selling_out: 'bg-rose-500 text-white',
  top_pick: 'bg-gamana-500 text-white',
  new_activity: 'bg-slate-500 text-white',
};

export function deriveBadges(exp: Experience): string[] {
  const badges: string[] = [];
  if (exp.pickupAvailable) badges.push('Pickup');
  if (exp.familyFriendly) badges.push('Family friendly');
  if (exp.instantConfirmation) badges.push('Instant');
  if (exp.capacityType === 'limited') badges.push('Limited spots');
  if (exp.capacityType === 'on_request') badges.push('On request');
  if (exp.rawAttributes?.includes('wheelchair')) badges.push('Accessible');
  if (exp.rawAttributes?.includes('small_group')) badges.push('Small group');
  if (exp.rawAttributes?.includes('private')) badges.push('Private');
  if (exp.rawAttributes?.includes('skip_the_line')) badges.push('Skip the line');
  if (exp.groupType === 'private') badges.push('Private option available');
  return badges;
}

function resolvePromoBadge(exp: Experience): ExperiencePromoBadge | undefined {
  const created = new Date(exp.createdAt).getTime();
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  if (created >= thirtyDaysAgo) return 'new_activity';
  if (exp.source === 'gamana_native' && exp.qualityScore >= 90) return 'gamana_certified';
  if (exp.capacityType === 'limited') return 'selling_out';
  if (exp.qualityScore >= 90) return 'top_pick';
  return undefined;
}

function buildDetailsLine(exp: Experience, badges: string[]): string | undefined {
  const parts: string[] = [];
  const duration = formatDurationRangeLabel(exp.durationMinutes);
  if (duration) parts.push(duration);

  const featureTokens = badges.filter((b) =>
    ['Pickup', 'Instant', 'Skip the line', 'Private option available', 'Limited spots'].includes(b),
  );
  parts.push(...featureTokens.slice(0, 2));

  if (exp.instantConfirmation && !parts.includes('Instant')) {
    parts.push('Instant confirmation');
  }

  return parts.length > 0 ? parts.join(' · ') : undefined;
}

function resolveSourceLabel(exp: Experience): ExperienceSourceLabel {
  if (exp.source === 'gamana_native' && exp.experienceType === 'Self-Guided Audio Tour') {
    return 'Audio Tour';
  }
  if (
    exp.experienceType === 'Guided Tour' ||
    exp.experienceType === 'Day Trip' ||
    exp.uiTabIntent === 'tours'
  ) {
    return 'Guided Tour';
  }
  return 'Activity';
}

function resolveCtaLabel(exp: Experience): ExperienceCtaLabel {
  if (exp.source === 'gamana_native') return 'Unlock';
  if (exp.capacityType === 'on_request' || !exp.instantConfirmation) {
    return 'Confirm availability';
  }
  return 'Book';
}

export function toListItemView(exp: Experience): ExperienceListItemView {
  const badges = deriveBadges(exp);
  return {
    id: exp.id,
    slug: exp.slug,
    title: exp.title,
    summary: exp.gamanaEditorialSummary ?? exp.shortDescription,
    imageUrl: exp.heroImageUrl,
    durationLabel: formatDurationLabel(exp.durationMinutes),
    priceLabel: formatPriceLabel(exp.priceFrom, exp.priceCurrency),
    priceFrom: exp.priceFrom,
    priceWas: exp.priceWas,
    priceCurrency: exp.priceCurrency,
    sourceLabel: resolveSourceLabel(exp),
    ctaLabel: resolveCtaLabel(exp),
    badges,
    hasLinkedStory: exp.hasLinkedStory,
    linkedStoryLabel: exp.linkedStoryLabel,
    ratingValue: exp.ratingValue,
    reviewCount: exp.reviewSummary?.count,
    cityLabel: exp.city,
    localityLabel: exp.locality,
    detailsLine: buildDetailsLine(exp, badges),
    promoBadge: resolvePromoBadge(exp),
  };
}

export const CATEGORY_MAP: Record<string, string> = {
  'city tour': 'Heritage',
  'walking tour': 'Walking',
  'food tour': 'Food & Drink',
  'cooking class': 'Workshops & Classes',
  adventure: 'Adventure',
  rafting: 'Water Activities',
  'temple tour': 'Spiritual',
  'museum ticket': 'Attractions & Tickets',
  'airport transfer': 'Transport & Transfers',
};

export function normalizeCategory(raw: string): string {
  const key = raw.toLowerCase().trim().replace(/[^\w\s]/g, '');
  if (CATEGORY_MAP[key]) return CATEGORY_MAP[key];
  for (const [phrase, category] of Object.entries(CATEGORY_MAP)) {
    if (key.includes(phrase)) return category;
  }
  return 'Other';
}
