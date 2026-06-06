import { Star, BookOpen } from 'lucide-react';
import type { ExperienceListItemView } from '../../types/experience';

interface ExperienceCardProps {
  item: ExperienceListItemView;
  variant?: 'horizontal' | 'list';
  onClick: () => void;
}

export default function ExperienceCard({
  item,
  variant = 'list',
  onClick,
}: ExperienceCardProps) {
  const isHorizontal = variant === 'horizontal';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        text-left transition-transform active:scale-[0.98]
        ${isHorizontal
          ? 'flex-none w-64 rounded-2xl overflow-hidden bg-surface border border-gamana-100 shadow-card snap-start'
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
        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/50 text-[10px] font-semibold text-white">
          {item.sourceLabel}
        </span>
      </div>

      <div className={isHorizontal ? 'p-3' : 'flex-1 min-w-0'}>
        <h4 className={`font-semibold text-heading ${isHorizontal ? 'text-sm line-clamp-2' : 'text-sm truncate'}`}>
          {item.title}
        </h4>
        {item.summary && (
          <p className={`text-xs text-muted mt-0.5 ${isHorizontal ? 'line-clamp-2' : 'truncate'}`}>
            {item.summary}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          {item.durationLabel && (
            <span className="text-[10px] font-medium text-gamana-600/70">{item.durationLabel}</span>
          )}
          {item.priceLabel && (
            <span className="text-[10px] font-semibold text-gamana-600">{item.priceLabel}</span>
          )}
          {item.ratingValue != null && (
            <span className="flex items-center gap-0.5 text-[10px] text-amber-600 font-medium">
              <Star size={10} fill="currentColor" />
              {item.ratingValue.toFixed(1)}
            </span>
          )}
        </div>
        {item.badges.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {item.badges.slice(0, 3).map((b) => (
              <span
                key={b}
                className="px-1.5 py-0.5 rounded-md bg-gamana-500/8 text-[9px] font-semibold text-gamana-600/80"
              >
                {b}
              </span>
            ))}
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
