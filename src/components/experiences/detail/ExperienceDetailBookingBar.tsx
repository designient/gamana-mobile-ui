import { Calendar } from 'lucide-react';

interface ExperienceDetailBookingBarProps {
  priceLabel?: string;
  priceFrom?: number;
  priceWas?: number;
  bookingError: string | null;
  bookingLoading: boolean;
  isOnline: boolean;
  bookable: boolean;
  instantConfirmation?: boolean;
  soldOut?: boolean;
  onCheckDates: () => void;
  onBook: () => void;
}

export default function ExperienceDetailBookingBar({
  priceLabel,
  priceFrom,
  priceWas,
  bookingError,
  bookingLoading,
  isOnline,
  bookable,
  instantConfirmation,
  soldOut = false,
  onCheckDates,
  onBook,
}: ExperienceDetailBookingBarProps) {
  const hasDiscount =
    priceWas != null && priceFrom != null && priceWas > priceFrom;
  const isOnRequest = instantConfirmation === false;
  const bookDisabled = bookingLoading || !isOnline || !bookable || soldOut;

  return (
    <div className="flex-shrink-0 z-20 border-t border-gamana-100 bg-surface/98 backdrop-blur-md">
      <div className="px-4 pt-3 pb-4">
        {bookingError && (
          <p className="text-xs text-rose-600 mb-2 text-center">{bookingError}</p>
        )}
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            {hasDiscount ? (
              <>
                <p className="text-[11px] text-muted line-through">
                  ₹{priceWas!.toLocaleString('en-IN')}
                </p>
                <p className="text-base font-bold text-rose-600 leading-tight">
                  From ₹{priceFrom!.toLocaleString('en-IN')}
                </p>
              </>
            ) : priceFrom != null ? (
              <p className="text-base font-bold text-gamana-600 leading-tight">
                From ₹{priceFrom.toLocaleString('en-IN')}
              </p>
            ) : priceLabel ? (
              <p className="text-base font-bold text-gamana-600 leading-tight">{priceLabel}</p>
            ) : null}
            <p className="text-[11px] text-muted mt-0.5">per person</p>
          </div>

          <button
            type="button"
            onClick={onCheckDates}
            className="flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-xl text-gamana-600 hover:bg-gamana-500/8 transition-colors"
            aria-label="Check availability"
          >
            <Calendar size={18} />
            <span className="text-[10px] font-semibold">Dates</span>
          </button>

          <button
            type="button"
            disabled={bookDisabled}
            onClick={onBook}
            className={`flex-shrink-0 min-w-[120px] py-3.5 px-5 rounded-xl text-white font-bold text-sm disabled:opacity-50 shadow-sm ${
              isOnRequest && !soldOut ? 'bg-gamana-400' : 'bg-gamana-500'
            }`}
          >
            {soldOut
              ? 'Sold Out'
              : !isOnline
                ? 'Offline'
                : bookingLoading
                  ? '…'
                  : isOnRequest
                    ? 'Send Request'
                    : instantConfirmation
                      ? 'Book now'
                      : 'Book'}
          </button>
        </div>
      </div>
    </div>
  );
}
