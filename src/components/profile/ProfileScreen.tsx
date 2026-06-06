import { useCallback, useEffect, useState } from 'react';
import {
  User, Building2, LogOut, LogIn, ChevronRight, Download, Bell, Globe,
  Shield, HelpCircle, Coins, Award, Users, QrCode, Settings, UserCog,
  Link2, Map, Moon, Languages, Trash2, Share2, Star, Phone, AlertTriangle,
  MessageSquareWarning, MapPinned, X, MapPin, Radio, BatteryMedium, Info,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useOrgContext } from '../../hooks/useOrgContext';
import StatusBar from '../layout/StatusBar';
import BottomTabBar from '../layout/BottomTabBar';
import MiniPlayer from '../overlays/MiniPlayer';
import ManageDownloadsSheet from '../overlays/ManageDownloadsSheet';
import BadgeCard, { getAllBadgeDisplayItems } from '../shared/BadgeCard';
import ToggleSwitch from '../shared/ToggleSwitch';
import BatteryModeSelector from '../shared/BatteryModeSelector';
import SOSSheet from '../family/SOSSheet';
import { useTheme } from '../../contexts/ThemeContext';
import type { PlaybackState, Narrator, Badge } from '../../types';
import type { CollectionTab, CollectionPreviewItem } from '../../hooks/useMyCollection';
import ProfileWishlistSection from './ProfileWishlistSection';
import ProfileCollectionSection from './ProfileCollectionSection';
import { BENGALURU_CITY_ID } from '../../lib/constants';
import { getCityPackById } from '../../lib/localDb';
import {
  getEarnedBadges,
  getGpsEnabled, setGpsEnabled,
  getAutoTrigger, setAutoTrigger,
  getBatteryMode, setBatteryMode,
  LOCATION_SETTINGS_KEYS,
} from '../../lib/localDb';
import type { BatteryMode } from '../../lib/localDb';

interface ProfileScreenProps {
  player: PlaybackState & { togglePlay: () => void };
  currentNarrator: Narrator | null;
  coinBalance: number;
  onBack: () => void;
  onTabChange: (tab: 'home' | 'library' | 'search' | 'profile' | 'alerts') => void;
  onNavigateToLogin: () => void;
  onNavigateToCoins: () => void;
  onShowOrgSelector: () => void;
  onNavigateToFamilyTracking: () => void;
  onNavigateToWishlist: () => void;
  onNavigateToCollection: (tab?: CollectionTab) => void;
  onNavigateToExperienceDetail: (slug: string) => void;
  onNavigateToStory: (storyId: string) => void;
  onNavigateToExperiencesExplore: () => void;
  onNavigateToLibrary: () => void;
}

function SectionHeader({ label }: { label: string }) {
  return (
    <p className="text-xs font-semibold text-gamana-500 tracking-wide uppercase px-1 mb-1.5 mt-5">
      {label}
    </p>
  );
}

function SettingsRow({
  icon: Icon,
  label,
  subtitle,
  value,
  onClick,
  danger,
  trailing,
}: {
  icon: typeof User;
  label: string;
  subtitle?: string;
  value?: string;
  onClick?: () => void;
  danger?: boolean;
  trailing?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-alt transition-colors"
    >
      <Icon
        size={18}
        className={`flex-shrink-0 ${danger ? 'text-red-400' : 'text-muted'}`}
      />
      <div className="flex-1 text-left min-w-0">
        <span className={`text-sm ${danger ? 'text-red-500' : 'text-heading'}`}>
          {label}
        </span>
        {subtitle && (
          <p className="text-[11px] text-muted leading-tight mt-0.5">{subtitle}</p>
        )}
      </div>
      {value && <span className="text-xs text-muted mr-1 flex-shrink-0">{value}</span>}
      {trailing ?? <ChevronRight size={16} className="text-faint flex-shrink-0" />}
    </button>
  );
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2200);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] animate-slide-up">
      <div className="flex items-center gap-2 bg-gamana-900 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-elevated">
        <span>{message}</span>
        <button onClick={onClose} className="ml-1 opacity-60 hover:opacity-100">
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

function estimateCacheSize(): string {
  let totalBytes = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        totalBytes += (localStorage.getItem(key) || '').length * 2;
      }
    }
  } catch {
    // ignore
  }
  const mb = totalBytes / (1024 * 1024);
  return mb < 0.1 ? '< 0.1 MB' : `${mb.toFixed(1)} MB`;
}

export default function ProfileScreen({
  player,
  currentNarrator,
  coinBalance,
  onBack: _onBack,
  onTabChange,
  onNavigateToLogin,
  onNavigateToCoins,
  onShowOrgSelector,
  onNavigateToFamilyTracking,
  onNavigateToWishlist,
  onNavigateToCollection,
  onNavigateToExperienceDetail,
  onNavigateToStory,
  onNavigateToExperiencesExplore,
  onNavigateToLibrary,
}: ProfileScreenProps) {
  const { session, isAuthenticated, logout } = useAuth();
  const { config: orgConfig, isConsumerMode, memberships: orgMemberships } = useOrgContext();
  const [badgeItems, setBadgeItems] = useState<Badge[]>([]);
  const [showDownloads, setShowDownloads] = useState(false);
  const [showSOS, setShowSOS] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [cacheSize, setCacheSize] = useState(() => estimateCacheSize());

  const { theme, setTheme } = useTheme();
  const darkMode = theme === 'dark';
  const [offlineMaps, setOfflineMaps] = useState(() => localStorage.getItem('gamana_offline_maps') === 'true');

  const [gpsEnabled, setGpsEnabledState] = useState(() => getGpsEnabled());
  const [autoTrigger, setAutoTriggerState] = useState(() => getAutoTrigger());
  const [batteryMode, setBatteryModeState] = useState<BatteryMode>(() => getBatteryMode());

  useEffect(() => {
    setBadgeItems(getAllBadgeDisplayItems(getEarnedBadges()));
  }, []);

  const earnedCount = badgeItems.filter((b) => b.earnedAt !== null).length;

  const showToast = useCallback((msg: string) => setToast(msg), []);
  const stub = useCallback(() => showToast('Coming soon'), [showToast]);

  const handleDarkModeToggle = useCallback((val: boolean) => {
    setTheme(val ? 'dark' : 'light');
    showToast(val ? 'Dark mode enabled' : 'Light mode enabled');
  }, [setTheme, showToast]);

  const handleOfflineMapsToggle = useCallback((val: boolean) => {
    setOfflineMaps(val);
    localStorage.setItem('gamana_offline_maps', String(val));
    showToast(val ? 'Offline maps enabled' : 'Offline maps disabled');
  }, [showToast]);

  const handleGpsToggle = useCallback((val: boolean) => {
    setGpsEnabledState(val);
    setGpsEnabled(val);
    showToast(val ? 'GPS tracking enabled' : 'GPS tracking disabled');
    if (!val) {
      setAutoTriggerState(false);
      setAutoTrigger(false);
    }
  }, [showToast]);

  const handleAutoTriggerToggle = useCallback((val: boolean) => {
    setAutoTriggerState(val);
    setAutoTrigger(val);
    showToast(val ? 'Auto-trigger enabled' : 'Auto-trigger disabled');
  }, [showToast]);

  const handleBatteryModeChange = useCallback((mode: BatteryMode) => {
    setBatteryModeState(mode);
    setBatteryMode(mode);
    const labels: Record<BatteryMode, string> = {
      high_accuracy: 'High Accuracy',
      balanced: 'Balanced',
      battery_saver: 'Battery Saver',
    };
    showToast(`GPS mode: ${labels[mode]}`);
  }, [showToast]);

  const handleClearCache = useCallback(() => {
    try {
      const keysToKeep = ['gamana_session', 'gamana_dark_mode', 'gamana_offline_maps', ...LOCATION_SETTINGS_KEYS];
      const allKeys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && !keysToKeep.includes(k)) allKeys.push(k);
      }
      allKeys.forEach((k) => localStorage.removeItem(k));

      if ('caches' in window) {
        caches.keys().then((names) => names.forEach((n) => caches.delete(n)));
      }
      setCacheSize('< 0.1 MB');
      showToast('Cache cleared');
    } catch {
      showToast('Failed to clear cache');
    }
  }, [showToast]);

  const handleShareApp = useCallback(async () => {
    const shareData = {
      title: 'Gamana',
      text: 'Explore cities with immersive audio walking tours on Gamana!',
      url: 'https://gamana.app',
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        showToast('Link copied to clipboard');
      }
    } catch {
      // user cancelled share
    }
  }, [showToast]);

  const initials = session?.displayName ? getInitials(session.displayName) : '';

  return (
    <div className="h-full bg-canvas flex flex-col">
      <StatusBar />

      {/* Header title */}
      <div className="px-5 pt-3 pb-2 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-heading">Profile</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-32">
        {/* ── Profile Header Card ── */}
        <div className="bg-surface rounded-xl p-4 mb-1">
          {isAuthenticated && session ? (
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-[2.5px] border-gamana-500 flex items-center justify-center bg-gamana-50 dark:bg-gamana-900/20 overflow-hidden">
                  <span className="text-lg font-bold text-gamana-600 select-none">
                    {initials || <User size={26} className="text-gamana-500" />}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-heading truncate">
                  {session.displayName}
                </p>
                <p className="text-xs text-muted truncate">
                  {session.email || session.phone}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={stub}
                  className="w-9 h-9 rounded-lg bg-surface-alt flex items-center justify-center hover:bg-surface-muted transition-colors"
                >
                  <QrCode size={18} className="text-body" />
                </button>
                <button
                  onClick={stub}
                  className="w-9 h-9 rounded-lg bg-surface-alt flex items-center justify-center hover:bg-surface-muted transition-colors"
                >
                  <Settings size={18} className="text-body" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full border-2 border-border-default bg-surface-muted flex items-center justify-center">
                <User size={26} className="text-muted" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-heading">Guest</p>
                <p className="text-xs text-muted">Log in to sync your data</p>
              </div>
              <button
                onClick={onNavigateToLogin}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gamana-500 text-white text-xs font-semibold"
              >
                <LogIn size={14} />
                Log in
              </button>
            </div>
          )}
        </div>

        {/* ── Account Management ── */}
        <SectionHeader label="Account Management" />
        <div className="bg-surface rounded-xl mb-1 overflow-hidden divide-y divide-border-subtle">
          <SettingsRow icon={UserCog} label="Edit Profile" onClick={stub} />
          <SettingsRow icon={Link2} label="My Connections" onClick={stub} />
          <SettingsRow icon={Map} label="My Tours" onClick={() => onNavigateToCollection('my_tours')} />
        </div>

        {/* ── Organization ── */}
        <SectionHeader label="Organization" />
        <div className="bg-surface rounded-xl mb-1 overflow-hidden">
          {!isConsumerMode && orgConfig.orgId ? (
            <>
              <div className="flex items-center gap-3 px-4 py-3.5">
                <div className="w-9 h-9 rounded-full bg-gamana-100 flex items-center justify-center flex-shrink-0">
                  <Building2 size={16} className="text-gamana-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-heading">{orgConfig.orgName}</p>
                  <p className="text-xs text-muted capitalize">{orgConfig.status}</p>
                </div>
                {orgConfig.status !== 'active' && (
                  <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                    {orgConfig.status === 'expired' ? 'Expired' : 'Inactive'}
                  </span>
                )}
              </div>
              {orgConfig.status !== 'active' && (
                <div className="px-4 py-3 bg-amber-50 border-t border-amber-100">
                  <p className="text-xs text-amber-700">
                    Your {orgConfig.orgName} access has {orgConfig.status === 'expired' ? 'expired' : 'been deactivated'}. Contact your organization admin.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-9 h-9 rounded-full bg-surface-muted flex items-center justify-center flex-shrink-0">
                <Building2 size={16} className="text-muted" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-heading">No organization</p>
                <p className="text-xs text-muted">Using personal account</p>
              </div>
            </div>
          )}
          <div className="border-t border-border-subtle">
            <button
              onClick={onShowOrgSelector}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-alt transition-colors"
            >
              <Building2 size={16} className="text-muted" />
              <span className="flex-1 text-sm text-gamana-600 text-left">
                {!isConsumerMode && orgConfig.orgId ? 'Switch organization' : 'Select organization'}
              </span>
              <ChevronRight size={16} className="text-faint" />
            </button>
          </div>
        </div>

        {/* ── My Badges (codebase-only) ── */}
        <div className="bg-surface rounded-xl mb-1 mt-3 overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
            <div className="flex items-center gap-2">
              <Award size={16} className="text-gamana-500" />
              <span className="text-sm font-semibold text-heading">My Badges</span>
            </div>
            <span className="text-xs text-muted">{earnedCount} of {badgeItems.length}</span>
          </div>
          <div className="flex overflow-x-auto gap-3 px-4 pb-4 scrollbar-hide">
            {badgeItems.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} size="compact" />
            ))}
          </div>
        </div>

        <ProfileWishlistSection
          onSeeAll={onNavigateToWishlist}
          onOpenExperience={onNavigateToExperienceDetail}
          onExplore={onNavigateToExperiencesExplore}
        />

        <ProfileCollectionSection
          cityId={BENGALURU_CITY_ID}
          onSeeAll={onNavigateToCollection}
          onOpenPreview={(item: CollectionPreviewItem) => {
            if (item.kind === 'story' && item.storyId) {
              onNavigateToStory(item.storyId);
            } else if (item.kind === 'audio_tour' && item.packId) {
              const pack = getCityPackById(item.packId);
              if (pack) onNavigateToCollection('audio_tours');
              else onNavigateToLibrary();
            } else if (item.kind === 'my_tour') {
              onNavigateToCollection('my_tours');
            } else if (item.kind === 'booking' && item.slug) {
              onNavigateToExperienceDetail(item.slug);
            }
          }}
          onExploreLibrary={onNavigateToLibrary}
        />

        {/* ── Family Tracking (codebase-only) ── */}
        <div className="bg-surface rounded-xl mb-1 mt-3 overflow-hidden">
          <button
            onClick={onNavigateToFamilyTracking}
            className="w-full flex items-center gap-3 p-4 hover:bg-surface-alt transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-gamana-50 dark:bg-gamana-900/20 flex items-center justify-center flex-shrink-0">
              <Users size={20} className="text-gamana-500" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-heading">Family Tracking</p>
              <p className="text-[11px] text-muted">Share live location with family</p>
            </div>
            <ChevronRight size={18} className="text-faint" />
          </button>
        </div>

        {/* ── Location & Touring ── */}
        <SectionHeader label="Location & Touring" />
        <div className="bg-surface rounded-xl mb-1 overflow-hidden divide-y divide-border-subtle">
          <div className="flex items-center gap-3 px-4 py-2.5">
            <Info size={15} className="text-muted flex-shrink-0" />
            <p className="text-[11px] text-muted leading-relaxed">
              Location is used to trigger nearby stories and guide walking tours. GPS may increase battery usage.
            </p>
          </div>
          <SettingsRow
            icon={MapPin}
            label="GPS Location Tracking"
            subtitle="Required for nearby stories, walking tours, and auto-trigger"
            trailing={
              <ToggleSwitch checked={gpsEnabled} onChange={handleGpsToggle} />
            }
          />
          <SettingsRow
            icon={Radio}
            label="Auto-Trigger Nearby Stories"
            subtitle={
              gpsEnabled
                ? 'Auto-play stories when you\u2019re within range of a location'
                : 'Enable GPS to use auto-trigger'
            }
            trailing={
              <ToggleSwitch
                checked={autoTrigger}
                onChange={handleAutoTriggerToggle}
                disabled={!gpsEnabled}
              />
            }
          />
          <div className="px-4 py-3">
            <div className="flex items-center gap-3 mb-2.5">
              <BatteryMedium size={18} className="text-muted flex-shrink-0" />
              <div>
                <span className="text-sm text-heading">Battery Optimization</span>
                <p className="text-[11px] text-muted leading-tight mt-0.5">
                  Controls GPS polling frequency and accuracy
                </p>
              </div>
            </div>
            <BatteryModeSelector
              value={batteryMode}
              onChange={handleBatteryModeChange}
              disabled={!gpsEnabled}
            />
          </div>
        </div>

        {/* ── Content & Language ── */}
        <SectionHeader label="Content & Language" />
        <div className="bg-surface rounded-xl mb-1 overflow-hidden divide-y divide-border-subtle">
          <SettingsRow
            icon={Moon}
            label="Light/Dark Mode"
            trailing={
              <ToggleSwitch checked={darkMode} onChange={handleDarkModeToggle} />
            }
          />
          <SettingsRow
            icon={Languages}
            label="Language Preferences"
            subtitle="Audio language, subtitle & interface"
            onClick={stub}
          />
          <SettingsRow
            icon={MapPinned}
            label="Offline Maps"
            trailing={
              <ToggleSwitch checked={offlineMaps} onChange={handleOfflineMapsToggle} />
            }
          />
          <SettingsRow icon={Bell} label="Notification Settings" onClick={stub} />
        </div>

        {/* ── Content & Maps ── */}
        <SectionHeader label="Content & Maps" />
        <div className="bg-surface rounded-xl mb-1 overflow-hidden divide-y divide-border-subtle">
          <SettingsRow
            icon={Download}
            label="Download Manager"
            onClick={() => setShowDownloads(true)}
          />
          <SettingsRow
            icon={Trash2}
            label="Clear Cache"
            subtitle={cacheSize}
            onClick={handleClearCache}
          />
        </div>

        {/* ── Coins & Balance (codebase-only, fits near Content & Maps) ── */}
        <div className="bg-surface rounded-xl mb-1 mt-3 overflow-hidden divide-y divide-border-subtle">
          <SettingsRow
            icon={Coins}
            label="Coins & Balance"
            value={`${coinBalance} coins`}
            onClick={onNavigateToCoins}
          />
        </div>

        {/* ── Help, Legal & Security ── */}
        <SectionHeader label="Help, Legal & Security" />
        <div className="bg-surface rounded-xl mb-1 overflow-hidden divide-y divide-border-subtle">
          <SettingsRow
            icon={HelpCircle}
            label="FAQs"
            onClick={
              orgConfig.customContent.faqUrl
                ? () => window.open(orgConfig.customContent.faqUrl!, '_blank')
                : stub
            }
          />
          <SettingsRow icon={Phone} label="Emergency Contact" onClick={() => setShowSOS(true)} />
          <SettingsRow
            icon={Shield}
            label="Privacy Policies"
            onClick={
              orgConfig.customContent.privacyUrl
                ? () => window.open(orgConfig.customContent.privacyUrl!, '_blank')
                : stub
            }
          />
          <SettingsRow
            icon={Shield}
            label="Terms and Conditions"
            onClick={
              orgConfig.customContent.termsUrl
                ? () => window.open(orgConfig.customContent.termsUrl!, '_blank')
                : stub
            }
          />
          <SettingsRow
            icon={MessageSquareWarning}
            label="Contact Support"
            onClick={
              orgConfig.customContent.supportUrl
                ? () => window.open(orgConfig.customContent.supportUrl!, '_blank')
                : stub
            }
          />
          <SettingsRow icon={AlertTriangle} label="Report a Problem" onClick={stub} />
        </div>

        {/* ── Actions ── */}
        <SectionHeader label="Actions" />
        <div className="bg-surface rounded-xl mb-1 overflow-hidden divide-y divide-border-subtle">
          <SettingsRow icon={Share2} label="Share App" onClick={handleShareApp} />
          <SettingsRow icon={Star} label="Rate App" onClick={stub} />
          {isAuthenticated && (
            <SettingsRow icon={LogOut} label="Logout" danger onClick={logout} />
          )}
        </div>

        {/* ── Footer ── */}
        <p className="text-center text-[10px] text-faint mt-4 mb-3">Version 3.0.0</p>

        {isAuthenticated && (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 border border-red-200 text-red-500 text-sm font-medium mb-4 hover:bg-red-100 transition-colors"
          >
            <Trash2 size={15} />
            Delete Account
          </button>
        )}
      </div>

      {/* ── Delete Account Confirmation ── */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="relative bg-surface rounded-2xl mx-8 p-6 shadow-elevated max-w-sm w-full animate-scale-in">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle size={22} className="text-red-500" />
            </div>
            <h3 className="text-base font-semibold text-heading text-center">Delete Account?</h3>
            <p className="text-xs text-secondary text-center mt-2 leading-relaxed">
              This will permanently remove your account and all associated data. This action cannot be undone.
            </p>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-surface-muted text-sm font-medium text-heading hover:bg-surface-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  showToast('Account deletion is not available yet');
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-sm font-medium text-white hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {player.currentNarration && (
        <MiniPlayer
          story={player.currentStory!}
          narrator={currentNarrator}
          isPlaying={player.isPlaying}
          progress={player.progress}
          onTogglePlay={player.togglePlay}
        />
      )}

      <BottomTabBar activeTab="profile" onTabChange={onTabChange} />

      <ManageDownloadsSheet
        isOpen={showDownloads}
        onClose={() => setShowDownloads(false)}
      />
      <SOSSheet isOpen={showSOS} onClose={() => setShowSOS(false)} />
    </div>
  );
}
