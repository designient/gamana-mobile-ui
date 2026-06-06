import type {
  Story, Narrator, StoryNarration, ModeContent, StorySource, StoryNotice,
  StoryRelatedLink, StoryPracticalCue, CityPack, Topic, SavedItem,
  UserProfile, CoinTransaction, CoinPack, ContentAccessStatus,
  UnlockResult, UserTour, UserTourStop, City, SearchResults,
  TourSession, Badge, BadgeId,
} from '../types';
import {
  narrators as seedNarrators,
  stories as seedStories,
  cities as seedCities,
  storyNarrations as seedNarrations,
  quickModeContent as seedModeContent,
  storySources as seedSources,
  storyNotices as seedNotices,
  storyRelated as seedRelated,
  storyPracticalCues as seedCues,
  cityPacks as seedCityPacks,
  cityPackStories as seedCityPackStories,
  topics as seedTopics,
  topicStories as seedTopicStories,
  coupons as seedCoupons,
} from './seed-data';
import { DEFAULT_USER_ID, BENGALURU_CITY_ID } from './constants';

function uuid(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

// ---------------------------------------------------------------------------
// localStorage helpers
// ---------------------------------------------------------------------------
function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

const KEYS = {
  profile: 'gamana_user_profile',
  unlocked: 'gamana_unlocked_content',
  transactions: 'gamana_coin_transactions',
  saved: 'gamana_saved_items',
  tours: 'gamana_user_tours',
  tourStops: 'gamana_user_tour_stops',
  couponRedemptions: 'gamana_coupon_redemptions',
  onboarded: 'gamana_onboarded',
  preferredNarrator: 'gamana_preferred_narrator',
  gpsEnabled: 'gamana_gps_enabled',
  autoTrigger: 'gamana_auto_trigger',
  batteryMode: 'gamana_battery_mode',
} as const;

// ---------------------------------------------------------------------------
// Location settings
// ---------------------------------------------------------------------------
export type BatteryMode = 'high_accuracy' | 'balanced' | 'battery_saver';

export function getGpsEnabled(): boolean {
  return localStorage.getItem(KEYS.gpsEnabled) !== 'false';
}

export function setGpsEnabled(enabled: boolean): void {
  localStorage.setItem(KEYS.gpsEnabled, String(enabled));
  window.dispatchEvent(new CustomEvent('gamana_gps_changed', { detail: enabled }));
}

export function getAutoTrigger(): boolean {
  return localStorage.getItem(KEYS.autoTrigger) !== 'false';
}

export function setAutoTrigger(enabled: boolean): void {
  localStorage.setItem(KEYS.autoTrigger, String(enabled));
}

export function getBatteryMode(): BatteryMode {
  const val = localStorage.getItem(KEYS.batteryMode);
  if (val === 'high_accuracy' || val === 'balanced' || val === 'battery_saver') return val;
  return 'balanced';
}

export function setBatteryMode(mode: BatteryMode): void {
  localStorage.setItem(KEYS.batteryMode, mode);
}

export interface GpsWatchOptions {
  enableHighAccuracy: boolean;
  maximumAge: number;
  timeout: number;
}

export function getGpsWatchOptions(mode?: BatteryMode): GpsWatchOptions {
  const m = mode ?? getBatteryMode();
  switch (m) {
    case 'high_accuracy':
      return { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 };
    case 'battery_saver':
      return { enableHighAccuracy: false, maximumAge: 60000, timeout: 15000 };
    default:
      return { enableHighAccuracy: true, maximumAge: 15000, timeout: 10000 };
  }
}

export const LOCATION_SETTINGS_KEYS = [
  KEYS.gpsEnabled,
  KEYS.autoTrigger,
  KEYS.batteryMode,
] as const;

// ---------------------------------------------------------------------------
// Onboarding
// ---------------------------------------------------------------------------
export function hasOnboarded(): boolean {
  return localStorage.getItem(KEYS.onboarded) === '1';
}

export function completeOnboarding(): void {
  localStorage.setItem(KEYS.onboarded, '1');
}

export function getPreferredNarratorId(): string | null {
  return localStorage.getItem(KEYS.preferredNarrator);
}

export function setPreferredNarratorId(id: string): void {
  localStorage.setItem(KEYS.preferredNarrator, id);
}

// ---------------------------------------------------------------------------
// Initial user profile
// ---------------------------------------------------------------------------
function getProfile(): UserProfile {
  return loadJson<UserProfile>(KEYS.profile, {
    id: DEFAULT_USER_ID,
    display_name: 'Explorer',
    coin_balance: 100,
    created_at: now(),
  });
}

function saveProfile(p: UserProfile) {
  saveJson(KEYS.profile, p);
}

// ---------------------------------------------------------------------------
// Static data queries
// ---------------------------------------------------------------------------
export function getNarrators(): Narrator[] {
  return ([...seedNarrators] as Narrator[]).sort((a, b) => a.name.localeCompare(b.name));
}

export function getStoryById(id: string): Story | null {
  const s = seedStories.find((s) => s.id === id);
  if (!s) return null;
  return { ...s, created_at: '2026-01-01T00:00:00Z' } as Story;
}

export function getStoriesByIds(ids: string[]): Story[] {
  const idSet = new Set(ids);
  return seedStories
    .filter((s) => idSet.has(s.id))
    .map((s) => ({ ...s, created_at: '2026-01-01T00:00:00Z' }) as Story);
}

function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function matchesQuery(haystack: string, words: string[]): boolean {
  const lower = haystack.toLowerCase();
  return words.every((w) => lower.includes(w));
}

export function searchAll(query: string): SearchResults {
  const q = query.trim().toLowerCase();
  const empty: SearchResults = { stories: [], topics: [], narrators: [], cities: [], total: 0 };
  if (!q) return empty;
  const words = q.split(/\s+/);

  const stories = seedStories
    .filter((s) => matchesQuery(`${s.title} ${s.subtitle} ${s.why_this_matters}`, words))
    .map((s) => ({ ...s, created_at: '2026-01-01T00:00:00Z' }) as Story);

  const topics = seedTopics
    .filter((t) => matchesQuery(`${t.title} ${t.subtitle}`, words));

  const narrators = (seedNarrators as Narrator[])
    .filter((n) => matchesQuery(`${n.name} ${n.style} ${n.description}`, words));

  const cities = seedCities
    .filter((c) => matchesQuery(`${c.name} ${c.country} ${c.description}`, words))
    .map((c) => ({ ...c, image_url: c.image_url ?? null }) as City);

  return {
    stories,
    topics,
    narrators,
    cities,
    total: stories.length + topics.length + narrators.length + cities.length,
  };
}

export function getCities(): City[] {
  return seedCities.map((c) => ({ ...c, image_url: c.image_url ?? null }) as City);
}

export function nearbyStories(userLat: number, userLng: number, radiusMeters: number = 10000): Story[] {
  return seedStories
    .map((s) => {
      const dist = haversineMeters(userLat, userLng, s.lat, s.lng);
      return { ...s, created_at: '2026-01-01T00:00:00Z', distance_meters: Math.round(dist) } as Story;
    })
    .filter((s) => (s.distance_meters ?? 0) <= radiusMeters)
    .sort((a, b) => (a.distance_meters ?? 0) - (b.distance_meters ?? 0));
}

export function getRelatedStories(storyId: string): StoryRelatedLink[] {
  return seedRelated
    .filter((r) => r.story_id === storyId)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((r) => {
      const related = seedStories.find((s) => s.id === r.related_story_id);
      return {
        id: uuid(),
        story_id: r.story_id,
        related_story_id: r.related_story_id,
        relationship: r.relationship as StoryRelatedLink['relationship'],
        sort_order: r.sort_order,
        title: related?.title ?? '',
        subtitle: related?.subtitle ?? '',
        image_url: related?.image_url ?? null,
        duration_seconds: related?.duration_seconds ?? 0,
        trust_level: related?.trust_level ?? 'verified',
      } as StoryRelatedLink;
    });
}

export function getStoryNarration(storyId: string, narratorId: string): StoryNarration | null {
  const n = seedNarrations.find((sn) => sn.story_id === storyId && sn.narrator_id === narratorId);
  return n ? (n as StoryNarration) : null;
}

export function getStoryNarrations(storyId: string): StoryNarration[] {
  return seedNarrations
    .filter((sn) => sn.story_id === storyId)
    .map((sn) => {
      const narrator = seedNarrators.find((n) => n.id === sn.narrator_id);
      return { ...sn, narrator: narrator ? { ...narrator } as Narrator : undefined } as StoryNarration;
    });
}

export function getModeContent(cityId: string, mode: string): ModeContent[] {
  return seedModeContent
    .filter((mc) => mc.city_id === cityId && mc.mode === mode)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((mc) => ({
      id: uuid(),
      city_id: mc.city_id,
      mode: mc.mode,
      title: mc.title,
      body: mc.body,
      duration_seconds: mc.duration_seconds,
      audio_url: null,
      sort_order: mc.sort_order,
      trust_level: mc.trust_level,
    }) as ModeContent);
}

export function getStorySources(storyId: string): StorySource[] {
  return seedSources
    .filter((s) => s.story_id === storyId)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((s) => ({ id: uuid(), ...s }) as StorySource);
}

export function getStoryNotices(storyId: string): StoryNotice[] {
  return seedNotices
    .filter((n) => n.story_id === storyId)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((n) => ({ id: uuid(), ...n }) as StoryNotice);
}

export function getStoryPracticalCues(storyId: string): StoryPracticalCue[] {
  const cues = seedCues
    .filter((c) => c.story_id === storyId)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((c) => ({ id: uuid(), ...c }) as StoryPracticalCue);

  if (cues.length > 0) return cues;

  return seedModeContent
    .filter((mc) => mc.city_id === BENGALURU_CITY_ID && ['respect', 'stay_safe', 'languages'].includes(mc.mode))
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((mc) => ({
      id: uuid(),
      story_id: storyId,
      cue_type: mc.mode as StoryPracticalCue['cue_type'],
      title: mc.title,
      body: mc.body,
      sort_order: mc.sort_order,
    }) as StoryPracticalCue);
}

export function getCityPacks(cityId: string): CityPack[] {
  return seedCityPacks
    .filter((p) => p.city_id === cityId)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((p) => ({ ...p }) as CityPack);
}

export function getCityPackById(packId: string): CityPack | null {
  const pack = seedCityPacks.find((p) => p.id === packId);
  return pack ? ({ ...pack } as CityPack) : null;
}

export function getPackStoryIds(packId: string): string[] {
  return seedCityPackStories
    .filter((ps) => ps.pack_id === packId)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((ps) => ps.story_id);
}

export function getTopics(cityId: string): Topic[] {
  return seedTopics
    .filter((t) => t.city_id === cityId)
    .sort((a, b) => a.sort_order - b.sort_order);
}

export function getStoriesByTopic(topicId: string): Story[] {
  const storyIds = seedTopicStories
    .filter((ts) => ts.topic_id === topicId)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((ts) => ts.story_id);
  return storyIds
    .map((id) => seedStories.find((s) => s.id === id))
    .filter((s): s is typeof seedStories[number] => !!s)
    .map((s) => ({ ...s, created_at: '2026-01-01T00:00:00Z' }) as Story);
}

export function getCoinPacks(): CoinPack[] {
  return [
    { id: uuid(), label: 'Starter', coin_amount: 10, price_display: '₹49', price_cents: 4900, is_popular: false, sort_order: 1 },
    { id: uuid(), label: 'Explorer', coin_amount: 30, price_display: '₹129', price_cents: 12900, is_popular: true, sort_order: 2 },
    { id: uuid(), label: 'Adventurer', coin_amount: 75, price_display: '₹299', price_cents: 29900, is_popular: false, sort_order: 3 },
    { id: uuid(), label: 'Legend', coin_amount: 200, price_display: '₹699', price_cents: 69900, is_popular: false, sort_order: 4 },
  ];
}

// ---------------------------------------------------------------------------
// User profile
// ---------------------------------------------------------------------------
export function getUserProfile(): UserProfile {
  return getProfile();
}

export function updateUserBalance(newBalance: number): UserProfile {
  const p = getProfile();
  p.coin_balance = newBalance;
  saveProfile(p);
  return p;
}

// ---------------------------------------------------------------------------
// Coin transactions
// ---------------------------------------------------------------------------
export function getCoinTransactions(): CoinTransaction[] {
  return loadJson<CoinTransaction[]>(KEYS.transactions, []);
}

export function addCoinTransaction(tx: Omit<CoinTransaction, 'id' | 'created_at'>): CoinTransaction {
  const transactions = getCoinTransactions();
  const newTx: CoinTransaction = { ...tx, id: uuid(), created_at: now() };
  transactions.unshift(newTx);
  saveJson(KEYS.transactions, transactions.slice(0, 50));
  return newTx;
}

// ---------------------------------------------------------------------------
// Unlocked content
// ---------------------------------------------------------------------------
interface UnlockedRow {
  id: string;
  user_id: string;
  item_type: string;
  item_id: string;
  coin_cost: number;
  unlocked_at: string;
  expires_at: string;
}

function getUnlocked(): UnlockedRow[] {
  return loadJson<UnlockedRow[]>(KEYS.unlocked, []);
}

function saveUnlocked(rows: UnlockedRow[]) {
  saveJson(KEYS.unlocked, rows);
}

export function getContentAccess(itemType: string, itemId: string): ContentAccessStatus {
  const rows = getUnlocked();
  const row = rows.find((r) => r.user_id === DEFAULT_USER_ID && r.item_type === itemType && r.item_id === itemId);
  if (!row) return { is_unlocked: false, is_expired: false, days_remaining: 0 };

  const expiresAt = new Date(row.expires_at);
  const isExpired = expiresAt <= new Date();
  const daysRemaining = isExpired ? 0 : Math.ceil((expiresAt.getTime() - Date.now()) / 86400000);

  return {
    is_unlocked: true,
    is_expired: isExpired,
    days_remaining: daysRemaining,
    expires_at: row.expires_at,
  };
}

export function unlockContent(itemType: 'story' | 'pack', itemId: string, cost: number): UnlockResult {
  const profile = getProfile();
  if (profile.coin_balance < cost) {
    return { success: false, error: 'insufficient_balance', balance: profile.coin_balance };
  }

  profile.coin_balance -= cost;
  saveProfile(profile);

  const rows = getUnlocked();
  const expiresAt = new Date(Date.now() + 30 * 86400000).toISOString();

  rows.push({
    id: uuid(),
    user_id: DEFAULT_USER_ID,
    item_type: itemType,
    item_id: itemId,
    coin_cost: cost,
    unlocked_at: now(),
    expires_at: expiresAt,
  });

  if (itemType === 'pack') {
    const packStories = seedCityPackStories.filter((ps) => ps.pack_id === itemId);
    for (const ps of packStories) {
      const exists = rows.find((r) => r.user_id === DEFAULT_USER_ID && r.item_type === 'story' && r.item_id === ps.story_id);
      if (!exists) {
        rows.push({
          id: uuid(),
          user_id: DEFAULT_USER_ID,
          item_type: 'story',
          item_id: ps.story_id,
          coin_cost: 0,
          unlocked_at: now(),
          expires_at: expiresAt,
        });
      }
    }
  }

  saveUnlocked(rows);
  window.dispatchEvent(new CustomEvent('gamana_collection_changed'));

  addCoinTransaction({
    user_id: DEFAULT_USER_ID,
    amount: -cost,
    transaction_type: itemType === 'pack' ? 'pack_unlock' : 'story_unlock',
    reference_id: itemId,
    description: `Unlocked ${itemType}: ${itemId}`,
  });

  return { success: true, new_balance: profile.coin_balance };
}

export function getUnlockedStories(): { item_id: string; expires_at: string; unlocked_at: string }[] {
  return getUnlocked()
    .filter((r) => r.user_id === DEFAULT_USER_ID && r.item_type === 'story')
    .map((r) => ({
      item_id: r.item_id,
      expires_at: r.expires_at,
      unlocked_at: r.unlocked_at,
    }));
}

export function getUnlockedPacks(): { item_id: string; expires_at: string; unlocked_at: string }[] {
  return getUnlocked()
    .filter((r) => r.user_id === DEFAULT_USER_ID && r.item_type === 'pack')
    .map((r) => ({
      item_id: r.item_id,
      expires_at: r.expires_at,
      unlocked_at: r.unlocked_at,
    }));
}

// ---------------------------------------------------------------------------
// Coupon redemption
// ---------------------------------------------------------------------------
interface CouponRedemption { coupon_code: string; user_id: string; redeemed_at: string }

export function redeemCoupon(code: string): { success: boolean; error?: string; new_balance?: number; coins_awarded?: number; coupon_code?: string } {
  const trimmed = code.trim().toUpperCase();
  const coupon = seedCoupons.find((c) => c.code === trimmed);
  if (!coupon) return { success: false, error: 'Invalid coupon code' };

  const redemptions = loadJson<CouponRedemption[]>(KEYS.couponRedemptions, []);
  const alreadyUsed = redemptions.some((r) => r.coupon_code === trimmed && r.user_id === DEFAULT_USER_ID);
  if (alreadyUsed) return { success: false, error: 'Coupon already redeemed' };

  if (coupon.max_uses > 0) {
    const totalUses = redemptions.filter((r) => r.coupon_code === trimmed).length;
    if (totalUses >= coupon.max_uses) return { success: false, error: 'Coupon usage limit reached' };
  }

  redemptions.push({ coupon_code: trimmed, user_id: DEFAULT_USER_ID, redeemed_at: now() });
  saveJson(KEYS.couponRedemptions, redemptions);

  const profile = getProfile();
  profile.coin_balance += coupon.coin_value;
  saveProfile(profile);

  addCoinTransaction({
    user_id: DEFAULT_USER_ID,
    amount: coupon.coin_value,
    transaction_type: 'coupon_redeem',
    reference_id: null,
    description: `Redeemed coupon ${trimmed} for ${coupon.coin_value} coins`,
  });

  return { success: true, new_balance: profile.coin_balance, coins_awarded: coupon.coin_value, coupon_code: trimmed };
}

// ---------------------------------------------------------------------------
// Saved items
// ---------------------------------------------------------------------------
export function getSavedItems(): SavedItem[] {
  const items = loadJson<SavedItem[]>(KEYS.saved, []);
  for (const item of items) {
    if (item.item_type === 'story') {
      item.story = getStoryById(item.item_id) ?? undefined;
    }
  }
  return items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function saveItem(itemType: 'story' | 'pack' | 'city' | 'tour', itemId: string): boolean {
  const items = loadJson<SavedItem[]>(KEYS.saved, []);
  const exists = items.some((i) => i.item_type === itemType && i.item_id === itemId && i.user_id === DEFAULT_USER_ID);
  if (exists) return false;

  items.push({
    id: uuid(),
    user_id: DEFAULT_USER_ID,
    item_type: itemType,
    item_id: itemId,
    created_at: now(),
  });
  saveJson(KEYS.saved, items);
  return true;
}

export function removeSavedItem(id: string): boolean {
  const items = loadJson<SavedItem[]>(KEYS.saved, []);
  const filtered = items.filter((i) => i.id !== id);
  if (filtered.length === items.length) return false;
  saveJson(KEYS.saved, filtered);
  return true;
}

// ---------------------------------------------------------------------------
// User tours
// ---------------------------------------------------------------------------
export function getUserTours(cityId: string): UserTour[] {
  const tours = loadJson<UserTour[]>(KEYS.tours, []);
  const allStops = loadJson<UserTourStop[]>(KEYS.tourStops, []);

  return tours
    .filter((t) => t.user_id === DEFAULT_USER_ID && t.city_id === cityId)
    .map((t) => ({
      ...t,
      stop_count: allStops.filter((s) => s.tour_id === t.id).length,
    }))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function getUserTourById(tourId: string): UserTour | null {
  const tours = loadJson<UserTour[]>(KEYS.tours, []);
  return tours.find((t) => t.id === tourId) ?? null;
}

export function createTour(cityId: string, title: string, description: string): UserTour {
  const tours = loadJson<UserTour[]>(KEYS.tours, []);
  const tour: UserTour = {
    id: uuid(),
    user_id: DEFAULT_USER_ID,
    city_id: cityId,
    title,
    description,
    is_shared: false,
    share_code: null,
    created_at: now(),
    updated_at: now(),
    stop_count: 0,
  };
  tours.push(tour);
  saveJson(KEYS.tours, tours);
  return tour;
}

export function deleteTour(tourId: string): boolean {
  const tours = loadJson<UserTour[]>(KEYS.tours, []);
  const filtered = tours.filter((t) => t.id !== tourId);
  saveJson(KEYS.tours, filtered);

  const stops = loadJson<UserTourStop[]>(KEYS.tourStops, []);
  saveJson(KEYS.tourStops, stops.filter((s) => s.tour_id !== tourId));

  return filtered.length < tours.length;
}

export function updateTour(tourId: string, fields: Partial<Pick<UserTour, 'title' | 'description' | 'is_shared' | 'share_code'>>): UserTour | null {
  const tours = loadJson<UserTour[]>(KEYS.tours, []);
  const idx = tours.findIndex((t) => t.id === tourId);
  if (idx === -1) return null;
  tours[idx] = { ...tours[idx], ...fields, updated_at: now() };
  saveJson(KEYS.tours, tours);
  return tours[idx];
}

// ---------------------------------------------------------------------------
// Tour stops
// ---------------------------------------------------------------------------
export function getTourStops(tourId: string): UserTourStop[] {
  const stops = loadJson<UserTourStop[]>(KEYS.tourStops, [])
    .filter((s) => s.tour_id === tourId)
    .sort((a, b) => a.sort_order - b.sort_order);

  for (const stop of stops) {
    if (stop.story_id) {
      stop.story = getStoryById(stop.story_id) ?? undefined;
    }
  }
  return stops;
}

export function addTourStoryStop(tourId: string, storyId: string, sortOrder: number): boolean {
  const stops = loadJson<UserTourStop[]>(KEYS.tourStops, []);
  stops.push({
    id: uuid(),
    tour_id: tourId,
    story_id: storyId,
    pinned_lat: null,
    pinned_lng: null,
    pinned_label: null,
    sort_order: sortOrder,
  });
  saveJson(KEYS.tourStops, stops);
  return true;
}

export function addTourPinnedStop(tourId: string, label: string, lat: number, lng: number, sortOrder: number): boolean {
  const stops = loadJson<UserTourStop[]>(KEYS.tourStops, []);
  stops.push({
    id: uuid(),
    tour_id: tourId,
    story_id: null,
    pinned_lat: lat,
    pinned_lng: lng,
    pinned_label: label,
    sort_order: sortOrder,
  });
  saveJson(KEYS.tourStops, stops);
  return true;
}

export function removeTourStop(stopId: string): boolean {
  const stops = loadJson<UserTourStop[]>(KEYS.tourStops, []);
  const filtered = stops.filter((s) => s.id !== stopId);
  if (filtered.length === stops.length) return false;
  saveJson(KEYS.tourStops, filtered);
  return true;
}

// ---------------------------------------------------------------------------
// Purchase coins (simulated IAP)
// ---------------------------------------------------------------------------
export function purchaseCoins(pack: CoinPack): { success: boolean; newBalance: number } {
  const profile = getProfile();
  profile.coin_balance += pack.coin_amount;
  saveProfile(profile);

  addCoinTransaction({
    user_id: DEFAULT_USER_ID,
    amount: pack.coin_amount,
    transaction_type: 'purchase',
    reference_id: pack.id,
    description: `Purchased ${pack.coin_amount} coins (${pack.price_display})`,
  });

  return { success: true, newBalance: profile.coin_balance };
}

// ---------------------------------------------------------------------------
// Tour Session Persistence
// ---------------------------------------------------------------------------
const TOUR_SESSION_KEY = 'gamana_tour_sessions';

function getTourSessions(): Record<string, TourSession> {
  try {
    return JSON.parse(localStorage.getItem(TOUR_SESSION_KEY) || '{}');
  } catch { return {}; }
}

function setTourSessions(sessions: Record<string, TourSession>): void {
  localStorage.setItem(TOUR_SESSION_KEY, JSON.stringify(sessions));
}

export function saveTourSession(session: TourSession): void {
  const sessions = getTourSessions();
  sessions[session.tourId] = session;
  setTourSessions(sessions);
}

export function getTourSession(tourId: string): TourSession | null {
  return getTourSessions()[tourId] ?? null;
}

export function deleteTourSession(tourId: string): void {
  const sessions = getTourSessions();
  delete sessions[tourId];
  setTourSessions(sessions);
}

export function getCompletedTourCount(): number {
  const sessions = getTourSessions();
  return Object.values(sessions).filter((s) => s.status === 'completed').length;
}

// ---------------------------------------------------------------------------
// Badge Storage
// ---------------------------------------------------------------------------
const BADGES_KEY = 'gamana_badges';

function getBadgesStore(): Badge[] {
  try {
    return JSON.parse(localStorage.getItem(BADGES_KEY) || '[]');
  } catch { return []; }
}

function setBadgesStore(badges: Badge[]): void {
  localStorage.setItem(BADGES_KEY, JSON.stringify(badges));
}

export function getEarnedBadges(): Badge[] {
  return getBadgesStore().filter((b) => b.earnedAt !== null);
}

export function awardBadge(badge: Badge): void {
  const badges = getBadgesStore();
  if (badges.some((b) => b.id === badge.id)) return;
  badges.push(badge);
  setBadgesStore(badges);
}

export function hasBadge(badgeId: BadgeId): boolean {
  return getBadgesStore().some((b) => b.id === badgeId && b.earnedAt !== null);
}
