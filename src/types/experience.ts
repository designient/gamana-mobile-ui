export type ExperienceSource = 'gamana_native' | 'bokun';
export type CapacityType = 'free_sale' | 'limited' | 'on_request' | 'sold_out';
export type MeetingType = 'meet_on_location' | 'pick_up' | 'meet_or_pickup';
export type ExperiencePublicationStatus = 'draft' | 'review' | 'published' | 'archived';
export type DifficultyLevel = 'easy' | 'moderate' | 'challenging' | 'not_specified';
export type ExperienceTab = 'tours' | 'activities';
export type ExperienceSort =
  | 'recommended'
  | 'price_asc'
  | 'price_desc'
  | 'duration_asc'
  | 'duration_desc'
  | 'rating'
  | 'newly_added';

export type ExperienceGroupType = 'private' | 'small_group' | 'shared';

export type ExperienceFormat =
  | 'walking_tour'
  | 'food_drink'
  | 'attraction'
  | 'day_trip'
  | 'workshop'
  | 'nature_wildlife'
  | 'cruise_boat'
  | 'adventure'
  | 'cultural_show'
  | 'social_nightlife';

export type VibeTag =
  | 'chill'
  | 'social'
  | 'active'
  | 'deep_dive'
  | 'date_worthy'
  | 'hidden_gem'
  | 'iconic'
  | 'morning'
  | 'sunset'
  | 'solo_friendly';

export interface ItineraryStop {
  id: string;
  title: string;
  subtitle?: string;
  activities?: string[];
  isMainStop?: boolean;
}

export interface ExperienceReviewQuote {
  author: string;
  text: string;
  rating: number;
}

export interface ExperienceReviewSummary {
  count: number;
  averageRating: number;
  sampleQuotes?: ExperienceReviewQuote[];
}

export interface Experience {
  id: string;
  slug: string;
  source: ExperienceSource;
  sourceVendorId?: string;
  sourceProductId?: string;

  title: string;
  shortDescription: string;
  longDescription?: string;
  gamanaEditorialSummary?: string;

  heroImageUrl?: string;
  photoUrls: string[];

  category: string;
  subcategory?: string;
  experienceType: string;
  tags: string[];
  uiTabIntent: ExperienceTab;

  city: string;
  country?: string;
  locality?: string;
  latitude?: number;
  longitude?: number;

  durationMinutes?: number;
  languages: string[];
  difficultyLevel?: DifficultyLevel;
  minAge?: number;
  familyFriendly?: boolean;

  priceFrom?: number;
  priceWas?: number;
  priceCurrency?: string;
  ratingValue?: number;
  ratingSource?: 'tripadvisor' | 'internal' | 'none';

  pickupAvailable: boolean;
  meetingType?: MeetingType;
  meetingPointText?: string;

  capacityType?: CapacityType;
  instantConfirmation?: boolean;

  inclusions: string[];
  exclusions: string[];
  knowBeforeYouGo?: string;
  cancellationPolicy?: string;

  operatorDisplayName?: string;
  highlights?: string[];
  itinerary?: ItineraryStop[];
  whatToBring?: string[];
  notSuitableFor?: string[];
  importantInformation?: string[];
  reserveNowPayLater?: boolean;
  freeCancellationHours?: number;
  groupType?: ExperienceGroupType;
  reviewSummary?: ExperienceReviewSummary;

  hasLinkedStory: boolean;
  linkedStoryId?: string;
  linkedStoryLabel?: string;

  qualityScore: number;
  publicationStatus: ExperiencePublicationStatus;
  bookableInApp: boolean;

  rawCategory?: string;
  rawAttributes?: string[];

  experienceFormat?: ExperienceFormat;
  vibeTag?: VibeTag;
  groupSizeMax?: number;
  isPrivate?: boolean;
  bookingsThisWeek?: number;
  freeCancellation?: boolean;

  createdAt: string;
  updatedAt: string;
}

export type ExperienceSourceLabel = 'Audio Tour' | 'Guided Tour' | 'Activity';
export type ExperienceCtaLabel = 'Unlock' | 'Book' | 'Confirm availability';

export type ExperiencePromoBadge =
  | 'gamana_certified'
  | 'selling_out'
  | 'top_pick'
  | 'new_activity';

export interface ExperienceListItemView {
  id: string;
  slug: string;
  title: string;
  summary?: string;
  imageUrl?: string;
  durationLabel?: string;
  priceLabel?: string;
  priceFrom?: number;
  priceWas?: number;
  priceCurrency?: string;
  sourceLabel: ExperienceSourceLabel;
  ctaLabel: ExperienceCtaLabel;
  badges: string[];
  hasLinkedStory: boolean;
  linkedStoryLabel?: string;
  ratingValue?: number;
  reviewCount?: number;
  cityLabel?: string;
  localityLabel?: string;
  detailsLine?: string;
  promoBadge?: ExperiencePromoBadge;
  experienceFormat: ExperienceFormat;
  vibeTag: VibeTag;
  groupSizeMax: number;
  isPrivate: boolean;
  bookingsThisWeek: number;
  freeCancellation: boolean;
  instantConfirmation?: boolean;
}

export interface ExperienceFilters {
  category?: string;
  experienceType?: string;
  difficulty?: DifficultyLevel;
  priceMin?: number;
  priceMax?: number;
  durationMin?: number;
  durationMax?: number;
  pickupAvailable?: boolean;
  instantConfirmation?: boolean;
  onRequest?: boolean;
  language?: string;
  minAge?: number;
  ratingMin?: number;
  availableTomorrow?: boolean;
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | null;
}

export interface ExperienceFilterMeta {
  categories: string[];
  difficulties: DifficultyLevel[];
  languages: string[];
  experienceTypes: string[];
}

export interface AvailabilitySlot {
  id: string;
  date: string;
  startTime: string;
  vacancies: number;
  pricePerPerson: number;
  currency: string;
  pickupOptions?: string[];
}

export interface ExperienceAvailability {
  experienceId: string;
  dateFrom: string;
  dateTo: string;
  slots: AvailabilitySlot[];
  cachedAt: number;
}

export interface BookingHandoff {
  experienceId: string;
  url: string;
  operatorName: string;
}

export type BookingEventType =
  | 'webview_opened'
  | 'confirmed'
  | 'abandoned'
  | 'failed';

export interface BookingEvent {
  experienceId: string;
  eventType: BookingEventType;
  timestamp: string;
}
