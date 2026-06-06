import type { BookingFlowState } from '../lib/experience-booking-flow';

export type { BookingFlowState } from '../lib/experience-booking-flow';

export type TrustLevel = 'verified' | 'legend' | 'mixed';

export type QuickMode = 'nearby' | 'quick_facts' | 'look_for' | 'respect' | 'stay_safe' | 'languages';

export type NarratorStyle = 'Historian' | 'Local' | 'Storyteller' | 'Explorer';

export interface City {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  timezone: string;
  description: string;
  image_url: string | null;
}

export interface Story {
  id: string;
  city_id: string;
  title: string;
  subtitle: string;
  why_this_matters: string;
  lat: number;
  lng: number;
  duration_seconds: number;
  trust_level: TrustLevel;
  is_featured: boolean;
  image_url: string | null;
  created_at: string;
  distance_meters?: number;
}

export interface Narrator {
  id: string;
  name: string;
  style: NarratorStyle;
  description: string;
  avatar_url: string | null;
  preview_audio_url: string | null;
}

export interface StoryNarration {
  id: string;
  story_id: string;
  narrator_id: string;
  audio_url: string;
  duration_seconds: number;
  narrator?: Narrator;
  story?: Story;
}

export interface ModeContent {
  id: string;
  city_id: string;
  mode: QuickMode;
  title: string;
  body: string;
  duration_seconds: number | null;
  audio_url: string | null;
  sort_order: number;
  trust_level: TrustLevel;
}

export interface PlaybackState {
  isPlaying: boolean;
  currentNarration: StoryNarration | null;
  currentStory: Story | null;
  progress: number;
  duration: number;
}

export interface LocationState {
  lat: number;
  lng: number;
  accuracy: number;
  isLoading: boolean;
  error: string | null;
  isWeak: boolean;
}

export type SourceType = 'academic' | 'oral' | 'archive' | 'news';
export type RelationshipType = 'nearby' | 'same_era' | 'same_theme' | 'same_route';
export type CueType = 'respect' | 'stay_safe' | 'languages';

export interface StorySource {
  id: string;
  story_id: string;
  label: string;
  url: string;
  source_type: SourceType;
  sort_order: number;
}

export interface StoryNotice {
  id: string;
  story_id: string;
  body: string;
  sort_order: number;
}

export interface StoryRelatedLink {
  id: string;
  story_id: string;
  related_story_id: string;
  relationship: RelationshipType;
  sort_order: number;
  title: string;
  subtitle: string;
  image_url: string | null;
  duration_seconds: number;
  trust_level: TrustLevel;
}

export interface StoryPracticalCue {
  id: string;
  story_id: string;
  cue_type: CueType;
  title: string;
  body: string;
  sort_order: number;
}

export interface CityPack {
  id: string;
  city_id: string;
  title: string;
  subtitle: string;
  image_url: string | null;
  story_count: number;
  total_duration_seconds: number;
  sort_order: number;
  coin_cost: number;
}

export interface Topic {
  id: string;
  city_id: string;
  title: string;
  subtitle: string;
  icon_name: string;
  story_count: number;
  sort_order: number;
}

export interface SavedItem {
  id: string;
  user_id: string;
  item_type: 'story' | 'pack' | 'city' | 'tour';
  item_id: string;
  created_at: string;
  story?: Story;
  pack?: CityPack;
}

export interface UserProfile {
  id: string;
  display_name: string;
  coin_balance: number;
  created_at: string;
}

export type TransactionType = 'welcome_bonus' | 'purchase' | 'story_unlock' | 'pack_unlock' | 'earn_reward' | 're_unlock' | 'coupon_redeem';

export interface CoinTransaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: TransactionType;
  reference_id: string | null;
  description: string;
  created_at: string;
}

export interface ContentAccessStatus {
  is_unlocked: boolean;
  is_expired: boolean;
  days_remaining: number;
  expires_at?: string;
  is_downloaded?: boolean;
}

export interface UnlockResult {
  success: boolean;
  new_balance?: number;
  error?: string;
  balance?: number;
}

export interface CoinPack {
  id: string;
  label: string;
  coin_amount: number;
  price_display: string;
  price_cents: number;
  is_popular: boolean;
  sort_order: number;
}

export type LibraryTab = 'nearby' | 'tours' | 'topics' | 'downloads';

export interface UserTour {
  id: string;
  user_id: string;
  city_id: string;
  title: string;
  description: string;
  is_shared: boolean;
  share_code: string | null;
  created_at: string;
  updated_at: string;
  stop_count?: number;
}

export interface UserTourStop {
  id: string;
  tour_id: string;
  story_id: string | null;
  pinned_lat: number | null;
  pinned_lng: number | null;
  pinned_label: string | null;
  sort_order: number;
  story?: Story;
}

export interface SearchResults {
  stories: Story[];
  topics: Topic[];
  narrators: Narrator[];
  cities: City[];
  total: number;
}

export type AppRoute =
  | { screen: 'home' }
  | { screen: 'empty' }
  | { screen: 'library' }
  | { screen: 'search' }
  | { screen: 'story_detail'; storyId: string }
  | { screen: 'coins' }
  | { screen: 'login' }
  | { screen: 'profile' }
  | { screen: 'profile_wishlist' }
  | { screen: 'profile_collection'; tab?: 'stories' | 'audio_tours' | 'my_tours' | 'bookings' }
  | { screen: 'alerts' }
  | { screen: 'explore_cities' }
  | { screen: 'request_story' }
  | { screen: 'walking_tour'; tourType: 'recommended' | 'user'; tourId: string }
  | { screen: 'family_tracking' }
  | { screen: 'create_tour' }
  | { screen: 'experiences_explore'; tab?: 'tours' | 'activities' }
  | { screen: 'experience_detail'; slug: string }
  | {
      screen: 'experience_booking';
      experienceId: string;
      slug: string;
      bookingUrl: string;
      operatorName: string;
      selectedDate?: string;
      selectedTime?: string | null;
    }
  | { screen: 'operator_profile'; vendorId: string; operatorName: string }
  | { screen: 'experience_saved' }
  | { screen: 'booking_timeslot'; flowState: BookingFlowState }
  | { screen: 'booking_pickup'; flowState: BookingFlowState }
  | { screen: 'booking_questions'; flowState: BookingFlowState }
  | { screen: 'booking_review'; flowState: BookingFlowState; operatorName: string }
  | {
      screen: 'on_request_status';
      status: 'pending' | 'confirmed' | 'rejected' | 'expired';
      experienceId: string;
      slug: string;
      operatorName: string;
      referenceCode: string;
      selectedDate: string;
    }
  | {
      screen: 'booking_confirmed';
      experienceId: string;
      slug: string;
      confirmationCode: string;
      selectedDate: string;
      selectedTime: string | null;
      isOnRequest: boolean;
    }
  | {
      screen: 'booking_failed';
      experienceId: string;
      slug: string;
      reason: 'sold_out' | 'payment_error';
    }
  | { screen: 'my_bookings' }
  | { screen: 'booking_detail'; bookingId: string }
  | { screen: 'pre_experience_brief'; bookingId: string }
  | { screen: 'meeting_point'; bookingId: string }
  | { screen: 'experience_completed'; bookingId: string }
  | { screen: 'rate_review'; bookingId: string }
  | { screen: 'cancel_booking'; bookingId: string }
  | {
      screen: 'cancellation_confirmed';
      bookingId: string;
      refundAmount: number;
      cancellationCode: string;
    }
  | { screen: 'refund_status'; bookingId: string }
  | { screen: 'notification_preview' };

export type { Experience, ExperienceListItemView } from './experience';
export type {
  ExperienceSource,
  ExperienceTab,
  ExperienceSort,
  ExperienceFilters,
} from './experience';

// ---------------------------------------------------------------------------
// Auth / Session
// ---------------------------------------------------------------------------
export interface Session {
  userId: string;
  token: string;
  expiresAt: string;
  displayName: string;
  email: string | null;
  phone: string | null;
}

// ---------------------------------------------------------------------------
// Organization
// ---------------------------------------------------------------------------
export type OrgStatus = 'active' | 'inactive' | 'expired';

export interface OrgColors {
  primary: string;
  accent: string;
}

export interface OrgCustomContent {
  faqUrl: string | null;
  privacyUrl: string | null;
  termsUrl: string | null;
  supportUrl: string | null;
  shareMessage: string | null;
}

export interface OrgPricingRules {
  storyCost: number;
  packMultiplier: number;
}

export interface OrgConfig {
  orgId: string | null;
  orgName: string;
  orgLogo: string | null;
  orgColors: OrgColors | null;
  introAudioUrl: string | null;
  enabledRegions: string[];
  enabledLanguages: string[];
  allowedNarratorIds: string[];
  pricingRules: OrgPricingRules | null;
  allowedNotificationTypes: string[];
  customContent: OrgCustomContent;
  status: OrgStatus;
}

export interface OrgMembership {
  orgId: string;
  orgName: string;
  orgLogo: string | null;
  status: OrgStatus;
}

// ---------------------------------------------------------------------------
// Connectivity
// ---------------------------------------------------------------------------
export interface ConnectivityState {
  isOnline: boolean;
  isWeak: boolean;
  lastOnlineAt: string | null;
}

// ---------------------------------------------------------------------------
// Downloads / Offline
// ---------------------------------------------------------------------------
export type DownloadStatus = 'none' | 'queued' | 'downloading' | 'ready' | 'failed' | 'stale';

export interface DownloadState {
  itemType: 'story' | 'tour' | 'pack';
  itemId: string;
  status: DownloadStatus;
  progress: number;
  downloadedAt: string | null;
  sizeBytes: number | null;
  error: string | null;
}

// ---------------------------------------------------------------------------
// Notification / Alerts
// ---------------------------------------------------------------------------
export type NotificationType = 'new_story' | 'new_tour' | 'promo' | 'org_update' | 'system';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  imageUrl: string | null;
  actionUrl: string | null;
  read: boolean;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Walking Tour Session
// ---------------------------------------------------------------------------
export type TourSessionStatus = 'preparing' | 'active' | 'paused' | 'completed';

export interface TourSession {
  id: string;
  tourType: 'recommended' | 'user';
  tourId: string;
  title: string;
  stops: TourSessionStop[];
  currentStopIndex: number;
  status: TourSessionStatus;
  startedAt: string | null;
  completedAt: string | null;
  totalDistanceMeters: number;
  totalTimeSeconds: number;
}

export interface TourSessionStop {
  id: string;
  storyId: string | null;
  story?: Story;
  pinnedLabel?: string;
  lat: number;
  lng: number;
  status: 'locked' | 'approaching' | 'arrived' | 'completed';
  arrivedAt: string | null;
  playedAt: string | null;
}

// ---------------------------------------------------------------------------
// Badges
// ---------------------------------------------------------------------------
export type BadgeId =
  | 'first_tour'
  | 'heritage_explorer'
  | 'temple_pilgrim'
  | 'nature_lover'
  | 'speed_walker'
  | 'marathon_tourist'
  | 'city_master'
  | 'night_owl'
  | 'early_bird'
  | 'offline_adventurer';

export interface Badge {
  id: BadgeId;
  title: string;
  description: string;
  icon: string;
  earnedAt: string | null;
  tourId?: string;
}

// ---------------------------------------------------------------------------
// Family Tracking
// ---------------------------------------------------------------------------
export type MemberVisibility = 'visible' | 'hidden' | 'not_sharing';

export type TrackingMode = 'off' | 'foreground' | 'background';

export type MemberFreshness = 'fresh' | 'delayed' | 'stale' | 'offline' | 'expired';

export type BatteryTier = 'good' | 'medium' | 'low' | 'critical';

export type MemberRole = 'admin' | 'member' | 'child';

export interface FamilyGroup {
  id: string;
  name: string;
  ownerId: string;
  inviteCode: string;
  members: FamilyMember[];
  createdAt: string;
}

export interface FamilyMember {
  uid: string;
  displayName: string;
  avatarUrl: string | null;
  initials: string;
  color: string;
  visibility: MemberVisibility;
  trackingMode: TrackingMode;
  location: MemberLocation | null;
  battery: MemberBattery | null;
  role: MemberRole;
  dateOfBirth: string | null;
  isSelf: boolean;
}

export interface MemberLocation {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: string;
}

export interface MemberBattery {
  level: number;
  charging: boolean;
  timestamp: string;
}

export function getBatteryTier(level: number): BatteryTier {
  if (level <= 3) return 'critical';
  if (level < 15) return 'low';
  if (level <= 50) return 'medium';
  return 'good';
}

export function getMemberFreshness(timestamp: string | null | undefined): MemberFreshness {
  if (!timestamp) return 'offline';
  const ageMs = Date.now() - new Date(timestamp).getTime();
  const ageMin = ageMs / 60000;
  if (ageMin <= 2) return 'fresh';
  if (ageMin <= 10) return 'delayed';
  if (ageMin <= 15) return 'stale';
  if (ageMin <= 30) return 'offline';
  return 'expired';
}

export function getAgeFromDob(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function isAdmin(member: FamilyMember): boolean {
  return member.role === 'admin';
}

export function isChild(member: FamilyMember): boolean {
  return member.role === 'child';
}

// ---------------------------------------------------------------------------
// Family Messages
// ---------------------------------------------------------------------------
export type FamilyMessageType = 'text' | 'location_ping' | 'alert' | 'system';

export interface FamilyMessage {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  senderAvatarUrl: string | null;
  senderInitials: string;
  senderColor: string;
  type: FamilyMessageType;
  text: string;
  location?: { lat: number; lng: number };
  createdAt: string;
  readBy: string[];
}
