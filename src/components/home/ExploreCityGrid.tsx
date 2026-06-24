import { MapPin, Lightbulb, Globe, Map, Sparkles, ShieldAlert } from 'lucide-react';
import type { ExperienceTab } from '../../types/experience';

export type ExploreTabId =
  | 'nearby'
  | 'city_facts'
  | 'speak_local'
  | 'guided_tours'
  | 'activities'
  | 'family_safety';

interface ExploreCityGridProps {
  activeTab: ExploreTabId;
  onTabSelect: (tab: ExploreTabId) => void;
  onNavigateToExperiencesExplore: (tab: ExperienceTab) => void;
  onNavigateToFamilyTracking?: () => void;
  onOpenSOS?: () => void;
}

export default function ExploreCityGrid({
  activeTab,
  onTabSelect,
  onNavigateToExperiencesExplore,
  onNavigateToFamilyTracking,
  onOpenSOS,
}: ExploreCityGridProps) {
  const tabs: { id: ExploreTabId; label: string; icon: typeof MapPin }[] = [
    { id: 'nearby', label: 'Nearby', icon: MapPin },
    { id: 'city_facts', label: 'City Facts', icon: Lightbulb },
    { id: 'speak_local', label: 'Speak Local', icon: Globe },
    { id: 'guided_tours', label: 'Guided Tours', icon: Map },
    { id: 'activities', label: 'Activities', icon: Sparkles },
    { id: 'family_safety', label: 'Family & Safety', icon: ShieldAlert },
  ];

  function handleTab(tab: ExploreTabId) {
    onTabSelect(tab);
    if (tab === 'guided_tours') {
      onNavigateToExperiencesExplore('tours');
    } else if (tab === 'activities') {
      onNavigateToExperiencesExplore('activities');
    }
  }

  return (
    <div className="sticky top-[54px] z-20 bg-canvas px-4 pt-3 pb-2 border-b border-gamana-100/70">
      <h3 className="text-sm font-semibold text-heading mb-2 px-1">Explore This City</h3>
      <div className="flex overflow-x-auto gap-2 scrollbar-hide pb-1">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = id === activeTab;
          return (
            <button
              key={id}
              type="button"
              onClick={() => handleTab(id)}
              className={`flex-none inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold border transition-colors ${
                isActive
                  ? 'bg-gamana-500 text-white border-gamana-500'
                  : 'bg-surface text-gamana-700 border-gamana-200 hover:border-gamana-400'
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          );
        })}
      </div>

      {activeTab === 'family_safety' && onNavigateToFamilyTracking && onOpenSOS && (
        <div className="mt-3 flex gap-2.5">
          <button
            type="button"
            onClick={onNavigateToFamilyTracking}
            className="flex-1 py-3 rounded-xl border border-gamana-200 text-gamana-700 text-xs font-semibold bg-surface"
          >
            Family Tracking
          </button>
          <button
            type="button"
            onClick={onOpenSOS}
            className="px-5 py-3 rounded-xl border border-red-200 text-red-600 text-xs font-semibold bg-red-50"
          >
            SOS
          </button>
        </div>
      )}
    </div>
  );
}
