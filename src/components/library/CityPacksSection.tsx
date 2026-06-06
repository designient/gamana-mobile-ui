import { Clock, Route, Coins, Calendar } from 'lucide-react';
import type { CityPack } from '../../types';
import LibraryEmptyState from './LibraryEmptyState';

interface CityPacksSectionProps {
  packs: CityPack[];
  isLoading: boolean;
  onTapPack: (packId: string) => void;
  onEmptyAction: () => void;
}

function formatDuration(seconds: number): string {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
}

export default function CityPacksSection({ packs, isLoading, onTapPack, onEmptyAction }: CityPacksSectionProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-10 h-10 rounded-full border-2 border-gamana-200 border-t-gamana-500 animate-spin" />
        <p className="text-sm text-muted mt-3">Loading curated tours...</p>
      </div>
    );
  }

  if (packs.length === 0) {
    return <LibraryEmptyState tab="tours" onAction={onEmptyAction} />;
  }

  return (
    <div className="px-4 pt-4 flex flex-col gap-3">
      <div className="flex items-center gap-2 px-1">
        <Route size={14} className="text-gamana-500" />
        <span className="text-xs font-medium text-gamana-600">
          {packs.length} curated {packs.length === 1 ? 'tour' : 'tours'}
        </span>
      </div>

      {packs.map((pack) => (
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

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
                <span className="text-[11px] font-medium text-white/90 flex items-center gap-1">
                  <Calendar size={12} />
                  30-day access
                </span>
              </div>
            </div>

            <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-black/30 backdrop-blur-sm">
              <Coins size={12} className="text-amber-400" />
              <span className="text-[11px] font-semibold text-white">{pack.coin_cost}</span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
