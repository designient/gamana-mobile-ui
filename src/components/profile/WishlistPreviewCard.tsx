import type { ExperienceListItemView } from '../../types/experience';

interface WishlistPreviewCardProps {
  item: ExperienceListItemView;
  onOpen: () => void;
}

export default function WishlistPreviewCard({ item, onOpen }: WishlistPreviewCardProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex-none w-[140px] rounded-xl overflow-hidden bg-surface border border-gamana-100 text-left active:scale-[0.98] transition-transform"
    >
      <div className="h-20 bg-gamana-100 relative">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
        ) : null}
      </div>
      <div className="p-2.5">
        <p className="text-xs font-semibold text-heading line-clamp-2 leading-snug">{item.title}</p>
        {item.priceLabel && (
          <p className="text-[10px] font-semibold text-gamana-600 mt-1">{item.priceLabel}</p>
        )}
      </div>
    </button>
  );
}
