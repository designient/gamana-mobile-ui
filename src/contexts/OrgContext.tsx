import { createContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { OrgConfig, OrgMembership } from '../types';
import { DEFAULT_ORG_CONFIG } from '../lib/constants';

const SELECTED_ORG_KEY = 'gamana_selected_org';
const ORG_MEMBERSHIPS_KEY = 'gamana_org_memberships';

function orgConfigCacheKey(orgId: string): string {
  return `gamana_org_config_${orgId}`;
}

export interface OrgContextValue {
  config: OrgConfig;
  memberships: OrgMembership[];
  isLoading: boolean;
  isConsumerMode: boolean;
  selectOrg: (orgId: string) => void;
  clearOrg: () => void;
  setMemberships: (memberships: OrgMembership[]) => void;
  updateConfig: (config: OrgConfig) => void;
}

export const OrgContext = createContext<OrgContextValue>({
  config: DEFAULT_ORG_CONFIG,
  memberships: [],
  isLoading: false,
  isConsumerMode: true,
  selectOrg: () => {},
  clearOrg: () => {},
  setMemberships: () => {},
  updateConfig: () => {},
});

function loadCachedConfig(orgId: string): OrgConfig | null {
  try {
    const raw = localStorage.getItem(orgConfigCacheKey(orgId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function loadMemberships(): OrgMembership[] {
  try {
    const raw = localStorage.getItem(ORG_MEMBERSHIPS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function OrgProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<OrgConfig>(DEFAULT_ORG_CONFIG);
  const [memberships, setMembershipsState] = useState<OrgMembership[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedOrgId = localStorage.getItem(SELECTED_ORG_KEY);
    const savedMemberships = loadMemberships();
    setMembershipsState(savedMemberships);

    if (savedOrgId) {
      const cached = loadCachedConfig(savedOrgId);
      if (cached) {
        setConfig(cached);
      }
    }
    setIsLoading(false);
  }, []);

  const selectOrg = useCallback((orgId: string) => {
    const previousOrgId = localStorage.getItem(SELECTED_ORG_KEY);
    localStorage.setItem(SELECTED_ORG_KEY, orgId);
    if (previousOrgId && previousOrgId !== orgId) {
      console.info('org_switched', { from_org_id: previousOrgId, to_org_id: orgId });
    }
    const cached = loadCachedConfig(orgId);
    if (cached) {
      setConfig(cached);
    }
    console.info('org_selected', { org_id: orgId, surface: 'selector' });
  }, []);

  const clearOrg = useCallback(() => {
    localStorage.removeItem(SELECTED_ORG_KEY);
    setConfig(DEFAULT_ORG_CONFIG);
  }, []);

  const setMemberships = useCallback((newMemberships: OrgMembership[]) => {
    setMembershipsState(newMemberships);
    localStorage.setItem(ORG_MEMBERSHIPS_KEY, JSON.stringify(newMemberships));
  }, []);

  const updateConfig = useCallback((newConfig: OrgConfig) => {
    setConfig(newConfig);
    if (newConfig.orgId) {
      localStorage.setItem(orgConfigCacheKey(newConfig.orgId), JSON.stringify(newConfig));
      localStorage.setItem(SELECTED_ORG_KEY, newConfig.orgId);
    }
    console.info('org_context_loaded', {
      org_id: newConfig.orgId,
      status: newConfig.status,
      has_custom_branding: !!(newConfig.orgLogo || newConfig.orgColors),
    });
  }, []);

  return (
    <OrgContext.Provider
      value={{
        config,
        memberships,
        isLoading,
        isConsumerMode: config.orgId === null,
        selectOrg,
        clearOrg,
        setMemberships,
        updateConfig,
      }}
    >
      {children}
    </OrgContext.Provider>
  );
}
