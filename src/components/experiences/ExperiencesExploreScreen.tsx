import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { ExperienceFilters, ExperienceSort, ExperienceTab } from '../../types/experience';
import { useExperienceList } from '../../hooks/useExperiences';
import { trackExperienceEvent } from '../../lib/experience-analytics';
import StatusBar from '../layout/StatusBar';
import ExperienceFilterBar from './ExperienceFilterBar';
import ExperienceBookCard from './ExperienceBookCard';

interface ExperiencesExploreScreenProps {
  initialTab?: ExperienceTab;
  city?: string;
  onBack: () => void;
  onOpenExperience: (slug: string) => void;
}

export default function ExperiencesExploreScreen({
  initialTab = 'tours',
  city = 'Bengaluru',
  onBack,
  onOpenExperience,
}: ExperiencesExploreScreenProps) {
  const [tab, setTab] = useState<ExperienceTab>(initialTab);
  const [filters, setFilters] = useState<ExperienceFilters>({});
  const [sort, setSort] = useState<ExperienceSort>('recommended');
  const { items, isLoading } = useExperienceList(city, tab, filters, sort);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    trackExperienceEvent('experience_list_viewed', { city, category: tab });
  }, [city, tab]);

  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      trackExperienceEvent('experience_filter_applied', { city, ...filters });
    }
  }, [filters, city]);

  return (
    <div className="flex flex-col h-full bg-canvas">
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
        <div>
          <h1 className="text-base font-semibold text-heading">Book experiences</h1>
          <p className="text-xs text-muted">{city}</p>
        </div>
      </div>

      <div className="px-4 pt-3">
        <div className="flex gap-1.5 p-1 rounded-xl bg-surface border border-gamana-100">
          {(['tours', 'activities'] as ExperienceTab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTab(t);
                setFilters({});
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                tab === t ? 'bg-gamana-500 text-white shadow-sm' : 'text-gamana-600/50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <ExperienceFilterBar
        tab={tab}
        filters={filters}
        onFiltersChange={setFilters}
        sort={sort}
        onSortChange={(s) => {
          setSort(s);
          trackExperienceEvent('experience_sort_changed', { city, sort: s });
        }}
      />

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
          <p className="text-sm text-muted text-center py-12">
            No experiences match your filters. Try adjusting filters or another tab.
          </p>
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
    </div>
  );
}
