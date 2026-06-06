import { useEffect, useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { useOrgContext } from '../../hooks/useOrgContext';
import { useConnectivity } from '../../hooks/useConnectivity';
import StatusBar from '../layout/StatusBar';
import BottomTabBar from '../layout/BottomTabBar';
import MiniPlayer from '../overlays/MiniPlayer';
import OfflineBanner from '../overlays/OfflineBanner';
import type { PlaybackState, Narrator, AppNotification } from '../../types';

interface AlertsScreenProps {
  player: PlaybackState & { togglePlay: () => void };
  currentNarrator: Narrator | null;
  onBack: () => void;
  onTabChange: (tab: 'home' | 'library' | 'search' | 'profile' | 'alerts') => void;
  onNavigateToStory: (storyId: string) => void;
  onViewNotificationDesigns?: () => void;
}

const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    type: 'new_story',
    title: 'New story near you',
    body: 'The Bangalore Fort story is now available. Tap to listen.',
    imageUrl: null,
    actionUrl: null,
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-2',
    type: 'promo',
    title: 'Weekend special',
    body: 'Unlock 3 stories this weekend and earn bonus coins.',
    imageUrl: null,
    actionUrl: null,
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-3',
    type: 'system',
    title: 'Welcome to Gamana',
    body: 'Explore audio stories for the places around you.',
    imageUrl: null,
    actionUrl: null,
    read: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function AlertsScreen({
  player,
  currentNarrator,
  onBack: _onBack,
  onTabChange,
  onViewNotificationDesigns,
}: AlertsScreenProps) {
  const { config: orgConfig } = useOrgContext();
  const { isOnline } = useConnectivity();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    const filtered = orgConfig.allowedNotificationTypes.length > 0
      ? MOCK_NOTIFICATIONS.filter((n) => orgConfig.allowedNotificationTypes.includes(n.type))
      : MOCK_NOTIFICATIONS;
    setNotifications(filtered);
  }, [orgConfig.allowedNotificationTypes]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div className="h-full bg-canvas flex flex-col">
      <StatusBar />

      {!isOnline && <OfflineBanner />}

      <div className="px-5 pt-3 pb-2 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-heading">Alerts</h1>
        {unreadCount > 0 && (
          <span className="text-xs font-medium text-gamana-500 bg-gamana-50 dark:bg-gamana-900/20 px-2.5 py-1 rounded-full">
            {unreadCount} new
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-32">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-full bg-surface-muted flex items-center justify-center mb-4">
              <BellOff size={28} className="text-faint" />
            </div>
            <p className="text-sm font-medium text-heading mb-1">No notifications yet</p>
            <p className="text-xs text-muted text-center max-w-[240px]">
              You'll see new story alerts, promotions, and updates here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notif) => (
              <button
                key={notif.id}
                onClick={() => { markAsRead(notif.id); }}
                className={`w-full text-left p-4 rounded-xl transition-colors ${notif.read ? 'bg-surface' : 'bg-gamana-50 dark:bg-gamana-900/20 border border-gamana-100'}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${notif.read ? 'bg-surface-muted' : 'bg-gamana-100'}`}>
                    <Bell size={16} className={notif.read ? 'text-muted' : 'text-gamana-500'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className={`text-sm font-medium truncate ${notif.read ? 'text-heading' : 'text-heading'}`}>{notif.title}</p>
                      <span className="text-[10px] text-muted flex-shrink-0">{timeAgo(notif.createdAt)}</span>
                    </div>
                    <p className="text-xs text-muted line-clamp-2">{notif.body}</p>
                  </div>
                  {!notif.read && <div className="w-2 h-2 rounded-full bg-gamana-500 flex-shrink-0 mt-2" />}
                </div>
              </button>
            ))}
          </div>
        )}

        {!isOnline && notifications.length > 0 && (
          <p className="text-xs text-muted text-center mt-4">New alerts available when online</p>
        )}

        {onViewNotificationDesigns && (
          <button
            type="button"
            onClick={onViewNotificationDesigns}
            className="w-full mt-8 mb-2 opacity-40 text-xs text-center text-muted hover:opacity-60 transition-opacity"
          >
            Design Reference: Notification Designs →
          </button>
        )}
      </div>

      {player.currentNarration && (
        <MiniPlayer
          story={player.currentStory!}
          narrator={currentNarrator}
          isPlaying={player.isPlaying}
          progress={player.progress}
          onTogglePlay={player.togglePlay}
        />
      )}

      <BottomTabBar activeTab="alerts" onTabChange={onTabChange} />
    </div>
  );
}
