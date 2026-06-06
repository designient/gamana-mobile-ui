import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { experienceSeedData } from '../../../lib/experience-seed-data';
import { MOCK_BOOKINGS } from '../../../lib/experience-bookings-mock';
import { formatDisplayDate } from '../../../lib/experience-booking-flow';
import {
  calculateRefundAmount,
  getEffectiveBookingDate,
  getRefundTier,
} from '../../../lib/experience-cancellation';
import StatusBar from '../../layout/StatusBar';

interface CancelBookingScreenProps {
  bookingId: string;
  onBack: () => void;
  onConfirm: (reason?: string) => void;
}

const REASONS = [
  'Plans changed',
  'Found a better option',
  'Health reasons',
  'Other',
] as const;

type Reason = (typeof REASONS)[number];

const TIER_STYLES = {
  full: {
    card: 'bg-green-50 border-green-200',
    title: 'text-green-800',
    amount: 'text-green-700',
    label: 'Full refund',
  },
  partial: {
    card: 'bg-amber-50 border-amber-200',
    title: 'text-amber-800',
    amount: 'text-amber-700',
    label: 'Partial refund (50%)',
  },
  none: {
    card: 'bg-red-50 border-red-200',
    title: 'text-red-800',
    amount: 'text-red-700',
    label: 'No refund',
  },
} as const;

export default function CancelBookingScreen({
  bookingId,
  onBack,
  onConfirm,
}: CancelBookingScreenProps) {
  const booking = MOCK_BOOKINGS.find((b) => b.id === bookingId);
  const experience = booking
    ? experienceSeedData.find((e) => e.id === booking.experienceId) ?? null
    : null;

  const [selectedReason, setSelectedReason] = useState<Reason | null>(null);
  const [otherReason, setOtherReason] = useState('');

  if (!booking || !experience || booking.status !== 'confirmed') {
    return (
      <div className="flex flex-col h-full min-h-0 bg-canvas">
        <StatusBar />
        <div className="p-4">
          <button type="button" onClick={onBack} className="p-2 -ml-2">
            <ArrowLeft size={20} />
          </button>
          <p className="text-sm text-muted mt-8 text-center">Booking cannot be cancelled.</p>
        </div>
      </div>
    );
  }

  const effectiveDate = getEffectiveBookingDate(booking);
  const tier = getRefundTier(booking);
  const refundAmount = calculateRefundAmount(booking);
  const styles = TIER_STYLES[tier];

  function handleConfirm() {
    if (!selectedReason) return;
    const reason =
      selectedReason === 'Other' && otherReason.trim()
        ? otherReason.trim()
        : selectedReason;
    onConfirm(reason);
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-canvas">
      <StatusBar />

      <div className="flex items-center gap-2 px-4 py-3 border-b border-gamana-100">
        <button type="button" onClick={onBack} className="p-2 -ml-2">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-base font-semibold text-heading">Cancel booking</h1>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide px-4 py-5 pb-8 space-y-5">
        <div className="flex gap-3 p-3.5 rounded-xl border border-gamana-100 bg-surface">
          {experience.heroImageUrl ? (
            <img
              src={experience.heroImageUrl}
              alt={experience.title}
              className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-gamana-100 flex-shrink-0" />
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-heading line-clamp-2">{experience.title}</p>
            <p className="text-xs text-muted mt-1">
              {formatDisplayDate(effectiveDate)}
              {booking.selectedTime ? ` · ${booking.selectedTime}` : ''}
            </p>
            <p className="text-[11px] text-gamana-600 font-medium mt-0.5">{booking.referenceCode}</p>
          </div>
        </div>

        <div className={`p-3.5 rounded-xl border ${styles.card}`}>
          <p className={`text-sm font-semibold ${styles.title}`}>{styles.label}</p>
          <p className={`text-xl font-bold mt-1 ${styles.amount}`}>
            ₹{refundAmount.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-muted mt-2 leading-relaxed">
            {tier === 'full' && 'More than 48 hours before your experience — full refund eligible.'}
            {tier === 'partial' && '24–48 hours before start — 50% refund eligible.'}
            {tier === 'none' && 'Less than 24 hours before start — no refund available.'}
          </p>
        </div>

        {experience.cancellationPolicy && (
          <p className="text-xs text-muted leading-relaxed">{experience.cancellationPolicy}</p>
        )}

        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 leading-relaxed">
          Refunds by {booking.operatorName}, not Gamana
        </p>

        <div>
          <p className="text-sm font-semibold text-heading mb-2">Reason for cancelling</p>
          <div className="flex flex-wrap gap-2">
            {REASONS.map((reason) => (
              <button
                key={reason}
                type="button"
                onClick={() => setSelectedReason(reason)}
                className={`px-3 py-2 rounded-full text-xs font-semibold border transition-colors ${
                  selectedReason === reason
                    ? 'bg-gamana-500 text-white border-gamana-500'
                    : 'bg-surface text-gamana-700 border-gamana-200 hover:border-gamana-400'
                }`}
              >
                {reason}
              </button>
            ))}
          </div>
          {selectedReason === 'Other' && (
            <input
              type="text"
              value={otherReason}
              onChange={(e) => setOtherReason(e.target.value)}
              placeholder="Tell us more…"
              className="mt-3 w-full rounded-xl border border-gamana-200 bg-surface px-3.5 py-2.5 text-sm text-heading placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-gamana-500/30"
            />
          )}
        </div>

        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="w-full py-3.5 rounded-xl bg-gamana-500 text-white font-bold text-sm"
          >
            Keep My Booking
          </button>

          <p className="text-center text-xs text-muted">This cannot be undone.</p>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedReason || (selectedReason === 'Other' && !otherReason.trim())}
            className="w-full py-3.5 rounded-xl border-2 border-red-300 text-red-600 font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Yes, Cancel Booking
          </button>
        </div>
      </div>
    </div>
  );
}
