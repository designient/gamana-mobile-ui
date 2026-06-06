import { useState } from 'react';
import { ArrowLeft, Star } from 'lucide-react';
import { experienceSeedData } from '../../../lib/experience-seed-data';
import {
  useMockBookings,
  type BookingRecord,
} from '../../../lib/experience-bookings-mock';
import { formatDisplayDate } from '../../../lib/experience-booking-flow';
import StatusBar from '../../layout/StatusBar';

interface MyBookingsScreenProps {
  onBack: () => void;
  onOpenBooking: (id: string) => void;
  onExplore: () => void;
  onRateExperience: (bookingId: string) => void;
  embedded?: boolean;
}

function isToday(isoDate: string): boolean {
  const today = new Date().toISOString().slice(0, 10);
  return isoDate === today;
}

function getExperienceTitle(slug: string): string {
  return experienceSeedData.find((e) => e.slug === slug)?.title ?? slug;
}

function getExperienceImage(slug: string): string | undefined {
  return experienceSeedData.find((e) => e.slug === slug)?.heroImageUrl;
}

function UpcomingBadge({ booking }: { booking: BookingRecord }) {
  if (isToday(booking.selectedDate)) {
    return (
      <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        Today
      </span>
    );
  }
  if (booking.status === 'on_request_pending') {
    return (
      <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
        Pending
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
      Confirmed
    </span>
  );
}

function PastBadge({ booking }: { booking: BookingRecord }) {
  if (booking.status === 'completed') {
    return (
      <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        Completed
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
      Cancelled
    </span>
  );
}

export default function MyBookingsScreen({
  onBack,
  onOpenBooking,
  onExplore,
  onRateExperience,
  embedded = false,
}: MyBookingsScreenProps) {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const { upcoming, past } = useMockBookings();
  const items = tab === 'upcoming' ? upcoming : past;

  return (
    <div className={`flex flex-col ${embedded ? 'h-full min-h-0' : 'h-full min-h-0 bg-canvas'}`}>
      {!embedded && (
        <>
          <StatusBar />
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gamana-100">
            <button type="button" onClick={onBack} className="p-2 -ml-2">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-base font-semibold text-heading">My Bookings</h1>
          </div>
        </>
      )}

      <div className="flex gap-1.5 p-1 mx-4 mt-3 rounded-xl bg-surface border border-gamana-100">
        {(['upcoming', 'past'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
              tab === t ? 'bg-gamana-500 text-white shadow-sm' : 'text-gamana-600/60'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide px-4 py-4 pb-8">
        {items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm text-muted leading-relaxed mb-4">
              {tab === 'upcoming'
                ? 'No upcoming bookings yet.'
                : 'No past bookings yet.'}
            </p>
            <button
              type="button"
              onClick={onExplore}
              className="px-5 py-2.5 rounded-xl bg-gamana-500 text-white text-sm font-semibold"
            >
              Explore experiences
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {items.map((booking) => (
              <button
                key={booking.id}
                type="button"
                onClick={() => onOpenBooking(booking.id)}
                className="w-full flex gap-3 p-3 rounded-2xl border border-gamana-100 bg-surface text-left hover:bg-gamana-500/5 transition-colors active:scale-[0.99]"
              >
                {getExperienceImage(booking.slug) ? (
                  <img
                    src={getExperienceImage(booking.slug)}
                    alt=""
                    className="w-[60px] h-[60px] rounded-xl object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-[60px] h-[60px] rounded-xl bg-gamana-100 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-heading line-clamp-2">
                      {getExperienceTitle(booking.slug)}
                    </p>
                    {tab === 'upcoming' ? (
                      <UpcomingBadge booking={booking} />
                    ) : (
                      <PastBadge booking={booking} />
                    )}
                  </div>
                  <p className="text-xs text-muted mt-0.5">
                    {formatDisplayDate(booking.selectedDate)}
                    {booking.selectedTime ? ` · ${booking.selectedTime}` : ''}
                  </p>
                  <p className="text-[11px] text-muted mt-0.5 truncate">{booking.operatorName}</p>
                  {tab === 'past' && booking.status === 'completed' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRateExperience(booking.id);
                      }}
                      className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-amber-600"
                    >
                      <Star size={11} fill="currentColor" />
                      Rate experience
                    </button>
                  )}
                  {tab === 'past' && booking.status === 'cancelled' && booking.refundAmount != null && (
                    <p className="text-[10px] text-slate-500 mt-1">
                      Refund ₹{booking.refundAmount.toLocaleString('en-IN')} processed
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
