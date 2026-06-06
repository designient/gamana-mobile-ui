import { useState, useRef, useEffect } from 'react';
import { Search, ArrowUpDown, ChevronDown, X } from 'lucide-react';

export type StoryFilter = 'all' | 'featured' | 'verified' | 'legend' | 'unlocked' | 'short' | 'long';
export type StorySort = 'nearest' | 'farthest' | 'duration_asc' | 'duration_desc' | 'newest';
export type RadiusOption = 5000 | 10000 | 25000 | 50000 | null;

const RADIUS_OPTIONS: { value: RadiusOption; label: string }[] = [
  { value: 5000, label: '5 km' },
  { value: 10000, label: '10 km' },
  { value: 25000, label: '25 km' },
  { value: 50000, label: '50 km' },
  { value: null, label: 'All' },
];

const FILTERS: { id: StoryFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'featured', label: 'Featured' },
  { id: 'verified', label: 'Verified' },
  { id: 'legend', label: 'Legend' },
  { id: 'unlocked', label: 'Unlocked' },
  { id: 'short', label: '< 5 min' },
  { id: 'long', label: '5+ min' },
];

const SORTS: { id: StorySort; label: string }[] = [
  { id: 'nearest', label: 'Nearest First' },
  { id: 'farthest', label: 'Farthest First' },
  { id: 'duration_asc', label: 'Duration: Shortest' },
  { id: 'duration_desc', label: 'Duration: Longest' },
  { id: 'newest', label: 'Newest' },
];

interface StoriesToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedRadius: RadiusOption;
  onRadiusChange: (radius: RadiusOption) => void;
  activeFilter: StoryFilter;
  onFilterChange: (filter: StoryFilter) => void;
  sortBy: StorySort;
  onSortChange: (sort: StorySort) => void;
}

export default function StoriesToolbar({
  searchQuery,
  onSearchChange,
  selectedRadius,
  onRadiusChange,
  activeFilter,
  onFilterChange,
  sortBy,
  onSortChange,
}: StoriesToolbarProps) {
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

  return (
    <div className="flex flex-col gap-2.5 px-4 pt-3 pb-1">
      {/* Search bar */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gamana-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search stories..."
          className="w-full pl-9 pr-8 py-2 rounded-xl bg-canvas border border-gamana-100 text-sm text-heading placeholder:text-gamana-400 focus:outline-none focus:ring-1 focus:ring-gamana-300 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gamana-400 hover:text-gamana-600 transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Radius selector */}
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] font-semibold text-gamana-600/60 uppercase tracking-wider flex-shrink-0 mr-1">
          Radius
        </span>
        {RADIUS_OPTIONS.map((opt) => (
          <button
            key={opt.label}
            onClick={() => onRadiusChange(opt.value)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
              selectedRadius === opt.value
                ? 'bg-gamana-500 text-white shadow-sm'
                : 'bg-gamana-500/8 text-gamana-600/70 hover:bg-gamana-500/15'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Filter chips + sort */}
      <div className="flex items-center gap-2">
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
    </div>
  );
}
