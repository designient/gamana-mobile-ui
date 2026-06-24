import { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Clock,
  Copy,
  MapPin,
  Users,
  Star,
  X,
} from 'lucide-react';
import type { Experience } from '../../../types/experience';
import { experienceSeedData } from '../../../lib/experience-seed-data';
import { toListItemView } from '../../../lib/experience-mappers';
import { useMockBookings } from '../../../lib/experience-bookings-mock';
import {
  formatDisplayDate,
  type BookingFlowState,
} from '../../../lib/experience-booking-flow';
import StatusBar from '../../layout/StatusBar';
import RefundStepper from './RefundStepper';
import DatePaxSheet from '../booking/DatePaxSheet';
import MeetingPointBottomSheet from '../confidence/MeetingPointBottomSheet';

interface BookingDetailScreenProps {
  bookingId: string;
  onBack: () => void;
  onNavigateToStory?: () => void;
  onViewBrief: () => void;
  onNavigateToCancelBooking: () => void;
  onNavigateToCelebrate: (bookingId: string) => void;
  onOpenExperience: (slug: string) => void;
  onStartBooking: (flowState: BookingFlowState) => void;
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

function AlternativeTiles({
  experience,
  onOpenExperience,
}: {
  experience: Experience;
  onOpenExperience: (slug: string) => void;
}) {
  const alternatives = useMemo(
    () =>
      experienceSeedData
        .filter(
          (e) =>
            e.category === experience.category &&
            e.id !== experience.id &&
            e.publicationStatus === 'published' &&
            e.bookableInApp,
        )
        .slice(0, 3)
        .map(toListItemView),
    [experience],
  );

  if (alternatives.length === 0) return null;

  return (
    <div>
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
                <p className="text-[10px] text-gamana-600 font-medium mt-0.5">{alt.priceLabel}</p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function BookingDetailScreen({
  bookingId,
  onBack,
  onNavigateToStory,
  onViewBrief,
  onNavigateToCancelBooking,
  onNavigateToCelebrate,
  onOpenExperience,
  onStartBooking,
  onExplore,
}: BookingDetailScreenProps) {
  const { getBookingById } = useMockBookings();
  const booking = getBookingById(bookingId);
  const experience = booking
    ? experienceSeedData.find((e) => e.id === booking.experienceId) ?? null
    : null;

  const [copied, setCopied] = useState(false);
  const [ratingReminderDismissed, setRatingReminderDismissed] = useState(false);
  const [datePaxOpen, setDatePaxOpen] = useState(false);
  const [meetingPointOpen, setMeetingPointOpen] = useState(false);

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
  const isRejected = booking.status === 'rejected';
  const isExpired = booking.status === 'expired';

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
    <div className="relative flex flex-col h-full min-h-0 bg-canvas">
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
                onClick={() => setMeetingPointOpen(true)}
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

          {isRejected && experience && (
            <>
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200">
                <p className="text-sm font-semibold text-rose-800">Request Declined</p>
                <p className="text-xs text-rose-700/80 mt-1 leading-relaxed">
                  {booking.operatorName} couldn&apos;t confirm this booking. You haven&apos;t been
                  charged.
                </p>
              </div>
              <AlternativeTiles experience={experience} onOpenExperience={onOpenExperience} />
              <button
                type="button"
                onClick={() => setDatePaxOpen(true)}
                className="w-full py-3.5 rounded-xl bg-gamana-500 text-white font-bold text-sm"
              >
                Request a different date
              </button>
            </>
          )}

          {isExpired && experience && (
            <>
              <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200">
                <p className="text-sm font-semibold text-slate-700">Request Timed Out</p>
                <p className="text-xs text-muted mt-1 leading-relaxed">
                  The operator didn&apos;t respond in time. Automatically cancelled.
                </p>
                <p className="text-xs text-muted mt-2 leading-relaxed">
                  Any deposit will be refunded within 5–7 business days.
                </p>
              </div>
              <AlternativeTiles experience={experience} onOpenExperience={onOpenExperience} />
              <button
                type="button"
                onClick={onExplore}
                className="w-full py-3.5 rounded-xl bg-gamana-500 text-white font-bold text-sm"
              >
                Browse similar experiences
              </button>
            </>
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

          {isCompleted && booking.rating != null && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-center">
              <p className="text-sm font-semibold text-amber-800">
                You rated this {booking.rating}/5{' '}
                <Star size={14} className="inline text-amber-500 fill-amber-500" />
              </p>
            </div>
          )}

          {isCompleted && booking.rating == null && booking.ratingDeferred && !ratingReminderDismissed && (
            <div className="relative p-3.5 rounded-xl bg-amber-50 border border-amber-200">
              <button
                type="button"
                onClick={() => setRatingReminderDismissed(true)}
                className="absolute top-2 right-2 p-1 text-muted"
                aria-label="Dismiss"
              >
                <X size={16} />
              </button>
              <button
                type="button"
                onClick={() => onNavigateToCelebrate(booking.id)}
                className="w-full text-left pr-6"
              >
                <p className="text-sm font-semibold text-amber-800">Rate your experience →</p>
                <p className="text-xs text-muted mt-1">Share what made it memorable</p>
              </button>
            </div>
          )}

          {isCompleted && booking.rating == null && !booking.ratingDeferred && (
            <button
              type="button"
              onClick={() => onNavigateToCelebrate(booking.id)}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gamana-500 text-white font-bold text-sm"
            >
              <Star size={18} fill="currentColor" />
              Celebrate your visit
            </button>
          )}

          {isCancelled && (
            <>
              <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200">
                <p className="text-sm font-semibold text-slate-700">Booking cancelled</p>
                {booking.cancelledAt && (
                  <p className="text-xs text-muted mt-1">
                    Cancelled on {formatDisplayDate(booking.cancelledAt.slice(0, 10))}
                  </p>
                )}
              </div>
              {booking.cancelledAt && booking.refundAmount != null && (
                <RefundStepper
                  refundAmount={booking.refundAmount}
                  cancelledAt={booking.cancelledAt}
                  operatorName={booking.operatorName}
                  referenceCode={booking.referenceCode}
                  defaultExpanded={false}
                />
              )}
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

      {experience && (
        <DatePaxSheet
          isOpen={datePaxOpen}
          experience={experience}
          onClose={() => setDatePaxOpen(false)}
          onContinue={(flowState) => {
            setDatePaxOpen(false);
            onStartBooking(flowState);
          }}
        />
      )}

      <MeetingPointBottomSheet
        isOpen={meetingPointOpen}
        bookingId={bookingId}
        onClose={() => setMeetingPointOpen(false)}
      />

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
