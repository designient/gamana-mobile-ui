import type { Experience } from '../../../types/experience';
import type { BookingRecord } from '../../../lib/experience-bookings-mock';
import { formatDisplayDate } from '../../../lib/experience-booking-flow';

interface UpcomingExperienceCardProps {
  booking: BookingRecord;
  experience: Experience;
  variant: '7days' | 'tomorrow';
  daysUntil?: number;
  onGetReady: () => void;
}

export default function UpcomingExperienceCard({
  booking,
  experience,
  variant,
  daysUntil = variant === 'tomorrow' ? 1 : 7,
  onGetReady,
}: UpcomingExperienceCardProps) {
  const isTomorrow = variant === 'tomorrow';
  const chipLabel = isTomorrow ? 'Tomorrow' : `In ${daysUntil} days`;

  return (
    <div className="px-4 mt-4">
      <button
        type="button"
        onClick={onGetReady}
        className={`w-full flex gap-3 p-3.5 rounded-xl text-left transition-colors active:scale-[0.99] ${
          isTomorrow
            ? 'bg-amber-50 border border-amber-200'
            : 'bg-gamana-500/5 border border-gamana-200'
        }`}
      >
        {experience.heroImageUrl ? (
          <img
            src={experience.heroImageUrl}
            alt={experience.title}
            className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-gamana-100 flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <span
            className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide mb-1.5 ${
              isTomorrow
                ? 'bg-amber-200 text-amber-900'
                : 'bg-gamana-500/15 text-gamana-700'
            }`}
          >
            {chipLabel}
          </span>
          <p className="text-sm font-semibold text-heading line-clamp-2">{experience.title}</p>
          <p className="text-xs text-muted mt-0.5">
            {formatDisplayDate(booking.selectedDate)}
            {booking.selectedTime ? ` · ${booking.selectedTime}` : ''}
          </p>
          <p
            className={`text-xs font-semibold mt-2 ${
              isTomorrow ? 'text-amber-700' : 'text-gamana-600'
            }`}
          >
            {isTomorrow ? 'Your prep brief is ready' : 'Get Ready →'}
          </p>
        </div>
      </button>
    </div>
  );
}
