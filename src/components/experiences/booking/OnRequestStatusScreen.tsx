import { useState, useEffect } from 'react';
import { Clock, X, Check } from 'lucide-react';
import type { Experience } from '../../../types/experience';
import { experienceSeedData } from '../../../lib/experience-seed-data';
import { toListItemView } from '../../../lib/experience-mappers';
import { formatDisplayDate } from '../../../lib/experience-booking-flow';
import StatusBar from '../../layout/StatusBar';
import BookingConfirmedScreen from './BookingConfirmedScreen';

export type OnRequestStatus = 'pending' | 'confirmed' | 'rejected' | 'expired';

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
  onBrowseAlternatives: () => void;
  onCancelRequest: () => void;
  onOpenExperience?: (slug: string) => void;
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
  const options: OnRequestStatus[] = ['pending', 'confirmed', 'rejected', 'expired'];
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
  onBrowseAlternatives,
  onCancelRequest,
  onOpenExperience,
}: OnRequestStatusScreenProps) {
  const [status, setStatus] = useState<OnRequestStatus>(initialStatus);

  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  const alternatives =
    experience != null
      ? experienceSeedData
          .filter(
            (e) =>
              e.category === experience.category &&
              e.id !== experience.id &&
              e.publicationStatus === 'published' &&
              e.bookableInApp,
          )
          .slice(0, 3)
          .map(toListItemView)
      : [];

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

          {status === 'rejected' && (
            <>
              <div className="w-16 h-16 rounded-full bg-rose-50 border-2 border-rose-200 flex items-center justify-center mx-auto mb-4">
                <X size={32} className="text-rose-600" strokeWidth={2.5} />
              </div>
              <h1 className="text-xl font-bold text-heading">Request Declined</h1>
              <p className="text-sm text-muted mt-2 leading-relaxed">
                {operatorName} couldn&apos;t confirm your requested date.
              </p>

              <button
                type="button"
                onClick={onRetryBooking}
                className="w-full mt-6 py-3.5 rounded-xl bg-gamana-500 text-white font-bold text-sm"
              >
                Request a different date
              </button>

              {alternatives.length > 0 && (
                <div className="mt-8 text-left">
                  <p className="text-xs font-semibold text-heading mb-3">Similar experiences</p>
                  <div className="space-y-2">
                    {alternatives.map((alt) => (
                      <button
                        key={alt.id}
                        type="button"
                        onClick={() =>
                          onOpenExperience
                            ? onOpenExperience(alt.slug)
                            : onBrowseAlternatives()
                        }
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
                          <p className="text-xs font-semibold text-heading line-clamp-2">
                            {alt.title}
                          </p>
                          {alt.priceLabel && (
                            <p className="text-[10px] text-gamana-600 font-medium mt-0.5">
                              {alt.priceLabel}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={onBack}
                className="mt-6 text-sm font-semibold text-gamana-600 underline"
              >
                Back to Home
              </button>
            </>
          )}

          {status === 'expired' && (
            <>
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center mx-auto mb-4">
                <Clock size={32} className="text-slate-400" />
              </div>
              <h1 className="text-xl font-bold text-heading">Request Timed Out</h1>
              <p className="text-sm text-muted mt-2 leading-relaxed">
                This request was automatically cancelled after 24 hours without a response.
              </p>
              <p className="text-xs text-muted mt-3 leading-relaxed">
                No charge was made. Any hold on your payment method has been released.
              </p>

              <button
                type="button"
                onClick={onBrowseAlternatives}
                className="w-full mt-6 py-3.5 rounded-xl bg-gamana-500 text-white font-bold text-sm"
              >
                Browse similar
              </button>
              <button
                type="button"
                onClick={onBack}
                className="mt-4 text-sm font-semibold text-gamana-600 underline"
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
