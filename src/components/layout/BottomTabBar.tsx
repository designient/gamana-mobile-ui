import { Home, BookOpen, Search, Bell, User } from 'lucide-react';

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
}

export default function BottomTabBar({ activeTab = 'home', onTabChange }: BottomTabBarProps) {
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
            <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
