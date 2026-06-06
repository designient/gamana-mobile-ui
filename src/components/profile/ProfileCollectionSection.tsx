import { ChevronRight, Library } from 'lucide-react';
import {
  useMyCollection,
  type CollectionTab,
  type CollectionPreviewItem,
} from '../../hooks/useMyCollection';
import CollectionListRow from './CollectionListRow';

interface ProfileCollectionSectionProps {
  cityId: string;
  onSeeAll: (tab?: CollectionTab) => void;
  onOpenPreview: (item: CollectionPreviewItem) => void;
  onExploreLibrary: () => void;
}

const TAB_LABELS: { id: CollectionTab; label: string }[] = [
  { id: 'stories', label: 'Stories' },
  { id: 'audio_tours', label: 'Audio tours' },
  { id: 'my_tours', label: 'My tours' },
  { id: 'bookings', label: 'Bookings' },
];

export default function ProfileCollectionSection({
  cityId,
  onSeeAll,
  onOpenPreview,
  onExploreLibrary,
}: ProfileCollectionSectionProps) {
  const { previewItems, totalCount, isLoading, stories, audioTours, myTours, bookings } =
    useMyCollection(cityId);

  const counts: Record<CollectionTab, number> = {
    stories: stories.length,
    audio_tours: audioTours.length,
    my_tours: myTours.length,
    bookings: bookings.length,
  };

  return (
    <div className="bg-surface rounded-xl mb-1 mt-3 overflow-hidden">
      <button
        type="button"
        onClick={() => onSeeAll()}
        className="w-full flex items-center justify-between px-4 pt-3.5 pb-2 hover:bg-surface-alt transition-colors"
      >
        <div className="flex items-center gap-2">
          <Library size={16} className="text-gamana-500" />
          <span className="text-sm font-semibold text-heading">My Collection</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gamana-600 font-medium">
          {totalCount > 0 ? `${totalCount} items` : 'See all'}
          <ChevronRight size={16} className="text-faint" />
        </div>
      </button>

      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide px-4 pb-3">
        {TAB_LABELS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSeeAll(tab.id)}
            className="flex-none px-3 py-1 rounded-full text-[11px] font-semibold border border-gamana-200/80 text-gamana-600 bg-canvas hover:bg-gamana-500/8"
          >
            {tab.label}
            {counts[tab.id] > 0 && (
              <span className="ml-1 text-muted font-normal">({counts[tab.id]})</span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="px-4 pb-4 flex justify-center py-6">
          <div className="w-8 h-8 rounded-full border-2 border-gamana-200 border-t-gamana-500 animate-spin" />
        </div>
      ) : previewItems.length === 0 ? (
        <div className="px-4 pb-4 text-center">
          <p className="text-xs text-muted leading-relaxed mb-3">
            Unlocked stories, audio tours, your walking tours, and confirmed bookings appear here.
          </p>
          <button
            type="button"
            onClick={onExploreLibrary}
            className="text-xs font-semibold text-gamana-600 px-4 py-2 rounded-xl bg-gamana-500/10"
          >
            Go to Library
          </button>
        </div>
      ) : (
        <div className="px-4 pb-4 flex flex-col gap-2">
          {previewItems.map((item) => (
            <CollectionListRow
              key={item.id}
              item={item}
              onPress={() => onOpenPreview(item)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
