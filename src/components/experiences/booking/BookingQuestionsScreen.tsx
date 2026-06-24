import { useMemo, useState } from 'react';
import { ArrowLeft, Info, MapPin, Search } from 'lucide-react';
import type { Experience } from '../../../types/experience';
import {
  DEMO_DIETARY_PREFERENCES,
  getBookingQuestions,
  getBookingStepCount,
  getStepIndex,
  needsPickupStep,
  PICKUP_LOCATIONS,
} from '../../../lib/experience-booking-flow';
import StatusBar from '../../layout/StatusBar';
import BookingProgressDots from './BookingProgressDots';

interface BookingQuestionsScreenProps {
  experience: Experience;
  onBack: () => void;
  onContinue: (payload: {
    answers: Record<string, string | string[] | boolean>;
    pickupLocationId: string | null;
    pickupMode?: 'meet' | 'pickup';
  }) => void;
}

export default function BookingQuestionsScreen({
  experience,
  onBack,
  onContinue,
}: BookingQuestionsScreenProps) {
  const questions = useMemo(() => getBookingQuestions(experience.id), [experience.id]);
  const stepCount = getBookingStepCount(experience);
  const currentStep = getStepIndex('questions', experience);
  const showPickup = needsPickupStep(experience);
  const forcePickup = experience.meetingType === 'pick_up';
  const allowMeetToggle = experience.meetingType === 'meet_or_pickup';

  const [pickupMode, setPickupMode] = useState<'meet' | 'pickup'>(
    forcePickup ? 'pickup' : 'pickup',
  );
  const [pickupSearch, setPickupSearch] = useState('');
  const [pickupLocationId, setPickupLocationId] = useState<string | null>(null);

  const [answers, setAnswers] = useState<Record<string, string | string[] | boolean>>(() => {
    const initial: Record<string, string | string[] | boolean> = {};
    const dietaryQ = questions.find((q) => q.id === 'dietary');
    if (dietaryQ && DEMO_DIETARY_PREFERENCES.length > 0) {
      initial.dietary = [...DEMO_DIETARY_PREFERENCES];
    }
    return initial;
  });

  const hasDietaryPrefill = DEMO_DIETARY_PREFERENCES.length > 0;

  const filteredLocations = useMemo(() => {
    const q = pickupSearch.trim().toLowerCase();
    if (!q) return PICKUP_LOCATIONS;
    return PICKUP_LOCATIONS.filter(
      (loc) =>
        loc.name.toLowerCase().includes(q) ||
        loc.address.toLowerCase().includes(q) ||
        loc.area.toLowerCase().includes(q),
    );
  }, [pickupSearch]);

  const groupedLocations = useMemo(() => {
    const map = new Map<string, typeof PICKUP_LOCATIONS>();
    for (const loc of filteredLocations) {
      const list = map.get(loc.area) ?? [];
      list.push(loc);
      map.set(loc.area, list);
    }
    return [...map.entries()];
  }, [filteredLocations]);

  function toggleMultiselect(id: string, option: string) {
    setAnswers((prev) => {
      const current = (prev[id] as string[] | undefined) ?? [];
      const next = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option];
      return { ...prev, [id]: next };
    });
  }

  function pickupValid(): boolean {
    if (!showPickup) return true;
    if (forcePickup || pickupMode === 'pickup') {
      return pickupLocationId != null;
    }
    return true;
  }

  function isValid(): boolean {
    if (!pickupValid()) return false;
    for (const q of questions) {
      if (!q.required) continue;
      const value = answers[q.id];
      if (q.type === 'multiselect') {
        if (!Array.isArray(value) || value.length === 0) return false;
      } else if (q.type === 'checkbox') {
        if (value !== true) return false;
      }
    }
    return true;
  }

  function handleContinue() {
    const resolvedPickupId =
      showPickup && (forcePickup || pickupMode === 'pickup') ? pickupLocationId : null;
    onContinue({
      answers,
      pickupLocationId: resolvedPickupId,
      pickupMode: showPickup ? (resolvedPickupId ? 'pickup' : 'meet') : undefined,
    });
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-canvas">
      <StatusBar />

      <div className="flex items-center gap-2 px-4 py-3 border-b border-gamana-100">
        <button type="button" onClick={onBack} className="p-2 -ml-2">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-base font-semibold text-heading">Booking details</h1>
      </div>

      <BookingProgressDots current={currentStep} total={stepCount} />

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide px-4 pb-8 space-y-5">
        {showPickup && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-heading">
              Where should we pick you up?
              {(forcePickup || pickupMode === 'pickup') && (
                <span className="text-rose-500 ml-0.5">*</span>
              )}
            </p>

            {allowMeetToggle && (
              <div className="flex gap-1.5 p-1 rounded-xl bg-surface border border-gamana-100">
                <button
                  type="button"
                  onClick={() => {
                    setPickupMode('meet');
                    setPickupLocationId(null);
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                    pickupMode === 'meet' ? 'bg-gamana-500 text-white' : 'text-gamana-600/60'
                  }`}
                >
                  Meet at location
                </button>
                <button
                  type="button"
                  onClick={() => setPickupMode('pickup')}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                    pickupMode === 'pickup' ? 'bg-gamana-500 text-white' : 'text-gamana-600/60'
                  }`}
                >
                  Hotel pickup
                </button>
              </div>
            )}

            {(forcePickup || pickupMode === 'pickup') && (
              <>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="search"
                    value={pickupSearch}
                    onChange={(e) => setPickupSearch(e.target.value)}
                    placeholder="Search pickup points"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gamana-100 bg-surface text-sm text-heading"
                  />
                </div>
                <div className="space-y-4">
                  {groupedLocations.map(([area, locations]) => (
                    <div key={area}>
                      <p className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-2">
                        {area}
                      </p>
                      <div className="space-y-2">
                        {locations.map((loc) => (
                          <button
                            key={loc.id}
                            type="button"
                            onClick={() => setPickupLocationId(loc.id)}
                            className={`w-full text-left p-3.5 rounded-xl border transition-colors ${
                              pickupLocationId === loc.id
                                ? 'border-gamana-500 bg-gamana-500/5'
                                : 'border-gamana-100 bg-surface'
                            }`}
                          >
                            <p className="text-sm font-semibold text-heading">{loc.name}</p>
                            <p className="text-xs text-muted mt-0.5 leading-relaxed">{loc.address}</p>
                            <p className="text-[11px] text-gamana-600 font-medium mt-1.5">
                              Pickup at {loc.pickupTime}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {allowMeetToggle && pickupMode === 'meet' && (
              <div className="p-4 rounded-xl border border-gamana-100 bg-gamana-500/5">
                <div className="flex gap-2.5">
                  <MapPin size={18} className="text-gamana-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-heading">Meet on location</p>
                    <p className="text-xs text-muted mt-1 leading-relaxed">
                      {experience.meetingPointText ??
                        'Your guide will share the exact meeting point after booking.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {hasDietaryPrefill && (
          <div className="flex gap-2.5 p-3 rounded-xl bg-gamana-500/5 border border-gamana-200">
            <Info size={16} className="text-gamana-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted leading-relaxed">
              We pre-filled your dietary preferences from your profile. Update if needed.
            </p>
          </div>
        )}

        {questions.map((question) => (
          <div key={question.id}>
            {question.type !== 'checkbox' && (
              <p className="text-sm font-semibold text-heading mb-2">
                {question.label}
                {question.required && <span className="text-rose-500 ml-0.5">*</span>}
              </p>
            )}

            {question.type === 'multiselect' && question.options && (
              <div className="flex flex-wrap gap-2">
                {question.options.map((option) => {
                  const selected = ((answers[question.id] as string[]) ?? []).includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleMultiselect(question.id, option)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-colors ${
                        selected
                          ? 'bg-gamana-500 text-white'
                          : 'bg-gamana-500/8 text-gamana-500 border border-gamana-200'
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            )}

            {question.type === 'textarea' && (
              <textarea
                value={(answers[question.id] as string) ?? ''}
                onChange={(e) =>
                  setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))
                }
                rows={4}
                placeholder="Any accessibility needs, celebrations, or notes for your host"
                className="w-full px-3 py-2.5 rounded-xl border border-gamana-100 bg-surface text-sm text-heading resize-none"
              />
            )}

            {question.type === 'checkbox' && (
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={answers[question.id] === true}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, [question.id]: e.target.checked }))
                  }
                  className="mt-0.5 accent-gamana-500"
                />
                <span className="text-xs text-muted leading-relaxed">{question.label}</span>
              </label>
            )}
          </div>
        ))}
      </div>

      <div className="flex-shrink-0 px-4 pt-3 pb-4 border-t border-gamana-100">
        <button
          type="button"
          disabled={!isValid()}
          onClick={handleContinue}
          className="w-full py-3.5 rounded-xl bg-gamana-500 text-white font-bold text-sm disabled:opacity-50"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
