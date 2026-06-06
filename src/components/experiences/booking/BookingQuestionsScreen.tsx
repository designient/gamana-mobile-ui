import { useMemo, useState } from 'react';
import { ArrowLeft, Info } from 'lucide-react';
import type { Experience } from '../../../types/experience';
import {
  DEMO_DIETARY_PREFERENCES,
  getBookingQuestions,
  getBookingStepCount,
  getStepIndex,
} from '../../../lib/experience-booking-flow';
import StatusBar from '../../layout/StatusBar';
import BookingProgressDots from './BookingProgressDots';

interface BookingQuestionsScreenProps {
  experience: Experience;
  onBack: () => void;
  onContinue: (answers: Record<string, string | string[] | boolean>) => void;
}

export default function BookingQuestionsScreen({
  experience,
  onBack,
  onContinue,
}: BookingQuestionsScreenProps) {
  const questions = useMemo(() => getBookingQuestions(experience.id), [experience.id]);
  const stepCount = getBookingStepCount(experience);
  const currentStep = getStepIndex('questions', experience);

  const [answers, setAnswers] = useState<Record<string, string | string[] | boolean>>(() => {
    const initial: Record<string, string | string[] | boolean> = {};
    const dietaryQ = questions.find((q) => q.id === 'dietary');
    if (dietaryQ && DEMO_DIETARY_PREFERENCES.length > 0) {
      initial.dietary = [...DEMO_DIETARY_PREFERENCES];
    }
    return initial;
  });

  const hasDietaryPrefill = DEMO_DIETARY_PREFERENCES.length > 0;

  function toggleMultiselect(id: string, option: string) {
    setAnswers((prev) => {
      const current = (prev[id] as string[] | undefined) ?? [];
      const next = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option];
      return { ...prev, [id]: next };
    });
  }

  function isValid(): boolean {
    for (const q of questions) {
      if (!q.required) continue;
      const value = answers[q.id];
      if (q.type === 'multiselect') {
        if (!Array.isArray(value) || value.length === 0) return false;
      } else if (q.type === 'checkbox') {
        if (value !== true) return false;
      } else if (q.type === 'textarea') {
        // optional
      }
    }
    return true;
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
          onClick={() => onContinue(answers)}
          className="w-full py-3.5 rounded-xl bg-gamana-500 text-white font-bold text-sm disabled:opacity-50"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
