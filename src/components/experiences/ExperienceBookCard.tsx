import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import type { ExperienceListItemView } from '../../types/experience';
import {
  PROMO_BADGE_LABELS,
  PROMO_BADGE_STYLES,
} from '../../lib/experience-mappers';
import { isExperienceSaved, toggleExperienceSaved } from '../../lib/experience-saved';
import {
  FormatChip,
  VibePill,
  ExperiencePropertyLabels,
  ExperienceMetaLine,
} from './ExperienceCardMeta';

export type ExperienceBookCardLayout = 'carousel' | 'feed';

interface ExperienceBookCardProps {
  item: ExperienceListItemView;
  onOpen: () => void;
  onBook: () => void;
  layout?: ExperienceBookCardLayout;
}

export default function ExperienceBookCard({
  item,
  onOpen,
  onBook,
  layout = 'carousel',
}: ExperienceBookCardProps) {
  const isFeed = layout === 'feed';
  const [saved, setSaved] = useState(() => isExperienceSaved(item.id));

  useEffect(() => {
    setSaved(isExperienceSaved(item.id));
  }, [item.id]);

  const locationLabel = item.localityLabel
    ? `${item.localityLabel}, ${item.cityLabel ?? ''}`
    : item.cityLabel;

  const hasDiscount =
    item.priceWas != null &&
    item.priceFrom != null &&
    item.priceWas > item.priceFrom;

  function handleHeart(e: React.MouseEvent) {
    e.stopPropagation();
    setSaved(toggleExperienceSaved(item.id));
  }

  function handleBook(e: React.MouseEvent) {
    e.stopPropagation();
    onBook();
  }

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => e.key === 'Enter' && onOpen()}
      className={`
        rounded-2xl overflow-hidden bg-surface border border-gamana-100 shadow-card text-left
        transition-transform active:scale-[0.98] cursor-pointer
        ${isFeed ? 'w-full' : 'flex-none w-[254px] snap-start'}
      `}
    >
      <div className={`relative w-full ${isFeed ? 'h-44' : 'h-40'}`}>
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gamana-100" />
        )}

        <div className="absolute top-2 left-2">
          <FormatChip item={item} />
        </div>

        {(item.priceFrom != null || item.priceLabel) && (
          <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-black/55 text-[10px] font-semibold text-white">
            {item.priceFrom != null
              ? `₹${item.priceFrom.toLocaleString('en-IN')}`
              : item.priceLabel}
          </div>
        )}

        {item.promoBadge && (
          <span
            className={`absolute top-10 left-2 px-2 py-0.5 rounded-md text-[9px] font-bold ${PROMO_BADGE_STYLES[item.promoBadge]}`}
          >
            {PROMO_BADGE_LABELS[item.promoBadge]}
          </span>
        )}

        <div className="absolute bottom-2 left-2">
          <VibePill item={item} />
        </div>

        <div className="absolute bottom-2 right-2">
          <button
            type="button"
            onClick={handleHeart}
            className="w-8 h-8 rounded-full bg-black/45 flex items-center justify-center flex-shrink-0"
            aria-label={saved ? 'Remove from saved' : 'Save experience'}
          >
            <Heart
              size={16}
              className={saved ? 'text-rose-400 fill-rose-400' : 'text-white'}
            />
          </button>
        </div>
      </div>

      <div className="p-3">
        {locationLabel && (
          <p className="text-[11px] text-muted mb-0.5 truncate">{locationLabel}</p>
        )}
        <h4 className="text-sm font-semibold text-heading line-clamp-2 leading-snug min-h-[2.5rem]">
          {item.title}
        </h4>
        <ExperiencePropertyLabels item={item} />
        <div className="mt-1.5">
          <ExperienceMetaLine item={item} />
        </div>

        <div className="border-t border-gamana-100 mt-3 pt-2.5 flex items-end justify-between gap-2">
          <div className="min-w-0">
            {hasDiscount ? (
              <>
                <p className="text-[10px] text-muted line-through">
                  ₹{item.priceWas!.toLocaleString('en-IN')}
                </p>
                <p className="text-sm font-bold text-rose-600">
                  From ₹{item.priceFrom!.toLocaleString('en-IN')}
                </p>
              </>
            ) : item.priceFrom != null ? (
              <p className="text-sm font-bold text-gamana-600">
                From ₹{item.priceFrom.toLocaleString('en-IN')}
              </p>
            ) : item.priceLabel ? (
              <p className="text-sm font-bold text-gamana-600">{item.priceLabel}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={handleBook}
            className="flex-shrink-0 px-4 py-2 rounded-lg bg-gamana-500 text-white text-xs font-bold hover:bg-gamana-600 transition-colors"
          >
            Book
          </button>
        </div>
      </div>
    </article>
  );
}
