import { Star } from 'lucide-react';
import type { ExperienceReviewSummary } from '../../../types/experience';

interface ExperienceReviewsSummaryProps {
  reviews: ExperienceReviewSummary;
}

export default function ExperienceReviewsSummary({ reviews }: ExperienceReviewsSummaryProps) {
  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <span className="flex items-center gap-1 text-lg font-bold text-heading">
          <Star size={18} className="text-amber-500" fill="currentColor" />
          {reviews.averageRating.toFixed(1)}
        </span>
        <span className="text-sm text-muted">
          {reviews.count.toLocaleString()} verified reviews
        </span>
      </div>
      {reviews.sampleQuotes && reviews.sampleQuotes.length > 0 && (
        <div className="space-y-2.5">
          {reviews.sampleQuotes.map((q) => (
            <blockquote
              key={q.author}
              className="p-3.5 rounded-xl bg-surface border border-gamana-100"
            >
              <div className="flex items-center gap-1 mb-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={10}
                    className={i < q.rating ? 'text-amber-500' : 'text-gamana-200'}
                    fill={i < q.rating ? 'currentColor' : 'none'}
                  />
                ))}
              </div>
              <p className="text-sm text-heading leading-relaxed">&ldquo;{q.text}&rdquo;</p>
              <p className="text-[11px] text-muted mt-2">— {q.author}</p>
            </blockquote>
          ))}
        </div>
      )}
    </>
  );
}
