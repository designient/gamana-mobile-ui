import { MapPin, Lightbulb, Globe, Map, Sparkles } from 'lucide-react';
import type { QuickMode } from '../../types';
import type { ExperienceTab } from '../../types/experience';

interface ExploreCityGridProps {
  activeMode: QuickMode | null;
  onModeSelect: (mode: QuickMode) => void;
  onNavigateToExperiencesExplore: (tab: ExperienceTab) => void;
}

function NewBadge() {
  return (
    <span className="absolute -top-1 -right-1 px-1 py-0.5 rounded text-[8px] font-bold bg-amber-400 text-amber-950 leading-none">
      NEW
    </span>
  );
}

interface TileProps {
  label: string;
  icon: typeof MapPin;
  isActive?: boolean;
  showNew?: boolean;
  onClick: () => void;
}

function Tile({ label, icon: Icon, isActive, showNew, onClick }: TileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative flex flex-col items-center justify-center gap-1.5 py-4 px-2 rounded-2xl transition-all
        ${isActive
          ? 'bg-gamana-500 text-white shadow-sm'
          : 'bg-surface border border-gamana-100 text-gamana-600/70 hover:bg-gamana-500/5'
        }
      `}
    >
      {showNew && <NewBadge />}
      <Icon size={22} strokeWidth={isActive ? 2.2 : 2} />
      <span className={`text-[11px] font-semibold text-center leading-tight ${isActive ? 'text-white' : 'text-heading'}`}>
        {label}
      </span>
    </button>
  );
}

export default function ExploreCityGrid({
  activeMode,
  onModeSelect,
  onNavigateToExperiencesExplore,
}: ExploreCityGridProps) {
  return (
    <div className="px-4 mt-5">
      <h3 className="text-sm font-semibold text-heading mb-3 px-1">Explore This City</h3>
      <div className="grid grid-cols-3 gap-2.5">
        <Tile
          label="Nearby"
          icon={MapPin}
          isActive={activeMode === 'nearby'}
          onClick={() => onModeSelect('nearby')}
        />
        <Tile
          label="City Facts"
          icon={Lightbulb}
          isActive={activeMode === 'quick_facts'}
          onClick={() => onModeSelect('quick_facts')}
        />
        <Tile
          label="Speak Local"
          icon={Globe}
          isActive={activeMode === 'languages'}
          onClick={() => onModeSelect('languages')}
        />
      </div>

      <div className="grid grid-cols-2 gap-2.5 mt-2.5">
        <button
          type="button"
          onClick={() => onNavigateToExperiencesExplore('tours')}
          className="relative flex flex-col items-start gap-1 p-4 rounded-2xl bg-surface border border-gamana-100 text-left transition-all hover:bg-gamana-500/5 active:scale-[0.98]"
        >
          <NewBadge />
          <Map size={22} className="text-gamana-500" />
          <span className="text-[11px] font-semibold text-heading leading-tight">Tours</span>
          <span className="text-[10px] text-muted leading-snug">Guided walks &amp; day trips</span>
        </button>
        <button
          type="button"
          onClick={() => onNavigateToExperiencesExplore('activities')}
          className="relative flex flex-col items-start gap-1 p-4 rounded-2xl bg-surface border border-gamana-100 text-left transition-all hover:bg-gamana-500/5 active:scale-[0.98]"
        >
          <NewBadge />
          <Sparkles size={22} className="text-gamana-500" />
          <span className="text-[11px] font-semibold text-heading leading-tight">Activities</span>
          <span className="text-[10px] text-muted leading-snug">Classes, food &amp; more</span>
        </button>
      </div>
    </div>
  );
}
