import { Star } from 'lucide-react';
import type { Experience } from '../../../types/experience';
import { resolveOperatorName } from '../../../lib/experience-seed-helpers';
import { formatDurationLabel } from '../../../lib/experience-mappers';

interface ExperienceDetailHeaderProps {
  experience: Experience;
  onOperatorClick?: () => void;
}

export default function ExperienceDetailHeader({
  experience,
  onOperatorClick,
}: ExperienceDetailHeaderProps) {
  const operator = resolveOperatorName(experience);
  const durationLabel = formatDurationLabel(experience.durationMinutes);
  const reviewCount = experience.reviewSummary?.count;

  return (
    <div className="px-4 pt-4 pb-1">
      <p className="text-xs text-muted mb-2">
        by{' '}
        {onOperatorClick && experience.sourceVendorId ? (
          <button
            type="button"
            onClick={onOperatorClick}
            className="font-medium text-heading underline underline-offset-2"
          >
            {operator}
          </button>
        ) : (
          <span className="font-medium text-heading">{operator}</span>
        )}
      </p>
      <div className="flex flex-wrap gap-2 mb-3">
        <span className="px-2.5 py-1 rounded-lg bg-gamana-500/10 text-[11px] font-semibold text-gamana-600">
          {experience.category}
        </span>
        <span className="px-2.5 py-1 rounded-lg bg-canvas text-[11px] font-medium text-muted border border-gamana-100">
          {experience.experienceType}
        </span>
      </div>
      <h1 className="text-xl font-bold text-heading leading-snug tracking-tight">
        {experience.title}
      </h1>
      <p className="text-sm text-muted mt-2 leading-relaxed line-clamp-3">
        {experience.shortDescription}
      </p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-muted">
        {durationLabel && <span>{durationLabel}</span>}
        {experience.ratingValue != null && (
          <span className="flex items-center gap-1 text-amber-600 font-medium">
            <Star size={14} fill="currentColor" />
            {experience.ratingValue.toFixed(1)}
            {reviewCount != null && (
              <span className="text-muted font-normal text-xs">
                ({reviewCount.toLocaleString()} reviews)
              </span>
            )}
          </span>
        )}
      </div>
    </div>
  );
}
