import { ArrowLeft, X, AlertTriangle } from 'lucide-react';
import type { Experience } from '../../../types/experience';
import { experienceSeedData } from '../../../lib/experience-seed-data';
import { toListItemView } from '../../../lib/experience-mappers';
import StatusBar from '../../layout/StatusBar';

interface BookingFailedScreenProps {
  reason: 'sold_out' | 'payment_error';
  experience: Experience | null;
  onBack: () => void;
  onTryAgain: () => void;
  onBrowseAlternatives: () => void;
  onOpenExperience: (slug: string) => void;
}

export default function BookingFailedScreen({
  reason,
  experience,
  onBack,
  onTryAgain,
  onBrowseAlternatives,
  onOpenExperience,
}: BookingFailedScreenProps) {
  const isSoldOut = reason === 'sold_out';

  const alternatives =
    experience != null
      ? experienceSeedData
          .filter(
            (e) =>
              e.category === experience.category &&
              e.id !== experience.id &&
              e.publicationStatus === 'published' &&
              e.bookableInApp,
          )
          .slice(0, 3)
          .map(toListItemView)
      : [];

  return (
    <div className="flex flex-col h-full min-h-0 bg-canvas">
      <StatusBar />

      {!isSoldOut && (
        <div className="px-4 py-3 border-b border-gamana-100">
          <button type="button" onClick={onBack} className="p-2 -ml-2">
            <ArrowLeft size={20} />
          </button>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide px-4 py-8">
        <div className="max-w-sm mx-auto text-center">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              isSoldOut ? 'bg-rose-50 border-2 border-rose-200' : 'bg-rose-50 border-2 border-rose-300'
            }`}
          >
            {isSoldOut ? (
              <X size={32} className="text-rose-600" strokeWidth={2.5} />
            ) : (
              <AlertTriangle size={32} className="text-rose-600" />
            )}
          </div>

          <h1 className="text-xl font-bold text-heading">
            {isSoldOut ? 'Slot Just Sold Out' : "Payment Couldn't Go Through"}
          </h1>
          <p className="text-sm text-muted mt-2 leading-relaxed">
            {isSoldOut
              ? 'Someone else booked the last spot.'
              : "Your card wasn't charged."}
          </p>

          {experience && (
            <p className="text-xs text-muted mt-3">{experience.title}</p>
          )}

          <div className="flex flex-col gap-2.5 mt-6">
            {isSoldOut ? (
              <>
                <button
                  type="button"
                  onClick={onTryAgain}
                  className="w-full py-3.5 rounded-xl bg-gamana-500 text-white font-bold text-sm"
                >
                  Try another date
                </button>
                <button
                  type="button"
                  onClick={onBrowseAlternatives}
                  className="w-full py-3.5 rounded-xl border border-gamana-200 text-gamana-600 font-semibold text-sm"
                >
                  Browse similar
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onTryAgain}
                  className="w-full py-3.5 rounded-xl bg-gamana-500 text-white font-bold text-sm"
                >
                  Try Again
                </button>
                <button
                  type="button"
                  onClick={onBack}
                  className="w-full py-3.5 rounded-xl border border-gamana-200 text-gamana-600 font-semibold text-sm"
                >
                  Back to Experience
                </button>
              </>
            )}
          </div>

          {isSoldOut && alternatives.length > 0 && (
            <div className="mt-8 text-left">
              <p className="text-xs font-semibold text-heading mb-3">Similar experiences</p>
              <div className="space-y-2">
                {alternatives.map((alt) => (
                  <button
                    key={alt.id}
                    type="button"
                    onClick={() => onOpenExperience(alt.slug)}
                    className="w-full flex gap-3 p-2.5 rounded-xl border border-gamana-100 bg-surface text-left hover:bg-gamana-500/5 transition-colors"
                  >
                    {alt.imageUrl ? (
                      <img
                        src={alt.imageUrl}
                        alt={alt.title}
                        className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-gamana-100 flex-shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-heading line-clamp-2">{alt.title}</p>
                      {alt.priceLabel && (
                        <p className="text-[10px] text-gamana-600 font-medium mt-0.5">
                          {alt.priceLabel}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
