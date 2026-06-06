import { ChevronRight } from 'lucide-react';
import type { CollectionPreviewItem } from '../../hooks/useMyCollection';

const KIND_LABELS: Record<CollectionPreviewItem['kind'], string> = {
  story: 'Story',
  audio_tour: 'Audio tour',
  my_tour: 'My tour',
  booking: 'Booked',
};

interface CollectionListRowProps {
  item: CollectionPreviewItem;
  onPress: () => void;
}

export default function CollectionListRow({ item, onPress }: CollectionListRowProps) {
  const statusLabel = item.isExpired
    ? 'Expired'
    : item.kind === 'booking'
      ? item.uiTabIntent === 'tours'
        ? 'Tour booking'
        : 'Activity'
      : item.kind === 'story' || item.kind === 'audio_tour'
        ? 'Unlocked'
        : undefined;

  return (
    <button
      type="button"
      onClick={onPress}
      className="w-full flex items-center gap-3 p-3.5 bg-surface rounded-xl border border-gamana-100/80 text-left hover:bg-surface-alt transition-colors active:scale-[0.99]"
    >
      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gamana-100">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[10px] font-semibold text-gamana-400">
            {KIND_LABELS[item.kind].slice(0, 1)}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-heading truncate">{item.title}</p>
        <p className="text-xs text-muted truncate mt-0.5">{item.subtitle}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] font-medium text-gamana-600 bg-gamana-500/10 px-2 py-0.5 rounded-full">
            {KIND_LABELS[item.kind]}
          </span>
          {statusLabel && (
            <span
              className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                item.isExpired
                  ? 'text-amber-700 bg-amber-50'
                  : 'text-emerald-700 bg-emerald-50'
              }`}
            >
              {statusLabel}
            </span>
          )}
        </div>
      </div>
      <ChevronRight size={18} className="text-faint flex-shrink-0" />
    </button>
  );
}
