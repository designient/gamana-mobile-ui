import { useState } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { getAvailability } from '../../lib/experience-mock-api';
import { trackExperienceEvent } from '../../lib/experience-analytics';
import type { AvailabilitySlot } from '../../types/experience';

interface ExperienceAvailabilityPanelProps {
  experienceId: string;
  category?: string;
  city?: string;
  experienceType?: string;
}

function defaultDateRange(): { from: string; to: string } {
  const from = new Date();
  const to = new Date();
  to.setDate(to.getDate() + 7);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

export default function ExperienceAvailabilityPanel({
  experienceId,
  category,
  city,
  experienceType,
}: ExperienceAvailabilityPanelProps) {
  const isAttractionTicket = experienceType === 'Attraction Ticket';
  const [dateFrom, setDateFrom] = useState(() => defaultDateRange().from);
  const [dateTo, setDateTo] = useState(() => defaultDateRange().to);
  const [slots, setSlots] = useState<AvailabilitySlot[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [hasChecked, setHasChecked] = useState(false);

  async function checkAvailability(forceRefresh = false) {
    setLoading(true);
    setError(null);
    trackExperienceEvent('availability_checked', { experienceId, city, category });
    trackExperienceEvent('date_selected', { experienceId, dateFrom, dateTo });

    try {
      const result = await getAvailability(experienceId, dateFrom, dateTo, { forceRefresh });
      setSlots(result.slots);
      setHasChecked(true);
    } catch {
      setError('Could not load availability. Please try again.');
      setSlots(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <p className="text-xs text-muted mb-4 leading-relaxed">
        Live dates and pricing load only when you request them—not on list cards.
      </p>

      {isAttractionTicket ? (
        <div className="mb-3 px-3 py-2.5 rounded-xl border border-gamana-100 bg-gamana-500/5">
          <p className="text-xs font-medium text-gamana-600">Valid any day</p>
          <p className="text-[11px] text-muted mt-0.5">Ticket can be used on any open day.</p>
        </div>
      ) : (
        <div className="flex gap-2 mb-3">
          <label className="flex-1">
            <span className="text-[10px] font-medium text-muted block mb-1">From</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setSlots(null);
                setHasChecked(false);
              }}
              className="w-full px-3 py-2 rounded-xl border border-gamana-100 bg-surface text-sm text-heading"
            />
          </label>
          <label className="flex-1">
            <span className="text-[10px] font-medium text-muted block mb-1">To</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setSlots(null);
                setHasChecked(false);
              }}
              className="w-full px-3 py-2 rounded-xl border border-gamana-100 bg-surface text-sm text-heading"
            />
          </label>
        </div>
      )}

      <button
        type="button"
        disabled={loading}
        onClick={() => checkAvailability()}
        className="w-full py-2.5 rounded-xl bg-gamana-500/10 text-gamana-600 font-semibold text-sm disabled:opacity-50"
      >
        {loading ? 'Checking...' : 'Check availability'}
      </button>

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-100 flex gap-2">
          <AlertCircle size={18} className="text-rose-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-rose-700">{error}</p>
            <button
              type="button"
              onClick={() => checkAvailability(true)}
              className="mt-2 flex items-center gap-1 text-xs font-semibold text-rose-600"
            >
              <RefreshCw size={12} />
              Retry
            </button>
          </div>
        </div>
      )}

      {hasChecked && !loading && !error && slots && slots.length === 0 && (
        <p className="text-xs text-muted mt-4 text-center">No slots in this range. Try different dates.</p>
      )}

      {slots && slots.length > 0 && (
        <ul className="mt-4 space-y-2">
          {slots.map((slot) => (
            <li key={slot.id}>
              <button
                type="button"
                onClick={() => {
                  setSelectedSlotId(slot.id);
                  trackExperienceEvent('slot_selected', {
                    experienceId,
                    slotId: slot.id,
                    date: slot.date,
                  });
                }}
                className={`w-full text-left p-3 rounded-xl border transition-colors ${
                  selectedSlotId === slot.id
                    ? 'border-gamana-500 bg-gamana-500/5'
                    : 'border-gamana-100 bg-surface'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-heading">
                      {isAttractionTicket ? slot.date : `${slot.date} · ${slot.startTime}`}
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                      {slot.vacancies} spots left
                      {slot.pickupOptions?.length ? ` · ${slot.pickupOptions[0]}` : ''}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gamana-600">
                    ₹{slot.pricePerPerson.toLocaleString('en-IN')}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
