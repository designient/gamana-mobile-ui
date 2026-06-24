import { BookOpen, Share2 } from 'lucide-react';
import type { ExperienceListItemView } from '../../types/experience';
import { shareExperience } from '../../lib/experience-share';
import { experienceSeedData } from '../../lib/experience-seed-data';
import {
  FormatChip,
  VibePill,
  MicroBadges,
  ExperienceMetaLine,
  InlineFormatVibePills,
} from './ExperienceCardMeta';

interface ExperienceCardProps {
  item: ExperienceListItemView;
  variant?: 'horizontal' | 'list';
  onClick: () => void;
  onShareToast?: () => void;
}

export default function ExperienceCard({
  item,
  variant = 'list',
  onClick,
  onShareToast,
}: ExperienceCardProps) {
  const isHorizontal = variant === 'horizontal';

  async function handleShare(e: React.MouseEvent) {
    e.stopPropagation();
    const exp = experienceSeedData.find((x) => x.id === item.id);
    if (!exp) return;
    await shareExperience(exp, onShareToast);
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        text-left transition-transform active:scale-[0.98]
        ${isHorizontal
          ? 'flex-none w-[254px] rounded-2xl overflow-hidden bg-surface border border-gamana-100 shadow-card snap-start'
          : 'w-full flex gap-3 p-3 rounded-2xl bg-surface border border-gamana-100 shadow-card'
        }
      `}
    >
      <div
        className={
          isHorizontal
            ? 'relative h-36 w-full'
            : 'relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0'
        }
      >
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gamana-100" />
        )}

        {isHorizontal ? (
          <>
            <div className="absolute top-2 left-2">
              <FormatChip item={item} />
            </div>
            {(item.priceFrom != null || item.priceLabel) && (
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/50 text-[10px] font-semibold text-white">
                {item.priceFrom != null
                  ? `₹${item.priceFrom.toLocaleString('en-IN')}`
                  : item.priceLabel}
              </div>
            )}
            <button
              type="button"
              onClick={handleShare}
              className={`absolute right-2 p-1.5 rounded-full bg-black/40 text-white z-10 ${
                item.priceFrom != null || item.priceLabel ? 'top-10' : 'top-2'
              }`}
              aria-label="Share experience"
            >
              <Share2 size={14} />
            </button>
            <div className="absolute bottom-2 left-2">
              <VibePill item={item} />
            </div>
            <div className="absolute bottom-2 right-2">
              <MicroBadges item={item} />
            </div>
          </>
        ) : (
          <>
            <div className="absolute top-1 left-1 scale-90 origin-top-left">
              <FormatChip item={item} />
            </div>
            <div className="absolute bottom-1 left-1 scale-90 origin-bottom-left">
              <VibePill item={item} />
            </div>
          </>
        )}
      </div>

      <div className={isHorizontal ? 'p-3' : 'flex-1 min-w-0'}>
        {!isHorizontal && <InlineFormatVibePills item={item} />}

        <h4
          className={`font-semibold text-heading ${
            isHorizontal ? 'text-sm line-clamp-2' : 'text-sm truncate'
          }`}
        >
          {item.title}
        </h4>

        {isHorizontal && item.summary && (
          <p className="text-xs text-muted mt-0.5 line-clamp-2">{item.summary}</p>
        )}

        {!isHorizontal && item.summary && (
          <p className="text-xs text-muted mt-0.5 truncate">{item.summary}</p>
        )}

        <div className="mt-2">
          <ExperienceMetaLine item={item} />
        </div>

        {!isHorizontal && (
          <div className="mt-1.5">
            <MicroBadges item={item} />
          </div>
        )}

        {item.hasLinkedStory && item.linkedStoryLabel && (
          <div className="flex items-center gap-1 mt-2 text-[10px] font-medium text-gamana-500">
            <BookOpen size={11} />
            {item.linkedStoryLabel}
          </div>
        )}

        <div className="mt-2">
          <span className="inline-block px-2.5 py-1 rounded-lg bg-gamana-500 text-[10px] font-bold text-white">
            {item.ctaLabel}
          </span>
        </div>
      </div>
    </button>
  );
}
