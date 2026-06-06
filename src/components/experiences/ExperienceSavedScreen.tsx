import { ArrowLeft } from 'lucide-react';
import { useWishlistedExperiences } from '../../hooks/useWishlistedExperiences';
import type { ExperienceListItemView } from '../../types/experience';
import StatusBar from '../layout/StatusBar';
import ExperienceCard from './ExperienceCard';

type AvailabilityStatus = 'available' | 'selling_fast' | 'sold_out';

function getAvailabilityStatus(item: ExperienceListItemView): AvailabilityStatus {
  if (item.slug === 'nandi-hills-day-trip') return 'sold_out';
  if (item.promoBadge === 'selling_out') return 'selling_fast';
  return 'available';
}

const STATUS_STYLES: Record<AvailabilityStatus, string> = {
  available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  selling_fast: 'bg-amber-50 text-amber-700 border-amber-200',
  sold_out: 'bg-rose-50 text-rose-700 border-rose-200',
};

const STATUS_LABELS: Record<AvailabilityStatus, string> = {
  available: 'Available',
  selling_fast: 'Selling fast',
  sold_out: 'Sold out today',
};

interface ExperienceSavedScreenProps {
  onBack: () => void;
  onOpenExperience: (slug: string) => void;
  onExplore: () => void;
}

function SavedExperienceTile({
  item,
  onOpen,
  onBook,
}: {
  item: ExperienceListItemView;
  onOpen: () => void;
  onBook: () => void;
}) {
  const status = getAvailabilityStatus(item);
  const soldOut = status === 'sold_out';

  return (
    <div className="relative">
      <span
        className={`absolute top-3 right-3 z-10 px-2 py-0.5 rounded-full text-[9px] font-semibold border ${STATUS_STYLES[status]}`}
      >
        {STATUS_LABELS[status]}
      </span>
      <ExperienceCard item={item} variant="list" onClick={onOpen} />
      <div className="px-3 -mt-1 pb-1">
        <button
          type="button"
          disabled={soldOut}
          onClick={onBook}
          className="w-full py-2.5 rounded-xl bg-gamana-500 text-white text-xs font-bold disabled:opacity-50"
        >
          {soldOut ? 'Sold Out' : item.ctaLabel === 'Confirm availability' ? 'Check dates' : 'Book'}
        </button>
      </div>
    </div>
  );
}

export default function ExperienceSavedScreen({
  onBack,
  onOpenExperience,
  onExplore,
}: ExperienceSavedScreenProps) {
  const { items, isLoading } = useWishlistedExperiences();

  return (
    <div className="flex flex-col h-full min-h-0 bg-canvas">
      <StatusBar />

      <div className="flex items-center gap-2 px-4 py-3 border-b border-gamana-100">
        <button type="button" onClick={onBack} className="p-2 -ml-2">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-base font-semibold text-heading">Saved experiences</h1>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide px-4 py-4 pb-8">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 rounded-full border-2 border-gamana-200 border-t-gamana-500 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 px-4">
            <p className="text-sm text-muted leading-relaxed">
              No saved experiences yet.{' '}
              <button
                type="button"
                onClick={onExplore}
                className="text-gamana-600 font-semibold underline"
              >
                Start exploring →
              </button>
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {items.map((item) => (
              <SavedExperienceTile
                key={item.id}
                item={item}
                onOpen={() => onOpenExperience(item.slug)}
                onBook={() => onOpenExperience(item.slug)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
