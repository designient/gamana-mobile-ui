import { useState } from 'react';
import { ArrowLeft, BookOpen, Shirt, Backpack, AlertTriangle, Utensils, MapPin } from 'lucide-react';
import { experienceSeedData } from '../../../lib/experience-seed-data';
import { MOCK_BOOKINGS } from '../../../lib/experience-bookings-mock';
import { formatDisplayDate } from '../../../lib/experience-booking-flow';
import {
  getCulturalEtiquetteNotes,
  getDefaultWhatToCarry,
  getDefaultWhatToWear,
  getDietaryNotes,
  getSafetyFallback,
  parseKnowBeforeYouGo,
  shouldShowDietaryNotes,
} from '../../../lib/experience-brief-content';
import StatusBar from '../../layout/StatusBar';
import MeetingPointBottomSheet from './MeetingPointBottomSheet';

interface PreExperienceBriefScreenProps {
  bookingId: string;
  onBack: () => void;
  onNavigateToStory?: () => void;
}

function BriefList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li key={item} className="text-sm text-muted leading-relaxed flex gap-2">
          <span className="text-gamana-500 flex-shrink-0">•</span>
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function PreExperienceBriefScreen({
  bookingId,
  onBack,
  onNavigateToStory,
}: PreExperienceBriefScreenProps) {
  const [meetingPointOpen, setMeetingPointOpen] = useState(false);
  const booking = MOCK_BOOKINGS.find((b) => b.id === bookingId);
  const experience = booking
    ? experienceSeedData.find((e) => e.id === booking.experienceId) ?? null
    : null;

  if (!booking || !experience) {
    return (
      <div className="flex flex-col h-full min-h-0 bg-canvas">
        <StatusBar />
        <div className="p-4">
          <button type="button" onClick={onBack} className="p-2 -ml-2">
            <ArrowLeft size={20} />
          </button>
          <p className="text-sm text-muted mt-8 text-center">Brief not found.</p>
        </div>
      </div>
    );
  }

  const wearItems = (() => {
    const fromKbyg = parseKnowBeforeYouGo(experience.knowBeforeYouGo).filter(
      (item) =>
        /shoe|dress|wear|modest|layer|hat|clothing/i.test(item),
    );
    return fromKbyg.length > 0 ? fromKbyg : getDefaultWhatToWear(experience.category);
  })();

  const carryItems =
    experience.whatToBring && experience.whatToBring.length > 0
      ? experience.whatToBring
      : getDefaultWhatToCarry(experience.category);

  const safetyItems =
    experience.importantInformation && experience.importantInformation.length > 0
      ? experience.importantInformation
      : [getSafetyFallback(experience.category)];

  const meetingText =
    experience.meetingPointText ??
    'Your guide will share the exact meeting point in a confirmation message.';

  return (
    <div className="relative flex flex-col h-full min-h-0 bg-canvas">
      <StatusBar />

      <div className="flex items-center gap-2 px-4 py-3 border-b border-gamana-100">
        <button type="button" onClick={onBack} className="p-2 -ml-2">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-base font-semibold text-heading">Pre-experience brief</h1>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide px-4 py-5 pb-8 space-y-5">
        <div className="p-3.5 rounded-xl border border-gamana-100 bg-surface">
          <p className="text-sm font-semibold text-heading">{experience.title}</p>
          <p className="text-xs text-gamana-600 font-medium mt-1">{booking.referenceCode}</p>
          <p className="text-xs text-muted mt-1">
            {formatDisplayDate(booking.selectedDate)}
            {booking.selectedTime ? ` · ${booking.selectedTime}` : ''}
          </p>
          <p className="text-xs text-muted mt-0.5">{booking.operatorName}</p>
        </div>

        <section>
          <h2 className="text-sm font-semibold text-heading mb-2 flex items-center gap-2">
            <Shirt size={16} className="text-gamana-500" />
            What to wear
          </h2>
          <BriefList items={wearItems} />
        </section>

        <section>
          <h2 className="text-sm font-semibold text-heading mb-2 flex items-center gap-2">
            <Backpack size={16} className="text-gamana-500" />
            What to carry
          </h2>
          <BriefList items={carryItems} />
        </section>

        <section className="p-3.5 rounded-xl bg-gamana-500/5 border-l-4 border-gamana-500">
          <h2 className="text-sm font-semibold text-heading mb-2">Cultural &amp; etiquette notes</h2>
          <p className="text-sm text-muted leading-relaxed">
            {getCulturalEtiquetteNotes(experience.category)}
          </p>
          <p className="text-[10px] text-gamana-600 mt-2 font-medium">Gamana editorial</p>
        </section>

        <section className="p-3.5 rounded-xl bg-amber-50 border-l-4 border-amber-400">
          <h2 className="text-sm font-semibold text-heading mb-2 flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-600" />
            Safety heads-up
          </h2>
          <BriefList items={safetyItems} />
        </section>

        {shouldShowDietaryNotes(experience) && (
          <section>
            <h2 className="text-sm font-semibold text-heading mb-2 flex items-center gap-2">
              <Utensils size={16} className="text-gamana-500" />
              Dietary notes
            </h2>
            <BriefList items={getDietaryNotes(experience)} />
          </section>
        )}

        <section>
          <h2 className="text-sm font-semibold text-heading mb-2 flex items-center gap-2">
            <MapPin size={16} className="text-gamana-500" />
            Meeting your guide
          </h2>
          <p className="text-sm text-muted leading-relaxed">{meetingText}</p>
          <button
            type="button"
            onClick={() => setMeetingPointOpen(true)}
            className="mt-3 text-sm font-semibold text-gamana-600 underline"
          >
            Tap to open map
          </button>
        </section>

        {experience.hasLinkedStory && onNavigateToStory && (
          <button
            type="button"
            onClick={onNavigateToStory}
            className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-gamana-500/8 border border-gamana-200 text-left"
          >
            <BookOpen size={20} className="text-gamana-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-heading">Linked story</p>
              <p className="text-xs text-muted">
                {experience.linkedStoryLabel ?? 'Listen before you arrive'}
              </p>
            </div>
          </button>
        )}
      </div>

      <MeetingPointBottomSheet
        isOpen={meetingPointOpen}
        bookingId={bookingId}
        onClose={() => setMeetingPointOpen(false)}
      />
    </div>
  );
}
