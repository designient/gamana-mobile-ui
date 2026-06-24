import type {
  Experience,
  ExperienceGroupType,
  ExperienceReviewSummary,
  ItineraryStop,
} from '../types/experience';

export const OPERATOR_NAMES: Record<string, string> = {
  'vendor-karnataka-heritage': 'Karnataka Heritage Guides',
  'vendor-blr-food': 'Bengaluru Food Trails',
  'vendor-blr-nature': 'Garden City Nature Co.',
  'vendor-blr-spiritual': 'Sacred South Tours',
  'vendor-blr-daytrips': 'Day Trip Karnataka',
  'vendor-blr-workshops': 'Home Kitchen Experiences',
  'vendor-blr-adventure': 'South Adventure Outfitters',
  'vendor-blr-tickets': 'City Attractions Desk',
  'vendor-blr-crafts': 'Silk Lane Cooperative',
  'vendor-blr-night': 'After Dark Bengaluru',
  'vendor-blr-transport': 'BLR Airport Transfers',
};

export function resolveOperatorName(exp: Pick<Experience, 'source' | 'sourceVendorId' | 'operatorDisplayName'>): string {
  if (exp.operatorDisplayName) return exp.operatorDisplayName;
  if (exp.source === 'gamana_native') return 'Gamana Experiences';
  if (exp.sourceVendorId && OPERATOR_NAMES[exp.sourceVendorId]) {
    return OPERATOR_NAMES[exp.sourceVendorId];
  }
  return 'Partner Operator';
}

export function mockReviews(
  count: number,
  averageRating: number,
  quotes: ExperienceReviewSummary['sampleQuotes'],
): ExperienceReviewSummary {
  return { count, averageRating, sampleQuotes: quotes };
}

export function pickupItinerary(city: string, mainStop: ItineraryStop): ItineraryStop[] {
  return [
    { id: 'pickup', title: 'Pickup / meeting point', subtitle: city },
    { ...mainStop, isMainStop: true },
    { id: 'return', title: 'Return', subtitle: city },
  ];
}

export interface BokunRichDefaults {
  operatorDisplayName?: string;
  freeCancellationHours?: number;
  reserveNowPayLater?: boolean;
  groupType?: ExperienceGroupType;
}

export function bokunDefaults(vendorId: string): BokunRichDefaults {
  return {
    operatorDisplayName: OPERATOR_NAMES[vendorId],
    freeCancellationHours: 24,
    reserveNowPayLater: true,
    groupType: 'small_group',
  };
}

function hashId(id: string, salt = ''): number {
  const str = id + salt;
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

function seededInt(id: string, salt: string, min: number, max: number): number {
  const range = max - min + 1;
  return min + (hashId(id, salt) % range);
}

export function seedExtraFields(exp: Partial<Experience>): Partial<Experience> {
  const id = exp.id ?? '';
  const title = (exp.title ?? '').toLowerCase();
  const slug = (exp.slug ?? '').toLowerCase();
  const category = (exp.category ?? '').toLowerCase();

  const isPrivate =
    slug === 'silk-weaving-workshop' || title.includes('private');

  const isPremiumPrivate =
    slug.includes('silk-weaving') ||
    title.includes('private') ||
    isPrivate;

  const groupSizeMax = isPremiumPrivate ? 4 : 12;

  let bookingsThisWeek: number;
  if (
    category.includes('heritage') ||
    category.includes('food') ||
    category.includes('walking')
  ) {
    bookingsThisWeek = seededInt(id, 'bookings', 8, 18);
  } else if (
    category.includes('workshop') ||
    category.includes('spiritual') ||
    category.includes('craft') ||
    category.includes('shopping') ||
    category.includes('classes')
  ) {
    bookingsThisWeek = seededInt(id, 'bookings', 0, 5);
  } else {
    bookingsThisWeek = seededInt(id, 'bookings', 4, 10);
  }

  const policy = (exp.cancellationPolicy ?? '').toLowerCase();
  const freeCancellation =
    policy.includes('free') || policy.includes('24h') || policy.includes('48h');

  return { groupSizeMax, isPrivate, bookingsThisWeek, freeCancellation };
}
