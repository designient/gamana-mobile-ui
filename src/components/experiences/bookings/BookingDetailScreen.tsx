import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Clock,
  Copy,
  MapPin,
  Users,
  Star,
} from 'lucide-react';
import { experienceSeedData } from '../../../lib/experience-seed-data';
import { useMockBookings } from '../../../lib/experience-bookings-mock';
import { formatDisplayDate } from '../../../lib/experience-booking-flow';
import StatusBar from '../../layout/StatusBar';

interface BookingDetailScreenProps {
  bookingId: string;
  onBack: () => void;
  onNavigateToStory?: () => void;
  onViewBrief: () => void;
  onViewMeetingPoint: () => void;
  onNavigateToCancelBooking: () => void;
  onNavigateToRateReview: (bookingId: string) => void;
  onViewRefundStatus?: () => void;
  onExplore: () => void;
}

function CopyToast({ visible }: { visible: boolean }) {
  return (
    <div
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-gamana-900 text-white rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
      }`}
    >
      Copied!
    </div>
  );
}

export default function BookingDetailScreen({
  bookingId,
  onBack,
  onNavigateToStory,
  onViewBrief,
  onViewMeetingPoint,
  onNavigateToCancelBooking,
  onNavigateToRateReview,
  onViewRefundStatus,
  onExplore,
}: BookingDetailScreenProps) {
  const { getBookingById } = useMockBookings();
  const booking = getBookingById(bookingId);
  const experience = booking
    ? experienceSeedData.find((e) => e.id === booking.experienceId) ?? null
    : null;

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  if (!booking) {
    return (
      <div className="flex flex-col h-full min-h-0 bg-canvas">
        <StatusBar />
        <div className="p-4">
          <button type="button" onClick={onBack} className="p-2 -ml-2">
            <ArrowLeft size={20} />
          </button>
          <p className="text-sm text-muted mt-8 text-center">Booking not found.</p>
        </div>
      </div>
    );
  }

  const isConfirmed = booking.status === 'confirmed';
  const isUpcoming =
    booking.status === 'confirmed' || booking.status === 'on_request_pending';
  const isCompleted = booking.status === 'completed';
  const isCancelled = booking.status === 'cancelled';

  function handleCopy() {
    navigator.clipboard?.writeText(booking.referenceCode).catch(() => {});
    setCopied(true);
  }

  const paxLabel = [
    booking.adults > 0 ? `${booking.adults} adult${booking.adults > 1 ? 's' : ''}` : '',
    booking.children > 0 ? `${booking.children} child${booking.children > 1 ? 'ren' : ''}` : '',
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="flex flex-col h-full min-h-0 bg-canvas">
      <StatusBar />

      <div className="flex items-center gap-2 px-4 py-3 border-b border-gamana-100">
        <button type="button" onClick={onBack} className="p-2 -ml-2">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-base font-semibold text-heading truncate">Booking details</h1>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide pb-8">
        {experience?.heroImageUrl && (
          <img
            src={experience.heroImageUrl}
            alt={experience.title}
            className="w-full h-44 object-cover"
          />
        )}

        <div className="px-4 py-5 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-heading">{experience?.title ?? booking.slug}</h2>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 rounded-full bg-gamana-500/8 border border-gamana-200 text-sm font-semibold text-gamana-600"
            >
              {booking.referenceCode}
              <Copy size={14} />
            </button>
          </div>

          <div className="rounded-xl border border-gamana-100 bg-surface divide-y divide-gamana-100/70">
            <DetailRow icon={Calendar} label="Date" value={formatDisplayDate(booking.selectedDate)} />
            {booking.selectedTime && (
              <DetailRow icon={Clock} label="Time" value={booking.selectedTime} />
            )}
            <DetailRow icon={Users} label="Guests" value={paxLabel || '—'} />
            <DetailRow icon={MapPin} label="Operator" value={booking.operatorName} />
          </div>

          {isUpcoming && (
            <div
              className={`p-3.5 rounded-xl border ${
                booking.status === 'on_request_pending'
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-emerald-50 border-emerald-200'
              }`}
            >
              <p
                className={`text-sm font-semibold ${
                  booking.status === 'on_request_pending' ? 'text-amber-800' : 'text-emerald-800'
                }`}
              >
                {booking.status === 'on_request_pending'
                  ? 'Awaiting operator confirmation'
                  : 'Confirmed — see you there!'}
              </p>
              <p className="text-xs text-muted mt-1">
                Total ₹{booking.totalPrice.toLocaleString('en-IN')}
              </p>
            </div>
          )}

          {isUpcoming && (
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={onViewBrief}
                className="w-full py-3.5 rounded-xl bg-gamana-500 text-white font-bold text-sm"
              >
                What to Bring
              </button>
              <button
                type="button"
                onClick={onViewMeetingPoint}
                className="w-full py-3.5 rounded-xl border border-gamana-200 text-gamana-600 font-semibold text-sm"
              >
                Meeting Point
              </button>
              {isConfirmed && (
                <button
                  type="button"
                  onClick={onNavigateToCancelBooking}
                  className="w-full py-2 text-sm font-semibold text-rose-600"
                >
                  Cancel Booking
                </button>
              )}
            </div>
          )}

          {isCompleted && experience?.hasLinkedStory && onNavigateToStory && (
            <button
              type="button"
              onClick={onNavigateToStory}
              className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-gamana-500/8 border border-gamana-200 text-left"
            >
              <BookOpen size={20} className="text-gamana-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-heading">Linked story</p>
                <p className="text-xs text-muted">
                  {experience.linkedStoryLabel ?? 'Listen before or after your visit'}
                </p>
              </div>
            </button>
          )}

          {isCompleted && (
            <button
              type="button"
              onClick={() => onNavigateToRateReview(booking.id)}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-semibold text-sm"
            >
              <Star size={18} fill="currentColor" />
              Rate this experience
            </button>
          )}

          {isCancelled && (
            <>
              <button
                type="button"
                onClick={onViewRefundStatus}
                disabled={!onViewRefundStatus}
                className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left disabled:cursor-default"
              >
                <p className="text-sm font-semibold text-heading">Refund status</p>
                <p className="text-xs text-muted mt-1 leading-relaxed">
                  {booking.refundAmount != null
                    ? `₹${booking.refundAmount.toLocaleString('en-IN')} refunded to your original payment method.`
                    : 'Refund processing complete.'}
                </p>
                {booking.cancelledAt && (
                  <p className="text-[11px] text-muted mt-2">
                    Cancelled {formatDisplayDate(booking.cancelledAt.slice(0, 10))}
                  </p>
                )}
                {onViewRefundStatus && (
                  <p className="text-xs font-semibold text-gamana-600 mt-2">Track refund →</p>
                )}
              </button>
              <button
                type="button"
                onClick={onExplore}
                className="w-full py-3.5 rounded-xl bg-gamana-500 text-white font-bold text-sm"
              >
                Find similar experiences
              </button>
            </>
          )}
        </div>
      </div>

      <CopyToast visible={copied} />
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Calendar;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 px-3.5 py-3">
      <Icon size={16} className="text-gamana-500 flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-muted uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium text-heading mt-0.5">{value}</p>
      </div>
    </div>
  );
}
