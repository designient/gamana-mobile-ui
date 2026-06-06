import { BookOpen, Route, Layers, Download } from 'lucide-react';
import type { LibraryTab } from '../../types';

const TABS: { id: LibraryTab; label: string; icon: typeof BookOpen }[] = [
  { id: 'nearby', label: 'Stories', icon: BookOpen },
  { id: 'tours', label: 'Tours', icon: Route },
  { id: 'topics', label: 'Topics', icon: Layers },
  { id: 'downloads', label: 'Downloads', icon: Download },
];

interface LibraryTabSwitcherProps {
  activeTab: LibraryTab;
  onTabChange: (tab: LibraryTab) => void;
}

export default function LibraryTabSwitcher({ activeTab, onTabChange }: LibraryTabSwitcherProps) {
  return (
    <div className="px-4 pt-2 pb-1">
      <div className="flex gap-1.5">
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200
                ${isActive
                  ? 'bg-gamana-500 text-white shadow-sm'
                  : 'bg-canvas text-gamana-600/50 hover:text-gamana-600 hover:bg-sand-200'
                }
              `}
            >
              <Icon size={13} strokeWidth={isActive ? 2.4 : 2} />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
