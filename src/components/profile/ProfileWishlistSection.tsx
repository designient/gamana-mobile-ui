import { ChevronRight, Heart } from 'lucide-react';
import { useWishlistedExperiences } from '../../hooks/useWishlistedExperiences';
import WishlistPreviewCard from './WishlistPreviewCard';

interface ProfileWishlistSectionProps {
  onSeeAll: () => void;
  onOpenExperience: (slug: string) => void;
  onExplore: () => void;
}

export default function ProfileWishlistSection({
  onSeeAll,
  onOpenExperience,
  onExplore,
}: ProfileWishlistSectionProps) {
  const { items, isLoading, count } = useWishlistedExperiences();
  const preview = items.slice(0, 4);

  return (
    <div className="bg-surface rounded-xl mb-1 mt-3 overflow-hidden">
      <button
        type="button"
        onClick={onSeeAll}
        className="w-full flex items-center justify-between px-4 pt-3.5 pb-2 hover:bg-surface-alt transition-colors"
      >
        <div className="flex items-center gap-2">
          <Heart size={16} className="text-rose-400 fill-rose-400" />
          <span className="text-sm font-semibold text-heading">Wishlist</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gamana-600 font-medium">
          {count > 0 ? `${count} saved` : 'See all'}
          <ChevronRight size={16} className="text-faint" />
        </div>
      </button>

      {isLoading ? (
        <div className="px-4 pb-4 flex justify-center py-6">
          <div className="w-8 h-8 rounded-full border-2 border-gamana-200 border-t-gamana-500 animate-spin" />
        </div>
      ) : preview.length === 0 ? (
        <div className="px-4 pb-4 text-center">
          <p className="text-xs text-muted leading-relaxed mb-3">
            Save experiences you want to book later with the heart on any activity card.
          </p>
          <button
            type="button"
            onClick={onExplore}
            className="text-xs font-semibold text-gamana-600 px-4 py-2 rounded-xl bg-gamana-500/10"
          >
            Explore experiences
          </button>
        </div>
      ) : (
        <div className="flex gap-2.5 overflow-x-auto scrollbar-hide px-4 pb-4">
          {preview.map((item) => (
            <WishlistPreviewCard
              key={item.id}
              item={item}
              onOpen={() => onOpenExperience(item.slug)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
