import { Home, BookOpen, Search, Bell, User } from 'lucide-react';
import { getUnreadAlertCount } from '../../lib/home-alerts';

export type TabId = 'home' | 'library' | 'search' | 'alerts' | 'profile';

const tabs: { icon: typeof Home; label: string; id: TabId }[] = [
  { icon: Home, label: 'Home', id: 'home' },
  { icon: BookOpen, label: 'Library', id: 'library' },
  { icon: Search, label: 'Search', id: 'search' },
  { icon: Bell, label: 'Alerts', id: 'alerts' },
  { icon: User, label: 'Profile', id: 'profile' },
];

interface BottomTabBarProps {
  activeTab?: TabId;
  onTabChange?: (tab: TabId) => void;
  unreadAlertsCount?: number;
}

export default function BottomTabBar({
  activeTab = 'home',
  onTabChange,
  unreadAlertsCount,
}: BottomTabBarProps) {
  const unreadCount = unreadAlertsCount ?? getUnreadAlertCount();

  return (
    <nav className="flex items-center justify-around px-2 pt-2 pb-6 bg-surface border-t border-border-default">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange?.(tab.id)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
              isActive
                ? 'text-gamana-500'
                : 'text-muted hover:text-secondary'
            }`}
          >
            <span className="relative">
              <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
              {tab.id === 'alerts' && unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[15px] h-[15px] px-1 rounded-full bg-red-500 text-white text-[9px] leading-[15px] font-semibold text-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </span>
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
