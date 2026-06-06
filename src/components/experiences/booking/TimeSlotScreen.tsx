import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { Experience } from '../../../types/experience';
import {
  formatDisplayDate,
  getBookingStepCount,
  getMockSlots,
  getStepIndex,
} from '../../../lib/experience-booking-flow';
import StatusBar from '../../layout/StatusBar';
import BookingProgressDots from './BookingProgressDots';

interface TimeSlotScreenProps {
  experience: Experience;
  selectedDate: string;
  onBack: () => void;
  onContinue: (time: string, slotId: string) => void;
}

export default function TimeSlotScreen({
  experience,
  selectedDate,
  onBack,
  onContinue,
}: TimeSlotScreenProps) {
  const slots = getMockSlots(selectedDate);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const selectedSlot = slots.find((s) => s.id === selectedSlotId);
  const stepCount = getBookingStepCount(experience);
  const currentStep = getStepIndex('timeslot', experience);

  return (
    <div className="flex flex-col h-full min-h-0 bg-canvas">
      <StatusBar />

      <div className="flex items-center gap-2 px-4 py-3 border-b border-gamana-100">
        <button type="button" onClick={onBack} className="p-2 -ml-2">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-base font-semibold text-heading">Choose a time</h1>
      </div>

      <BookingProgressDots current={currentStep} total={stepCount} />

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide px-4 pb-8">
        <div className="inline-flex px-3 py-1.5 rounded-full bg-gamana-500/8 border border-gamana-200 text-xs font-semibold text-gamana-600 mb-4">
          {formatDisplayDate(selectedDate)}
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {slots.map((slot) => {
            const soldOut = slot.cutoff || slot.spotsLeft === 0;
            const selected = selectedSlotId === slot.id;
            return (
              <button
                key={slot.id}
                type="button"
                disabled={soldOut}
                onClick={() => setSelectedSlotId(slot.id)}
                className={`p-4 rounded-xl border text-left transition-colors disabled:opacity-50 ${
                  selected
                    ? 'border-gamana-500 bg-gamana-500/5'
                    : 'border-gamana-100 bg-surface'
                }`}
              >
                <p className="text-lg font-semibold text-heading">{slot.time}</p>
                {soldOut ? (
                  <p className="text-[11px] text-muted mt-1">Sold out</p>
                ) : slot.sellingFast ? (
                  <p className="text-[11px] text-amber-600 font-medium mt-1">Only {slot.spotsLeft} left!</p>
                ) : (
                  <p className="text-[11px] text-emerald-600 mt-1">{slot.spotsLeft} spots left</p>
                )}
              </button>
            );
          })}
        </div>

        <p className="text-[11px] text-muted leading-relaxed mt-5">
          Times are local to {experience.city}. Cutoff is 2 hours before start.
        </p>
      </div>

      <div className="flex-shrink-0 px-4 pt-3 pb-4 border-t border-gamana-100">
        <button
          type="button"
          disabled={!selectedSlot}
          onClick={() => selectedSlot && onContinue(selectedSlot.time, selectedSlot.id)}
          className="w-full py-3.5 rounded-xl bg-gamana-500 text-white font-bold text-sm disabled:opacity-50"
        >
          Confirm time →
        </button>
      </div>
    </div>
  );
}
