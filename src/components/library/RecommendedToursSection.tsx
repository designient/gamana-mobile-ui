import { useState, useMemo } from 'react';
import { Clock, Route, Coins, Calendar, Sparkles, CheckCircle2, PlayCircle } from 'lucide-react';
import type { CityPack } from '../../types';
import { getContentAccess } from '../../lib/localDb';
import TourFilterBar, { type TourFilter, type TourSort } from '../shared/TourFilterBar';

interface RecommendedToursSectionProps {
  packs: CityPack[];
  isLoading: boolean;
  onTapPack: (packId: string) => void;
}

function formatDuration(seconds: number): string {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
}

function isPackUnlocked(packId: string): boolean {
  const access = getContentAccess('pack', packId);
  return access.is_unlocked && !access.is_expired;
}

export default function RecommendedToursSection({ packs, isLoading, onTapPack }: RecommendedToursSectionProps) {
  const [activeFilter, setActiveFilter] = useState<TourFilter>('all');
  const [sortBy, setSortBy] = useState<TourSort>('recommended');

  const filteredPacks = useMemo(() => {
    let result = [...packs];

    if (activeFilter === 'unlocked') {
      result = result.filter((p) => isPackUnlocked(p.id));
    } else if (activeFilter === 'locked') {
      result = result.filter((p) => !isPackUnlocked(p.id));
    } else if (activeFilter === 'short') {
      result = result.filter((p) => p.story_count <= 3);
    } else if (activeFilter === 'long') {
      result = result.filter((p) => p.story_count >= 4);
    }

    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.coin_cost - b.coin_cost);
        break;
      case 'price_desc':
        result.sort((a, b) => b.coin_cost - a.coin_cost);
        break;
      case 'duration_asc':
        result.sort((a, b) => a.total_duration_seconds - b.total_duration_seconds);
        break;
      case 'duration_desc':
        result.sort((a, b) => b.total_duration_seconds - a.total_duration_seconds);
        break;
      default:
        result.sort((a, b) => a.sort_order - b.sort_order);
    }

    return result;
  }, [packs, activeFilter, sortBy]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-8 h-8 rounded-full border-2 border-gamana-200 border-t-gamana-500 animate-spin" />
      </div>
    );
  }

  if (packs.length === 0) return null;

  return (
    <div className="pt-2 flex flex-col gap-3">
      <div className="flex items-center gap-2 px-5">
        <Sparkles size={14} className="text-amber-500" />
        <span className="text-xs font-semibold text-body uppercase tracking-wider">
          Recommended by Gamana
        </span>
      </div>

      <TourFilterBar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      <div className="px-4 flex flex-col gap-3">
      {filteredPacks.map((pack) => {
        const access = getContentAccess('pack', pack.id);
        const isUnlocked = access.is_unlocked && !access.is_expired;

        return (
          <button
            key={pack.id}
            onClick={() => onTapPack(pack.id)}
            className="group relative overflow-hidden rounded-2xl shadow-card transition-all hover:shadow-elevated active:scale-[0.98]"
          >
            <div className="relative h-44">
              {pack.image_url ? (
                <img
                  src={pack.image_url}
                  alt={pack.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gamana-100 to-gamana-200" />
              )}
              <div className={`absolute inset-0 ${
                isUnlocked
                  ? 'bg-gradient-to-t from-emerald-900/70 via-black/20 to-transparent'
                  : 'bg-gradient-to-t from-black/70 via-black/20 to-transparent'
              }`} />

              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-base font-semibold text-white mb-1">{pack.title}</h3>
                <p className="text-xs text-white/75 leading-relaxed line-clamp-1 mb-2.5">{pack.subtitle}</p>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-medium text-white/90 flex items-center gap-1">
                    <Route size={12} />
                    {pack.story_count} {pack.story_count === 1 ? 'stop' : 'stops'}
                  </span>
                  <span className="text-[11px] font-medium text-white/90 flex items-center gap-1">
                    <Clock size={12} />
                    {formatDuration(pack.total_duration_seconds)}
                  </span>
                  {isUnlocked && access.days_remaining > 0 ? (
                    <span className="text-[11px] font-medium text-emerald-200 flex items-center gap-1">
                      <Calendar size={12} />
                      {access.days_remaining}d left
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-white/90 flex items-center gap-1">
                      <Calendar size={12} />
                      30-day access
                    </span>
                  )}
                </div>
              </div>

              <div className="absolute top-3 right-3">
                {isUnlocked ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-600/90 backdrop-blur-sm">
                    <CheckCircle2 size={12} className="text-emerald-200" />
                    <span className="text-[11px] font-bold text-white">Unlocked</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-black/30 backdrop-blur-sm">
                    <Coins size={12} className="text-amber-400" />
                    <span className="text-[11px] font-semibold text-white">{pack.coin_cost}</span>
                  </div>
                )}
              </div>

              {isUnlocked && (
                <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-emerald-600/90 backdrop-blur-sm">
                  <PlayCircle size={12} className="text-white" />
                  <span className="text-[11px] font-bold text-white">Start Tour</span>
                </div>
              )}
            </div>
          </button>
        );
      })}
      {filteredPacks.length === 0 && (
        <div className="text-center py-8 text-xs text-muted">
          No tours match this filter
        </div>
      )}
      </div>
    </div>
  );
}
