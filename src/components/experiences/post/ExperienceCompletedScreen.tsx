import { useEffect, useState } from 'react';
import { BookOpen, Camera, Star } from 'lucide-react';
import { experienceSeedData } from '../../../lib/experience-seed-data';
import { MOCK_BOOKINGS } from '../../../lib/experience-bookings-mock';
import { formatDisplayDate } from '../../../lib/experience-booking-flow';
import StatusBar from '../../layout/StatusBar';

interface ExperienceCompletedScreenProps {
  bookingId: string;
  onBack: () => void;
  onNavigateToStory?: () => void;
  onSubmitRating: (rating: number, text: string, aspects: string[]) => void;
  onDeferRating: () => void;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Not what I expected',
  2: 'Below expectations',
  3: 'It was good',
  4: 'Really enjoyed it',
  5: 'Absolutely loved it!',
};

const ASPECT_CHIPS = [
  'Guide was great',
  'Great value',
  'Culturally insightful',
  'Well organised',
  'Would go again',
] as const;

const MAX_CHARS = 500;
const MIN_CHARS = 10;

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
  onSubmitRating,
  onDeferRating,
}: ExperienceCompletedScreenProps) {
  const booking = MOCK_BOOKINGS.find((b) => b.id === bookingId);
  const experience = booking
    ? experienceSeedData.find((e) => e.id === booking.experienceId) ?? null
    : null;

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [selectedAspects, setSelectedAspects] = useState<string[]>([]);
  const [showThankYou, setShowThankYou] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const showCelebration = !booking?.rating && !booking?.ratingDeferred;
  const displayRating = hoverRating || rating;
  const canSubmit = rating > 0 && review.trim().length >= MIN_CHARS && !submitting;

  useEffect(() => {
    if (!showThankYou) return;
    const t = setTimeout(() => {
      setShowThankYou(false);
      onBack();
    }, 2000);
    return () => clearTimeout(t);
  }, [showThankYou, onBack]);

  function toggleAspect(chip: string) {
    setSelectedAspects((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip],
    );
  }

  function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    onSubmitRating(rating, review.trim(), selectedAspects);
    setShowThankYou(true);
  }

  function handleMaybeLater() {
    onDeferRating();
    onBack();
  }

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
        <div className="relative max-w-sm mx-auto">
          {showCelebration && <ConfettiDots />}

          <div className="text-center">
            {showCelebration ? (
              <>
                <div className="mb-4">
                  <AnimatedCheckmark />
                </div>
                <h1 className="text-2xl font-bold text-heading">You did it!</h1>
                <div className="mt-6 mb-6">
                  <CityExplorerBadge />
                </div>
              </>
            ) : (
              <h1 className="text-xl font-bold text-heading mb-2">Rate your experience</h1>
            )}

            <p className="text-lg font-semibold text-gamana-600">{experience.title}</p>
            <p className="text-sm text-muted mt-2">
              Explored with {booking.operatorName} · {formatDisplayDate(booking.selectedDate)}
            </p>
          </div>

          {experience.hasLinkedStory && onNavigateToStory && (
            <button
              type="button"
              onClick={onNavigateToStory}
              className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-gamana-500/8 border border-gamana-200 text-left transition-colors active:scale-[0.99] mt-6"
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

          <div className="mt-6 space-y-6 text-left">
            <div className="text-center">
              <div
                className="flex justify-center gap-2"
                onMouseLeave={() => setHoverRating(0)}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    className="p-1 transition-transform hover:scale-110"
                    aria-label={`Rate ${star} stars`}
                  >
                    <Star
                      size={36}
                      className={
                        star <= displayRating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-gamana-200'
                      }
                    />
                  </button>
                ))}
              </div>
              {displayRating > 0 && (
                <p className="text-sm font-medium text-heading mt-3">
                  {RATING_LABELS[displayRating]}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="review-text" className="text-sm font-semibold text-heading">
                What made it memorable?
              </label>
              <textarea
                id="review-text"
                value={review}
                onChange={(e) => setReview(e.target.value.slice(0, MAX_CHARS))}
                rows={4}
                placeholder="Tell others about your experience…"
                className="mt-2 w-full rounded-xl border border-gamana-200 bg-surface px-3.5 py-3 text-sm text-heading placeholder:text-muted/60 resize-none focus:outline-none focus:ring-2 focus:ring-gamana-500/30"
              />
              <p className="text-[11px] text-muted mt-1 text-right">
                {review.length}/{MAX_CHARS}
                {review.length > 0 && review.length < MIN_CHARS && (
                  <span className="text-amber-600 ml-2">Min {MIN_CHARS} characters</span>
                )}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-heading mb-2">What stood out?</p>
              <div className="flex flex-wrap gap-2">
                {ASPECT_CHIPS.map((chip) => {
                  const selected = selectedAspects.includes(chip);
                  return (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => toggleAspect(chip)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                        selected
                          ? 'bg-gamana-500 text-white border-gamana-500'
                          : 'bg-surface text-gamana-700 border-gamana-200 hover:border-gamana-400'
                      }`}
                    >
                      {chip}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border-2 border-dashed border-gamana-200 bg-gamana-500/5 p-6 text-center">
              <Camera size={28} className="text-gamana-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-muted">Add a photo (optional)</p>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full py-3.5 rounded-xl bg-gamana-500 text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Submit Review
            </button>

            <button
              type="button"
              onClick={handleMaybeLater}
              className="w-full text-sm font-semibold text-gamana-600 underline"
            >
              Maybe later
            </button>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="mt-6 block w-full text-center text-sm font-semibold text-muted underline"
          >
            Back to Home
          </button>
        </div>
      </div>

      <div
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-gamana-900 text-white rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
          showThankYou ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        Thanks for the feedback!
      </div>
    </div>
  );
}
