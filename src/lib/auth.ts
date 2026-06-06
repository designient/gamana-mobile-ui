import type { Session, OrgMembership, OrgConfig } from '../types';
import { OfflineError } from './api';
import { DEFAULT_ORG_CONFIG } from './constants';

// Since no backend exists yet, these functions simulate API calls with realistic
// delays and mock responses. When the backend is ready, replace the setTimeout
// calls with real api.post / api.get calls.

export async function requestOtp(identifier: string): Promise<{ success: boolean; error?: string }> {
  if (!navigator.onLine) throw new OfflineError();

  // Mock: simulate OTP request
  await new Promise((r) => setTimeout(r, 800));
  console.info('auth_otp_requested', { identifier });
  return { success: true };
}

export async function verifyOtp(
  identifier: string,
  otp: string,
): Promise<{ session: Session | null; error?: string }> {
  if (!navigator.onLine) throw new OfflineError();

  // Mock: accept any 4-digit OTP
  await new Promise((r) => setTimeout(r, 600));

  if (otp.length !== 4 || !/^\d{4}$/.test(otp)) {
    return { session: null, error: 'Invalid OTP. Please enter a 4-digit code.' };
  }

  const session: Session = {
    userId: `user_${Date.now()}`,
    token: `tok_${Math.random().toString(36).slice(2)}`,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    displayName: identifier.includes('@') ? identifier.split('@')[0] : identifier,
    email: identifier.includes('@') ? identifier : null,
    phone: !identifier.includes('@') ? identifier : null,
  };

  console.info('auth_login_success', { user_id: session.userId });
  return { session };
}

export async function fetchOrgMemberships(
  _userId: string,
): Promise<OrgMembership[]> {
  if (!navigator.onLine) {
    // Try cached memberships
    try {
      const raw = localStorage.getItem('gamana_org_memberships');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  // Mock: return sample orgs for demo
  await new Promise((r) => setTimeout(r, 400));

  const memberships: OrgMembership[] = [
    {
      orgId: 'org_karnataka_tourism',
      orgName: 'Karnataka Tourism',
      orgLogo: null,
      status: 'active',
    },
    {
      orgId: 'org_heritage_walks',
      orgName: 'Heritage Walks India',
      orgLogo: null,
      status: 'active',
    },
  ];

  console.info('org_memberships_checked', {
    count: memberships.length,
    org_ids: memberships.map((m) => m.orgId),
  });

  return memberships;
}

export async function fetchOrgConfig(orgId: string): Promise<OrgConfig> {
  if (!navigator.onLine) {
    // Try cached config
    try {
      const raw = localStorage.getItem(`gamana_org_config_${orgId}`);
      if (raw) return JSON.parse(raw);
    } catch { /* fall through */ }
    return { ...DEFAULT_ORG_CONFIG, orgId };
  }

  // Mock org configs
  await new Promise((r) => setTimeout(r, 300));

  const configs: Record<string, Partial<OrgConfig>> = {
    org_karnataka_tourism: {
      orgId: 'org_karnataka_tourism',
      orgName: 'Karnataka Tourism',
      orgColors: { primary: '#1A5F7A', accent: '#D4A853' },
      enabledRegions: ['00000000-0000-0000-0000-000000000001'],
      enabledLanguages: ['en', 'kn'],
      pricingRules: { storyCost: 1, packMultiplier: 0.8 },
      customContent: {
        faqUrl: 'https://karnatakatourism.org/faq',
        privacyUrl: null,
        termsUrl: null,
        supportUrl: 'https://karnatakatourism.org/support',
        shareMessage: 'Explore Karnataka with Gamana!',
      },
      status: 'active',
    },
    org_heritage_walks: {
      orgId: 'org_heritage_walks',
      orgName: 'Heritage Walks India',
      orgColors: { primary: '#8B4513', accent: '#DAA520' },
      enabledRegions: [],
      enabledLanguages: ['en', 'hi'],
      pricingRules: { storyCost: 2, packMultiplier: 1 },
      customContent: {
        faqUrl: null,
        privacyUrl: null,
        termsUrl: null,
        supportUrl: null,
        shareMessage: null,
      },
      status: 'active',
    },
  };

  const partial = configs[orgId] ?? {};
  return { ...DEFAULT_ORG_CONFIG, ...partial } as OrgConfig;
}

export async function validateSession(token: string): Promise<boolean> {
  // Mock validation — always succeeds if token exists
  void token;
  await new Promise((r) => setTimeout(r, 200));
  return true;
}
