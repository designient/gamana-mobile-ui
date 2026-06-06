import { useState, useMemo } from 'react';
import { Coins, Lock, Star, CheckCircle2, PlayCircle } from 'lucide-react';
import type { CityPack } from '../../types';
import { getContentAccess } from '../../lib/localDb';
import TourFilterBar, { type TourFilter, type TourSort } from '../shared/TourFilterBar';

interface RecommendedToursProps {
  tours: CityPack[];
  onPreviewTour: (tour: CityPack) => void;
}

function isPackUnlocked(packId: string, index: number): boolean {
  const access = getContentAccess('pack', packId);
  return index === 0 || (access.is_unlocked && !access.is_expired);
}

export default function RecommendedTours({ tours, onPreviewTour }: RecommendedToursProps) {
  const [activeFilter, setActiveFilter] = useState<TourFilter>('all');
  const [sortBy, setSortBy] = useState<TourSort>('recommended');

  const filteredTours = useMemo(() => {
    let result = tours.map((t, i) => ({ tour: t, originalIndex: i }));

    if (activeFilter === 'unlocked') {
      result = result.filter(({ tour, originalIndex }) => isPackUnlocked(tour.id, originalIndex));
    } else if (activeFilter === 'locked') {
      result = result.filter(({ tour, originalIndex }) => !isPackUnlocked(tour.id, originalIndex));
    } else if (activeFilter === 'short') {
      result = result.filter(({ tour }) => tour.story_count <= 3);
    } else if (activeFilter === 'long') {
      result = result.filter(({ tour }) => tour.story_count >= 4);
    }

    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.tour.coin_cost - b.tour.coin_cost);
        break;
      case 'price_desc':
        result.sort((a, b) => b.tour.coin_cost - a.tour.coin_cost);
        break;
      case 'duration_asc':
        result.sort((a, b) => a.tour.total_duration_seconds - b.tour.total_duration_seconds);
        break;
      case 'duration_desc':
        result.sort((a, b) => b.tour.total_duration_seconds - a.tour.total_duration_seconds);
        break;
      default:
        result.sort((a, b) => a.tour.sort_order - b.tour.sort_order);
    }

    return result;
  }, [tours, activeFilter, sortBy]);

  if (!tours || tours.length === 0) return null;

  return (
    <div className="mt-5 mb-2 relative">
      <h3 className="text-sm font-semibold text-heading mb-3 px-4">Audio Tours Near You</h3>
      <TourFilterBar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        compact
      />
      <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x">
        <div className="flex-none w-4" aria-hidden />
        {filteredTours.map(({ tour, originalIndex }) => {
          const realAccess = getContentAccess('pack', tour.id);
          const isUnlocked = originalIndex === 0 || (realAccess.is_unlocked && !realAccess.is_expired);
          const daysLeft = originalIndex === 0 && !realAccess.is_unlocked ? 28 : realAccess.days_remaining;

          return (
            <button
              key={tour.id}
              onClick={() => onPreviewTour(tour)}
              className={`flex-none w-64 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden text-left transition-transform active:scale-[0.98] snap-start border ${
                isUnlocked
                  ? 'bg-surface border-emerald-200 ring-1 ring-emerald-100'
                  : 'bg-surface border-gamana-100'
              }`}
            >
              <div className="relative h-36 w-full bg-surface-muted">
                <img
                  src={tour.image_url ?? ''}
                  alt={tour.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className={`absolute inset-0 ${
                  isUnlocked
                    ? 'bg-gradient-to-t from-emerald-900/70 via-transparent to-transparent'
                    : 'bg-gradient-to-t from-gamana-900/80 via-transparent to-transparent'
                }`} />

                {/* Top-right badge — unlocked vs locked */}
                <div className="absolute top-2 right-2">
                  {isUnlocked ? (
                    <div className="flex items-center gap-1.5 bg-emerald-600/90 backdrop-blur-md px-2.5 py-1 rounded-full text-white shadow-sm border border-emerald-400/30">
                      <CheckCircle2 size={12} className="text-emerald-200 drop-shadow-sm" />
                      <span className="text-[11px] font-bold">Unlocked</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full text-white shadow-sm border border-white/10">
                      <Coins size={12} className="text-yellow-400 drop-shadow-sm" />
                      <span className="text-[11px] font-bold">{tour.coin_cost}</span>
                      <Lock size={10} className="ml-0.5 text-white/80" />
                    </div>
                  )}
                </div>

                {/* Bottom info */}
                <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-[11px] font-medium bg-white/20 backdrop-blur-md px-2 py-0.5 rounded flex items-center gap-1">
                      <Star size={10} className="fill-white" /> Featured
                    </span>
                    <span className="text-white/90 text-[11px] font-medium">
                      {tour.story_count} stories
                    </span>
                  </div>
                  {isUnlocked && (
                    <span className="text-emerald-200 text-[10px] font-semibold bg-emerald-900/40 backdrop-blur-md px-2 py-0.5 rounded">
                      {daysLeft}d left
                    </span>
                  )}
                </div>
              </div>

              {/* Card body */}
              <div className="p-3">
                <h4 className="font-semibold text-heading text-sm line-clamp-1">{tour.title}</h4>
                <p className="text-xs text-gamana-500 mt-0.5 line-clamp-2">{tour.subtitle}</p>

                {isUnlocked && (
                  <div className="mt-2 flex items-center gap-1.5 text-emerald-600">
                    <PlayCircle size={14} />
                    <span className="text-xs font-semibold">Start Tour</span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
        {filteredTours.length === 0 && (
          <div className="flex-none w-full text-center py-6 text-xs text-muted">
            No tours match this filter
          </div>
        )}
        <div className="flex-none w-4" aria-hidden />
      </div>
    </div>
  );
}
