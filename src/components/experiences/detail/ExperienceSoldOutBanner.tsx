import { AlertTriangle } from 'lucide-react';

interface ExperienceSoldOutBannerProps {
  onCheckDates: () => void;
  onSaveToWishlist: () => void;
  alternativeCount?: number;
  onViewAlternatives?: () => void;
}

export default function ExperienceSoldOutBanner({
  onCheckDates,
  onSaveToWishlist,
  alternativeCount,
  onViewAlternatives,
}: ExperienceSoldOutBannerProps) {
  return (
    <div className="mx-4 mt-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
      <div className="flex gap-2.5">
        <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-amber-900">No availability for these dates.</p>
          {alternativeCount != null && alternativeCount > 0 && onViewAlternatives && (
            <button
              type="button"
              onClick={onViewAlternatives}
              className="text-xs text-amber-700 font-medium mt-1 underline"
            >
              {alternativeCount} similar {alternativeCount === 1 ? 'experience' : 'experiences'} available
            </button>
          )}
          <div className="flex flex-wrap gap-2 mt-3">
            <button
              type="button"
              onClick={onCheckDates}
              className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-semibold"
            >
              Check other dates
            </button>
            <button
              type="button"
              onClick={onSaveToWishlist}
              className="px-4 py-2 rounded-xl border border-amber-300 text-amber-800 text-xs font-semibold bg-white/60"
            >
              Save to wishlist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
