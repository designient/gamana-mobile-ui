import { useState, useEffect } from 'react';
import { Clock, Check } from 'lucide-react';
import type { Experience } from '../../../types/experience';
import { formatDisplayDate } from '../../../lib/experience-booking-flow';
import StatusBar from '../../layout/StatusBar';
import BookingConfirmedScreen from './BookingConfirmedScreen';

export type OnRequestStatus = 'pending' | 'confirmed';

interface OnRequestStatusScreenProps {
  status: OnRequestStatus;
  experienceId: string;
  slug: string;
  operatorName: string;
  referenceCode: string;
  selectedDate: string;
  experience: Experience | null;
  onBack: () => void;
  onViewBooking: () => void;
  onNavigateToStory?: () => void;
  onRetryBooking: () => void;
  onCancelRequest: () => void;
}

function getOperatorDeadline(selectedDate: string): string {
  const d = new Date(`${selectedDate}T11:00:00`);
  d.setDate(d.getDate() + 1);
  return d.toLocaleString('en-IN', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function StepTracker() {
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <div className="flex flex-col items-center gap-1">
        <div className="w-7 h-7 rounded-full bg-gamana-500 flex items-center justify-center">
          <Check size={14} className="text-white" strokeWidth={3} />
        </div>
        <span className="text-[10px] font-semibold text-gamana-600">Sent</span>
      </div>
      <div className="w-8 h-0.5 bg-gamana-200 -mt-4" />
      <div className="flex flex-col items-center gap-1">
        <div className="w-7 h-7 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        </div>
        <span className="text-[10px] font-semibold text-amber-600">Reviewing</span>
      </div>
      <div className="w-8 h-0.5 bg-gamana-200 -mt-4" />
      <div className="flex flex-col items-center gap-1">
        <div className="w-7 h-7 rounded-full bg-gamana-100 border border-gamana-200" />
        <span className="text-[10px] font-medium text-muted">Confirmed</span>
      </div>
    </div>
  );
}

function DemoToggle({
  status,
  onChange,
}: {
  status: OnRequestStatus;
  onChange: (s: OnRequestStatus) => void;
}) {
  const options: OnRequestStatus[] = ['pending', 'confirmed'];
  return (
    <div className="flex-shrink-0 px-4 py-3 opacity-40">
      <p className="text-xs text-muted text-center">
        Demo:{' '}
        {options.map((opt, i) => (
          <span key={opt}>
            {i > 0 && ' · '}
            <button
              type="button"
              onClick={() => onChange(opt)}
              className={`font-semibold capitalize underline ${
                status === opt ? 'text-gamana-600' : 'text-muted'
              }`}
            >
              {opt === 'pending' ? 'Pending' : opt.charAt(0).toUpperCase() + opt.slice(1)}
            </button>
          </span>
        ))}
      </p>
    </div>
  );
}

export default function OnRequestStatusScreen({
  status: initialStatus,
  experienceId,
  slug,
  operatorName,
  referenceCode,
  selectedDate,
  experience,
  onBack,
  onViewBooking,
  onNavigateToStory,
  onRetryBooking,
  onCancelRequest,
}: OnRequestStatusScreenProps) {
  const [status, setStatus] = useState<OnRequestStatus>(initialStatus);

  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  if (status === 'confirmed') {
    return (
      <div className="flex flex-col h-full min-h-0 bg-canvas">
        <div className="flex-1 min-h-0">
          <BookingConfirmedScreen
            experienceId={experienceId}
            slug={slug}
            experience={experience}
            confirmationCode={referenceCode}
            selectedDate={selectedDate}
            selectedTime={null}
            isOnRequest={false}
            hasLinkedStory={experience?.hasLinkedStory ?? false}
            linkedStoryId={experience?.linkedStoryId}
            onBack={onBack}
            onViewBooking={onViewBooking}
            onViewBrief={() => onRetryBooking()}
            onNavigateToStory={onNavigateToStory}
            onViewRequestStatus={onViewBooking}
          />
        </div>
        <DemoToggle status={status} onChange={setStatus} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-canvas">
      <StatusBar />

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide px-4 py-8">
        <div className="max-w-sm mx-auto text-center">
          {status === 'pending' && (
            <>
              <Clock size={48} className="text-amber-500 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-heading">Waiting for Confirmation</h1>
              <p className="text-sm text-muted mt-2">{operatorName}</p>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Operators typically respond within 24 hours.
              </p>

              <StepTracker />

              <p className="text-xs text-amber-800 font-medium mt-5 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200">
                Operator has until {getOperatorDeadline(selectedDate)}
              </p>

              <button
                type="button"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-gamana-500/8 border border-gamana-200 text-sm font-semibold text-gamana-600"
              >
                {referenceCode}
              </button>

              {experience && (
                <div className="mt-5 p-3.5 rounded-xl border border-gamana-100 bg-surface text-left">
                  <p className="text-sm font-semibold text-heading">{experience.title}</p>
                  <p className="text-xs text-muted mt-1">{formatDisplayDate(selectedDate)}</p>
                </div>
              )}

              <button
                type="button"
                onClick={onCancelRequest}
                className="mt-6 text-sm font-semibold text-rose-600 underline"
              >
                Cancel this request
              </button>
              <button
                type="button"
                onClick={onBack}
                className="block w-full mt-4 text-sm font-semibold text-gamana-600 underline"
              >
                Back to Home
              </button>
            </>
          )}
        </div>
      </div>

      <DemoToggle status={status} onChange={setStatus} />
    </div>
  );
}
