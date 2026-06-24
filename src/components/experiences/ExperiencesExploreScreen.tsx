import { useMemo, useState, useEffect } from 'react';
import { ArrowLeft, SlidersHorizontal, Compass } from 'lucide-react';
import type { ExperienceFilters, ExperienceTab } from '../../types/experience';
import { useExperienceList } from '../../hooks/useExperiences';
import { trackExperienceEvent } from '../../lib/experience-analytics';
import StatusBar from '../layout/StatusBar';
import ExperienceBookCard from './ExperienceBookCard';
import ExperienceFilterSheet, {
  countActiveSheetFilters,
  DEFAULT_SHEET_FILTERS,
  type ExperienceSheetFilters,
} from './ExperienceFilterSheet';

const NO_BAR_FILTERS: ExperienceFilters = {};

const TAB_LABELS: Record<ExperienceTab, string> = {
  tours: 'Guided Tours',
  activities: 'Activities',
};

interface ExperiencesExploreScreenProps {
  initialTab?: ExperienceTab;
  city?: string;
  onBack: () => void;
  onOpenExperience: (slug: string) => void;
}

function ExploreEmptyState({
  tab,
  hasActiveFilters,
  onClearFilters,
  onSwitchTab,
}: {
  tab: ExperienceTab;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onSwitchTab?: () => void;
}) {
  const isTours = tab === 'tours';

  return (
    <div className="text-center py-12 px-4">
      <div className="w-16 h-16 rounded-full bg-gamana-500/10 flex items-center justify-center mx-auto mb-4">
        <Compass size={28} className="text-gamana-500" />
      </div>
      <h3 className="text-base font-semibold text-heading mb-1">
        {hasActiveFilters
          ? 'No matches for your filters'
          : isTours
            ? 'No guided tours available right now'
            : 'No activities available right now'}
      </h3>
      <p className="text-sm text-muted leading-relaxed max-w-[260px] mx-auto">
        {hasActiveFilters
          ? 'Try clearing filters or switching categories to see more bookable experiences.'
          : isTours
            ? 'Check back soon — or browse activities for workshops, tickets, and more.'
            : 'Try the On request filter for workshop-style experiences, or browse guided tours.'}
      </p>
      <div className="flex flex-col gap-2 mt-6 max-w-[240px] mx-auto">
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="w-full py-3 rounded-xl bg-gamana-500 text-white font-semibold text-sm"
          >
            Clear all filters
          </button>
        )}
        {onSwitchTab && (
          <button
            type="button"
            onClick={onSwitchTab}
            className="w-full py-3 rounded-xl border border-gamana-200 text-gamana-600 font-semibold text-sm"
          >
            {isTours ? 'Browse activities' : 'Browse guided tours'}
          </button>
        )}
      </div>
    </div>
  );
}

export default function ExperiencesExploreScreen({
  initialTab = 'tours',
  city = 'Bengaluru',
  onBack,
  onOpenExperience,
}: ExperiencesExploreScreenProps) {
  const [tab, setTab] = useState<ExperienceTab>(initialTab);
  const [sheetFilters, setSheetFilters] = useState<ExperienceSheetFilters>(DEFAULT_SHEET_FILTERS);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { items, total, isLoading } = useExperienceList(
    city,
    tab,
    NO_BAR_FILTERS,
    'recommended',
    sheetFilters,
  );

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    trackExperienceEvent('experience_list_viewed', { city, category: tab });
  }, [city, tab]);

  const activeFilterCount = useMemo(() => countActiveSheetFilters(sheetFilters), [sheetFilters]);

  const hasActiveFilters = activeFilterCount > 0;

  function handleClearFilters() {
    setSheetFilters(DEFAULT_SHEET_FILTERS);
  }

  function handleTabChange(next: ExperienceTab) {
    setTab(next);
    setSheetFilters(DEFAULT_SHEET_FILTERS);
  }

  return (
    <div className="relative flex flex-col h-full bg-canvas">
      <StatusBar />
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gamana-100/80 bg-surface">
        <button
          type="button"
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-gamana-500/10"
          aria-label="Back"
        >
          <ArrowLeft size={20} className="text-heading" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold text-heading">Book experiences</h1>
          <p className="text-xs text-muted">{city}</p>
        </div>
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="relative flex items-center gap-1.5 px-3 py-2 rounded-full bg-gamana-500/8 border border-gamana-200 text-xs font-semibold text-gamana-600"
        >
          <SlidersHorizontal size={14} />
          Filters
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-gamana-500 text-white text-[10px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      <div className="px-4 pt-3">
        <div className="flex gap-1.5 p-1 rounded-xl bg-surface border border-gamana-100">
          {(['tours', 'activities'] as ExperienceTab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => handleTabChange(t)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                tab === t ? 'bg-gamana-500 text-white shadow-sm' : 'text-gamana-600/50'
              }`}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mx-4 mt-2 px-3 py-2 rounded-lg bg-gamana-500/8 border border-gamana-200 flex items-center justify-between">
          <p className="text-xs font-medium text-gamana-700">
            {activeFilterCount} filter{activeFilterCount === 1 ? '' : 's'} active
            {total > 0 ? ` · ${total} result${total === 1 ? '' : 's'}` : ''}
          </p>
          <button
            type="button"
            onClick={handleClearFilters}
            className="text-xs font-semibold text-gamana-600 underline"
          >
            Clear
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-8 space-y-4">
        {isLoading ? (
          <div className="space-y-4 py-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-full h-64 rounded-2xl bg-gamana-500/10 animate-pulse"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <ExploreEmptyState
            tab={tab}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={handleClearFilters}
            onSwitchTab={() => handleTabChange(tab === 'tours' ? 'activities' : 'tours')}
          />
        ) : (
          items.map((item) => (
            <ExperienceBookCard
              key={item.id}
              layout="feed"
              item={item}
              onOpen={() => {
                trackExperienceEvent('experience_card_opened', {
                  experienceId: item.id,
                  category: tab,
                  city,
                });
                onOpenExperience(item.slug);
              }}
              onBook={() => {
                trackExperienceEvent('experience_card_opened', {
                  experienceId: item.id,
                  category: tab,
                  city,
                });
                onOpenExperience(item.slug);
              }}
            />
          ))
        )}
      </div>

      <ExperienceFilterSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onApply={setSheetFilters}
        initialFilters={sheetFilters}
        resultCount={total}
        tab={tab}
        city={city}
      />
    </div>
  );
}
