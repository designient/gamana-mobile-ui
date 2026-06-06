import { useEffect, useState } from 'react';
import {
  Calendar,
  BookOpen,
  Backpack,
  ClipboardList,
  Clock,
  Copy,
  Check,
} from 'lucide-react';
import type { Experience } from '../../../types/experience';
import { formatDisplayDate } from '../../../lib/experience-booking-flow';
import StatusBar from '../../layout/StatusBar';

interface BookingConfirmedScreenProps {
  experienceId: string;
  slug: string;
  experience: Experience | null;
  confirmationCode: string;
  selectedDate: string;
  selectedTime: string | null;
  isOnRequest: boolean;
  hasLinkedStory: boolean;
  linkedStoryId?: string;
  onBack: () => void;
  onViewBooking: () => void;
  onViewBrief: () => void;
  onNavigateToStory?: () => void;
  onViewRequestStatus: () => void;
}

function AnimatedCheckmark() {
  const [offset, setOffset] = useState(100);

  useEffect(() => {
    const t = requestAnimationFrame(() => setOffset(0));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <svg width="64" height="64" viewBox="0 0 64 64" className="mx-auto">
      <circle cx="32" cy="32" r="28" fill="none" stroke="#10b981" strokeWidth="3" opacity="0.2" />
      <circle cx="32" cy="32" r="28" fill="none" stroke="#10b981" strokeWidth="3" />
      <path
        d="M20 32 L28 40 L44 24"
        fill="none"
        stroke="#10b981"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={100}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
      />
    </svg>
  );
}

function ConfettiDots() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      <span className="confetti-dot confetti-dot-1" />
      <span className="confetti-dot confetti-dot-2" />
      <span className="confetti-dot confetti-dot-3" />
      <span className="confetti-dot confetti-dot-4" />
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(80px) rotate(180deg); opacity: 0; }
        }
        .confetti-dot {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          animation: confetti-fall 1.2s ease-out forwards;
        }
        .confetti-dot-1 { left: 20%; top: 10%; background: #14b8a6; animation-delay: 0s; }
        .confetti-dot-2 { left: 45%; top: 5%; background: #f59e0b; animation-delay: 0.15s; }
        .confetti-dot-3 { left: 70%; top: 12%; background: #ec4899; animation-delay: 0.1s; }
        .confetti-dot-4 { left: 55%; top: 8%; background: #6366f1; animation-delay: 0.25s; }
      `}</style>
    </div>
  );
}

export default function BookingConfirmedScreen({
  experience,
  confirmationCode,
  selectedDate,
  selectedTime,
  isOnRequest,
  hasLinkedStory,
  onBack,
  onViewBooking,
  onViewBrief,
  onNavigateToStory,
  onViewRequestStatus,
}: BookingConfirmedScreenProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard?.writeText(confirmationCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-canvas">
      <StatusBar />

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide px-4 py-8">
        <div className="relative max-w-sm mx-auto text-center">
          {!isOnRequest && <ConfettiDots />}

          {isOnRequest ? (
            <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-300 flex items-center justify-center mx-auto mb-4">
              <Clock size={32} className="text-amber-600" />
            </div>
          ) : (
            <div className="mb-4">
              <AnimatedCheckmark />
            </div>
          )}

          <h1 className="text-xl font-bold text-heading">
            {isOnRequest ? 'Request Sent!' : 'Booking Confirmed!'}
          </h1>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-gamana-500/8 border border-gamana-200 text-sm font-semibold text-gamana-600"
          >
            {confirmationCode}
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>

          {experience && (
            <div className="mt-5 p-3.5 rounded-xl border border-gamana-100 bg-surface text-left">
              <p className="text-sm font-semibold text-heading">{experience.title}</p>
              <p className="text-xs text-muted mt-1">{formatDisplayDate(selectedDate)}</p>
              {selectedTime && (
                <p className="text-xs text-gamana-600 font-medium mt-0.5">{selectedTime}</p>
              )}
            </div>
          )}

          {isOnRequest ? (
            <>
              <p className="text-sm text-muted mt-4 leading-relaxed">
                We&apos;ll notify you when they respond.
              </p>
              <button
                type="button"
                onClick={onViewRequestStatus}
                className="w-full mt-6 py-3.5 rounded-xl bg-gamana-500 text-white font-bold text-sm"
              >
                View Request Status
              </button>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 mt-6">
              <ActionTile icon={Calendar} label="Add to Calendar" onClick={() => {}} />
              <ActionTile icon={ClipboardList} label="View Booking" onClick={onViewBooking} />
              <ActionTile icon={Backpack} label="What to Bring" onClick={onViewBrief} />
              {hasLinkedStory && onNavigateToStory ? (
                <ActionTile icon={BookOpen} label="Linked Story" onClick={onNavigateToStory} />
              ) : (
                <div className="rounded-xl border border-transparent" aria-hidden />
              )}
            </div>
          )}

          <button
            type="button"
            onClick={onBack}
            className="mt-6 text-sm font-semibold text-gamana-600 underline"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

function ActionTile({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Calendar;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-3.5 rounded-xl border border-gamana-100 bg-surface hover:bg-gamana-500/5 transition-colors"
    >
      <Icon size={20} className="text-gamana-500" />
      <span className="text-[11px] font-semibold text-heading leading-tight">{label}</span>
    </button>
  );
}
