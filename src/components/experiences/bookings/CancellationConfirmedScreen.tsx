import { X } from 'lucide-react';
import { experienceSeedData } from '../../../lib/experience-seed-data';
import { MOCK_BOOKINGS } from '../../../lib/experience-bookings-mock';
import { addDays } from '../../../lib/experience-cancellation';
import { formatDisplayDate } from '../../../lib/experience-booking-flow';
import StatusBar from '../../layout/StatusBar';

interface CancellationConfirmedScreenProps {
  bookingId: string;
  refundAmount: number;
  operatorName: string;
  cancellationCode: string;
  onBack: () => void;
  onOpenExperience: (slug: string) => void;
}

export default function CancellationConfirmedScreen({
  bookingId,
  refundAmount,
  operatorName,
  cancellationCode,
  onBack,
  onOpenExperience,
}: CancellationConfirmedScreenProps) {
  const booking = MOCK_BOOKINGS.find((b) => b.id === bookingId);
  const experience = booking
    ? experienceSeedData.find((e) => e.id === booking.experienceId) ?? null
    : null;

  const cancelledAt = new Date().toISOString();
  const contactByDate = formatDisplayDate(addDays(cancelledAt.slice(0, 10), 10));

  const alternatives = experience
    ? experienceSeedData
        .filter((e) => e.category === experience.category && e.id !== experience.id)
        .slice(0, 3)
    : [];

  return (
    <div className="flex flex-col h-full min-h-0 bg-canvas">
      <StatusBar />

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide px-4 py-8 pb-8">
        <div className="max-w-sm mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center mx-auto mb-4">
            <X size={32} className="text-slate-500" />
          </div>

          <h1 className="text-xl font-bold text-heading">Booking Cancelled</h1>
          <p className="text-sm text-muted mt-1">Your cancellation is confirmed.</p>

          <p className="inline-block mt-4 px-4 py-2 rounded-full bg-slate-100 border border-slate-200 text-sm font-semibold text-slate-700">
            {cancellationCode}
          </p>

          <div className="mt-5 p-3.5 rounded-xl bg-green-50 border border-green-200 text-left">
            <p className="text-sm font-semibold text-green-800">
              ₹{refundAmount.toLocaleString('en-IN')} refunded within 5–10 business days.
            </p>
            <p className="text-xs text-green-700 mt-1 leading-relaxed">
              Processed by {operatorName}.
            </p>
            <p className="text-xs text-muted mt-2 leading-relaxed">
              Contact {operatorName} if not received by {contactByDate}.
            </p>
          </div>

          {alternatives.length > 0 && (
            <div className="mt-6 text-left">
              <p className="text-sm font-semibold text-heading mb-2">You might also like</p>
              <div className="grid grid-cols-3 gap-2">
                {alternatives.map((alt) => (
                  <button
                    key={alt.id}
                    type="button"
                    onClick={() => onOpenExperience(alt.slug)}
                    className="rounded-xl border border-gamana-100 bg-surface overflow-hidden text-left hover:bg-gamana-500/5 transition-colors"
                  >
                    {alt.heroImageUrl ? (
                      <img
                        src={alt.heroImageUrl}
                        alt={alt.title}
                        className="w-full h-16 object-cover"
                      />
                    ) : (
                      <div className="w-full h-16 bg-gamana-100" />
                    )}
                    <p className="text-[10px] font-semibold text-heading line-clamp-2 p-1.5 leading-tight">
                      {alt.title}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={onBack}
            className="mt-8 text-sm font-semibold text-gamana-600 underline"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
