import type { QuickMode, OrgConfig } from '../types';

export const QUICK_MODES: { mode: QuickMode; label: string; icon: string }[] = [
  { mode: 'nearby', label: 'Nearby', icon: 'MapPin' },
  { mode: 'quick_facts', label: 'City Facts', icon: 'Lightbulb' },
  { mode: 'look_for', label: 'Look For', icon: 'Eye' },
  { mode: 'respect', label: 'Respect', icon: 'Heart' },
  { mode: 'stay_safe', label: 'Stay Safe', icon: 'ShieldAlert' },
  { mode: 'languages', label: 'Languages', icon: 'Globe' },
];

export const MODE_LABELS: Record<QuickMode, string> = {
  nearby: 'Nearby Stories',
  quick_facts: 'City Facts',
  look_for: 'What to Notice',
  respect: 'Dos & Don\'ts',
  stay_safe: 'Stay Safe',
  languages: 'Languages & Narrators',
};

export const TRUST_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  verified: { label: 'Verified', color: 'text-trust-verified', bg: 'bg-trust-verified/10' },
  legend: { label: 'Legend', color: 'text-trust-legend', bg: 'bg-trust-legend/10' },
  mixed: { label: 'Mixed', color: 'text-trust-mixed', bg: 'bg-trust-mixed/10' },
};

export const DEFAULT_CENTER = { lat: 12.9716, lng: 77.5946 };

export const BENGALURU_CITY_ID = '00000000-0000-0000-0000-000000000001';

export const STORY_COIN_COST = 2;
export const DEFAULT_USER_ID = 'anonymous';
export const PREVIEW_DURATION_RATIO = 0.1;

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://api.gamana.app';

export const DEFAULT_ORG_CONFIG: OrgConfig = {
  orgId: null,
  orgName: 'Gamana',
  orgLogo: null,
  orgColors: null,
  introAudioUrl: null,
  enabledRegions: [],
  enabledLanguages: [],
  allowedNarratorIds: [],
  pricingRules: null,
  allowedNotificationTypes: [],
  customContent: {
    faqUrl: null,
    privacyUrl: null,
    termsUrl: null,
    supportUrl: null,
    shareMessage: null,
  },
  status: 'active',
};

export const OFFLINE_STORAGE_LIMIT_BYTES = 500 * 1024 * 1024; // 500 MB
export const DOWNLOAD_CACHE_NAME = 'gamana-downloads-v1';
