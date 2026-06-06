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
