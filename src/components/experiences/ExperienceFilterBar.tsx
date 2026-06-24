import { useState, useRef, useEffect } from 'react';
import { ArrowUpDown, ChevronDown } from 'lucide-react';
import type { DifficultyLevel, ExperienceFilters, ExperienceSort, ExperienceTab } from '../../types/experience';

const SORTS: { id: ExperienceSort; label: string }[] = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'price_asc', label: 'Price: Low to High' },
  { id: 'price_desc', label: 'Price: High to Low' },
  { id: 'duration_asc', label: 'Duration' },
  { id: 'rating', label: 'Rating' },
  { id: 'newly_added', label: 'Newly Added' },
];

const TOURS_CATEGORIES = ['Heritage', 'Walking', 'Food & Drink', 'Spiritual', 'Day Trips', 'Adventure'];
const ACTIVITIES_CATEGORIES = [
  'Workshops & Classes',
  'Water Activities',
  'Adventure',
  'Attractions & Tickets',
  'Nature & Wildlife',
  'Nightlife & Entertainment',
  'Shopping & Local Crafts',
  'Other',
];

const DURATIONS = [
  { label: 'Under 2h', min: undefined as number | undefined, max: 120 },
  { label: '2–4h', min: 120, max: 240 },
  { label: '4h+', min: 240, max: undefined as number | undefined },
];

const PRICE_RANGES = [
  { label: 'Under ₹1.5k', min: undefined as number | undefined, max: 1500 },
  { label: '₹1.5k–3.5k', min: 1500, max: 3500 },
  { label: '₹3.5k+', min: 3500, max: undefined as number | undefined },
];

const RATINGS = [
  { label: '4.5+', min: 4.5 },
  { label: '4.0+', min: 4.0 },
];

interface ExperienceFilterBarProps {
  tab: ExperienceTab;
  filters: ExperienceFilters;
  onFiltersChange: (filters: ExperienceFilters) => void;
  sort: ExperienceSort;
  onSortChange: (sort: ExperienceSort) => void;
}

export default function ExperienceFilterBar({
  tab,
  filters,
  onFiltersChange,
  sort,
  onSortChange,
}: ExperienceFilterBarProps) {
  const [sortOpen, setSortOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sortOpen) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [sortOpen]);

  const categories = tab === 'tours' ? TOURS_CATEGORIES : ACTIVITIES_CATEGORIES;
  const currentSortLabel = SORTS.find((s) => s.id === sort)?.label ?? 'Sort';

  function chip(active: boolean) {
    return `flex-none px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-colors ${
      active
        ? 'bg-gamana-500 text-white shadow-sm'
        : 'bg-gamana-500/8 text-gamana-600/70 hover:bg-gamana-500/15'
    }`;
  }

  function toggleCategory(cat: string) {
    onFiltersChange({
      ...filters,
      category: filters.category === cat ? undefined : cat,
    });
  }

  return (
    <div className="px-4 mb-3 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 flex overflow-x-auto gap-1.5 scrollbar-hide">
          <button
            type="button"
            onClick={() => onFiltersChange({ ...filters, category: undefined })}
            className={chip(!filters.category)}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => toggleCategory(cat)}
              className={chip(filters.category === cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative flex-shrink-0" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setSortOpen((o) => !o)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-gamana-500/8 text-gamana-600/70 text-[11px] font-semibold"
          >
            <ArrowUpDown size={11} />
            <ChevronDown size={10} className={sortOpen ? 'rotate-180' : ''} />
          </button>
          {sortOpen && (
            <div className="absolute right-0 top-full mt-1 z-20 min-w-[160px] py-1 rounded-xl bg-surface border border-gamana-100 shadow-elevated">
              {SORTS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    onSortChange(s.id);
                    setSortOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 text-xs ${
                    sort === s.id ? 'text-gamana-500 font-semibold' : 'text-heading'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex overflow-x-auto gap-1.5 scrollbar-hide">
        {tab === 'tours' && (
          <>
            {DURATIONS.map((d) => {
              const active =
                filters.durationMin === d.min && filters.durationMax === d.max;
              return (
                <button
                  key={d.label}
                  type="button"
                  onClick={() =>
                    onFiltersChange({
                      ...filters,
                      durationMin: active ? undefined : d.min,
                      durationMax: active ? undefined : d.max,
                    })
                  }
                  className={chip(active)}
                >
                  {d.label}
                </button>
              );
            })}
            {['English', 'Kannada', 'Hindi'].map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    language: filters.language === lang ? undefined : lang,
                  })
                }
                className={chip(filters.language === lang)}
              >
                {lang}
              </button>
            ))}
          </>
        )}
        {PRICE_RANGES.map((p) => {
          const active = filters.priceMin === p.min && filters.priceMax === p.max;
          return (
            <button
              key={p.label}
              type="button"
              onClick={() =>
                onFiltersChange({
                  ...filters,
                  priceMin: active ? undefined : p.min,
                  priceMax: active ? undefined : p.max,
                })
              }
              className={chip(active)}
            >
              {p.label}
            </button>
          );
        })}
        {(['easy', 'moderate', 'challenging'] as DifficultyLevel[]).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() =>
              onFiltersChange({
                ...filters,
                difficulty: filters.difficulty === d ? undefined : d,
              })
            }
            className={chip(filters.difficulty === d)}
          >
            {d.charAt(0).toUpperCase() + d.slice(1)}
          </button>
        ))}
        <button
          type="button"
          onClick={() =>
            onFiltersChange({
              ...filters,
              pickupAvailable: filters.pickupAvailable ? undefined : true,
            })
          }
          className={chip(!!filters.pickupAvailable)}
        >
          Pickup
        </button>
        {tab === 'activities' && (
          <>
            <button
              type="button"
              onClick={() =>
                onFiltersChange({
                  ...filters,
                  availableTomorrow: filters.availableTomorrow ? undefined : true,
                })
              }
              className={chip(!!filters.availableTomorrow)}
            >
              Available Tomorrow
            </button>
            <button
              type="button"
              onClick={() =>
                onFiltersChange({
                  ...filters,
                  onRequest: filters.onRequest ? undefined : true,
                })
              }
              className={chip(!!filters.onRequest)}
            >
              On request
            </button>
            <button
              type="button"
              onClick={() =>
                onFiltersChange({
                  ...filters,
                  minAge: filters.minAge === 12 ? undefined : 12,
                })
              }
              className={chip(filters.minAge === 12)}
            >
              Family 12+
            </button>
            {RATINGS.map((r) => (
              <button
                key={r.label}
                type="button"
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    ratingMin: filters.ratingMin === r.min ? undefined : r.min,
                  })
                }
                className={chip(filters.ratingMin === r.min)}
              >
                {r.label}
              </button>
            ))}
          </>
        )}
        {tab === 'tours' && (
          <button
            type="button"
            onClick={() =>
              onFiltersChange({
                ...filters,
                instantConfirmation: filters.instantConfirmation ? undefined : true,
              })
            }
            className={chip(!!filters.instantConfirmation)}
          >
            Instant
          </button>
        )}
      </div>
      <p className="text-[10px] text-muted px-0.5">Sorted by {currentSortLabel}</p>
    </div>
  );
}
