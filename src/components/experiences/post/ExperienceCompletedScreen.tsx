import { useEffect, useState } from 'react';
import { BookOpen, Star } from 'lucide-react';
import { experienceSeedData } from '../../../lib/experience-seed-data';
import { MOCK_BOOKINGS } from '../../../lib/experience-bookings-mock';
import { formatDisplayDate } from '../../../lib/experience-booking-flow';
import StatusBar from '../../layout/StatusBar';

interface ExperienceCompletedScreenProps {
  bookingId: string;
  onBack: () => void;
  onNavigateToStory?: () => void;
  onRateExperience: (expId: string) => void;
}

function AnimatedCheckmark() {
  const [offset, setOffset] = useState(100);

  useEffect(() => {
    const t = requestAnimationFrame(() => setOffset(0));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <svg width="72" height="72" viewBox="0 0 64 64" className="mx-auto">
      <circle cx="32" cy="32" r="28" fill="none" stroke="#14b8a6" strokeWidth="3" opacity="0.2" />
      <circle cx="32" cy="32" r="28" fill="none" stroke="#14b8a6" strokeWidth="3" />
      <path
        d="M20 32 L28 40 L44 24"
        fill="none"
        stroke="#14b8a6"
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
    <div className="absolute inset-x-0 top-0 h-[40%] pointer-events-none overflow-hidden" aria-hidden>
      <span className="completed-confetti completed-confetti-1" />
      <span className="completed-confetti completed-confetti-2" />
      <span className="completed-confetti completed-confetti-3" />
      <span className="completed-confetti completed-confetti-4" />
      <style>{`
        @keyframes completed-confetti-fall {
          0% { transform: translateY(-12px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100px) rotate(200deg); opacity: 0; }
        }
        .completed-confetti {
          position: absolute;
          width: 9px;
          height: 9px;
          border-radius: 50%;
          animation: completed-confetti-fall 1.4s ease-out forwards;
        }
        .completed-confetti-1 { left: 18%; top: 8%; background: #14b8a6; animation-delay: 0s; }
        .completed-confetti-2 { left: 42%; top: 4%; background: #f59e0b; animation-delay: 0.12s; }
        .completed-confetti-3 { left: 68%; top: 10%; background: #ec4899; animation-delay: 0.08s; }
        .completed-confetti-4 { left: 54%; top: 6%; background: #6366f1; animation-delay: 0.2s; }
      `}</style>
    </div>
  );
}

function CityExplorerBadge() {
  return (
    <svg width="88" height="96" viewBox="0 0 88 96" className="mx-auto drop-shadow-sm">
      <polygon
        points="44,6 82,26 82,70 44,90 6,70 6,26"
        fill="#14b8a6"
        stroke="#0d9488"
        strokeWidth="2"
      />
      <polygon
        points="44,16 72,32 72,64 44,80 16,64 16,32"
        fill="#5eead4"
        opacity="0.3"
      />
      <text
        x="44"
        y="42"
        textAnchor="middle"
        fill="white"
        fontSize="8"
        fontWeight="700"
        letterSpacing="0.08em"
      >
        ACHIEVEMENT
      </text>
      <text
        x="44"
        y="58"
        textAnchor="middle"
        fill="white"
        fontSize="11"
        fontWeight="700"
      >
        City Explorer
      </text>
    </svg>
  );
}

export default function ExperienceCompletedScreen({
  bookingId,
  onBack,
  onNavigateToStory,
  onRateExperience,
}: ExperienceCompletedScreenProps) {
  const booking = MOCK_BOOKINGS.find((b) => b.id === bookingId);
  const experience = booking
    ? experienceSeedData.find((e) => e.id === booking.experienceId) ?? null
    : null;

  if (!booking || !experience) {
    return (
      <div className="flex flex-col h-full min-h-0 bg-canvas">
        <StatusBar />
        <div className="p-4 text-center">
          <p className="text-sm text-muted mt-8">Experience not found.</p>
          <button type="button" onClick={onBack} className="mt-4 text-sm font-semibold text-gamana-600 underline">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-canvas">
      <StatusBar />

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide px-4 py-8">
        <div className="relative max-w-sm mx-auto text-center">
          <ConfettiDots />

          <div className="mb-4">
            <AnimatedCheckmark />
          </div>

          <h1 className="text-2xl font-bold text-heading">You did it!</h1>

          <p className="text-lg font-semibold text-gamana-600 mt-2">{experience.title}</p>

          <p className="text-sm text-muted mt-2">
            Explored with {booking.operatorName} · {formatDisplayDate(booking.selectedDate)}
          </p>

          <div className="mt-6 mb-6">
            <CityExplorerBadge />
          </div>

          <div className="space-y-3 text-left">
            {experience.hasLinkedStory && onNavigateToStory && (
              <button
                type="button"
                onClick={onNavigateToStory}
                className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-gamana-500/8 border border-gamana-200 text-left transition-colors active:scale-[0.99]"
              >
                <BookOpen size={22} className="text-gamana-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-heading">Linked story</p>
                  <p className="text-xs text-muted">
                    {experience.linkedStoryLabel ?? 'Keep exploring the neighbourhood'}
                  </p>
                </div>
              </button>
            )}

            <button
              type="button"
              onClick={() => onRateExperience(experience.id)}
              className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-surface border border-gamana-200 text-left transition-colors active:scale-[0.99]"
            >
              <Star size={22} className="text-gamana-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-heading">Rate this experience</p>
                <p className="text-xs text-muted">Share what made it memorable</p>
              </div>
            </button>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="mt-8 text-sm font-semibold text-gamana-600 underline"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
