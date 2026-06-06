export type ExperienceAnalyticsEvent =
  | 'experience_list_viewed'
  | 'experience_card_opened'
  | 'experience_filter_applied'
  | 'experience_sort_changed'
  | 'experience_detail_viewed'
  | 'availability_checked'
  | 'date_selected'
  | 'slot_selected'
  | 'pax_updated'
  | 'booking_cta_clicked'
  | 'booking_webview_opened'
  | 'booking_confirmed'
  | 'booking_abandoned'
  | 'linked_story_clicked'
  | 'experience_detail_section_viewed';

export interface ExperienceAnalyticsPayload {
  experienceId?: string;
  source?: string;
  category?: string;
  city?: string;
  priceBucket?: string;
  hasLinkedStory?: boolean;
  bookingState?: string;
  [key: string]: unknown;
}

export function trackExperienceEvent(
  name: ExperienceAnalyticsEvent,
  payload: ExperienceAnalyticsPayload = {},
): void {
  console.info(`[experience_analytics] ${name}`, payload);
}

export function priceBucket(price?: number): string | undefined {
  if (price == null) return undefined;
  if (price < 1500) return 'budget';
  if (price < 3500) return 'mid';
  return 'premium';
}
