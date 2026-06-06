import { useState, useRef, useEffect } from 'react';
import { ArrowUpDown, ChevronDown } from 'lucide-react';

export type TourFilter = 'all' | 'unlocked' | 'locked' | 'short' | 'long';
export type TourSort = 'recommended' | 'price_asc' | 'price_desc' | 'duration_asc' | 'duration_desc';

const FILTERS: { id: TourFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'unlocked', label: 'Unlocked' },
  { id: 'locked', label: 'Locked' },
  { id: 'short', label: '1-3 stops' },
  { id: 'long', label: '4+ stops' },
];

const SORTS: { id: TourSort; label: string }[] = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'price_asc', label: 'Price: Low → High' },
  { id: 'price_desc', label: 'Price: High → Low' },
  { id: 'duration_asc', label: 'Duration: Shortest' },
  { id: 'duration_desc', label: 'Duration: Longest' },
];

interface TourFilterBarProps {
  activeFilter: TourFilter;
  onFilterChange: (filter: TourFilter) => void;
  sortBy: TourSort;
  onSortChange: (sort: TourSort) => void;
  compact?: boolean;
}

export default function TourFilterBar({
  activeFilter,
  onFilterChange,
  sortBy,
  onSortChange,
  compact = false,
}: TourFilterBarProps) {
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

  const currentSortLabel = SORTS.find((s) => s.id === sortBy)?.label ?? 'Sort';

  return (
    <div className={`flex items-center gap-2 ${compact ? 'px-4' : 'px-4'} mb-2`}>
      <div className="flex-1 flex overflow-x-auto gap-1.5 scrollbar-hide">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => onFilterChange(f.id)}
            className={`flex-none px-3 py-1.5 rounded-full text-[11px] font-semibold transition-colors whitespace-nowrap ${
              activeFilter === f.id
                ? 'bg-gamana-500 text-white shadow-sm'
                : 'bg-gamana-500/8 text-gamana-600/70 hover:bg-gamana-500/15'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="relative flex-shrink-0" ref={dropdownRef}>
        <button
          onClick={() => setSortOpen((o) => !o)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-gamana-500/8 text-gamana-600/70 hover:bg-gamana-500/15 text-[11px] font-semibold transition-colors"
        >
          <ArrowUpDown size={11} />
          {compact ? '' : <span className="hidden sm:inline">{currentSortLabel}</span>}
          <ChevronDown size={10} className={`transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
        </button>

        {sortOpen && (
          <div className="absolute right-0 top-full mt-1 w-44 bg-surface rounded-xl shadow-elevated border border-gamana-100 py-1 z-50 animate-fade-in">
            {SORTS.map((s) => (
              <button
                key={s.id}
                onClick={() => { onSortChange(s.id); setSortOpen(false); }}
                className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                  sortBy === s.id
                    ? 'text-gamana-600 font-semibold bg-gamana-500/8'
                    : 'text-gamana-600/70 hover:bg-gamana-500/5'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
