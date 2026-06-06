import { useEffect, useState } from 'react';
import { ArrowLeft, Star, Camera } from 'lucide-react';
import { experienceSeedData } from '../../../lib/experience-seed-data';
import { MOCK_BOOKINGS } from '../../../lib/experience-bookings-mock';
import StatusBar from '../../layout/StatusBar';

interface RateReviewScreenProps {
  bookingId: string;
  onBack: () => void;
  onSubmit: () => void;
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

export default function RateReviewScreen({ bookingId, onBack, onSubmit }: RateReviewScreenProps) {
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

  const displayRating = hoverRating || rating;
  const canSubmit = rating > 0 && review.trim().length >= MIN_CHARS && !submitting;

  useEffect(() => {
    if (!showThankYou) return;
    const t = setTimeout(() => {
      setShowThankYou(false);
      onSubmit();
    }, 2000);
    return () => clearTimeout(t);
  }, [showThankYou, onSubmit]);

  function toggleAspect(chip: string) {
    setSelectedAspects((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip],
    );
  }

  function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setShowThankYou(true);
  }

  if (!booking || !experience) {
    return (
      <div className="flex flex-col h-full min-h-0 bg-canvas">
        <StatusBar />
        <div className="p-4">
          <button type="button" onClick={onBack} className="p-2 -ml-2">
            <ArrowLeft size={20} />
          </button>
          <p className="text-sm text-muted mt-8 text-center">Booking not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-canvas">
      <StatusBar />

      <div className="flex items-center gap-2 px-4 py-3 border-b border-gamana-100">
        <button type="button" onClick={onBack} className="p-2 -ml-2">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-base font-semibold text-heading truncate">Rate &amp; review</h1>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide px-4 py-5 pb-8 space-y-6">
        <div>
          <p className="text-sm font-semibold text-heading">{experience.title}</p>
          <p className="text-xs text-muted mt-0.5">{booking.operatorName}</p>
        </div>

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
      </div>

      <div
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-gamana-900 text-white rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
          showThankYou ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        Thank you!
      </div>
    </div>
  );
}
