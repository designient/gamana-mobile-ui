import { useMemo, useState } from 'react';
import { ArrowLeft, MapPin, Search } from 'lucide-react';
import type { Experience } from '../../../types/experience';
import {
  getBookingStepCount,
  getStepIndex,
  PICKUP_LOCATIONS,
} from '../../../lib/experience-booking-flow';
import StatusBar from '../../layout/StatusBar';
import BookingProgressDots from './BookingProgressDots';

interface PickupSelectionScreenProps {
  experience: Experience;
  onBack: () => void;
  onContinue: (pickupLocationId: string | null) => void;
}

export default function PickupSelectionScreen({
  experience,
  onBack,
  onContinue,
}: PickupSelectionScreenProps) {
  const [mode, setMode] = useState<'meet' | 'pickup'>('pickup');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const stepCount = getBookingStepCount(experience);
  const currentStep = getStepIndex('pickup', experience);

  const filteredLocations = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return PICKUP_LOCATIONS;
    return PICKUP_LOCATIONS.filter(
      (loc) =>
        loc.name.toLowerCase().includes(q) ||
        loc.address.toLowerCase().includes(q) ||
        loc.area.toLowerCase().includes(q),
    );
  }, [search]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof PICKUP_LOCATIONS>();
    for (const loc of filteredLocations) {
      const list = map.get(loc.area) ?? [];
      list.push(loc);
      map.set(loc.area, list);
    }
    return [...map.entries()];
  }, [filteredLocations]);

  const canContinue = mode === 'meet' || (mode === 'pickup' && selectedId != null);

  return (
    <div className="flex flex-col h-full min-h-0 bg-canvas">
      <StatusBar />

      <div className="flex items-center gap-2 px-4 py-3 border-b border-gamana-100">
        <button type="button" onClick={onBack} className="p-2 -ml-2">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-base font-semibold text-heading">Pickup or meet</h1>
      </div>

      <BookingProgressDots current={currentStep} total={stepCount} />

      <div className="px-4 pt-3">
        <div className="flex gap-1.5 p-1 rounded-xl bg-surface border border-gamana-100 mb-3">
          <button
            type="button"
            onClick={() => {
              setMode('meet');
              setSelectedId(null);
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
              mode === 'meet' ? 'bg-gamana-500 text-white' : 'text-gamana-600/60'
            }`}
          >
            Meet at location
          </button>
          <button
            type="button"
            onClick={() => setMode('pickup')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
              mode === 'pickup' ? 'bg-gamana-500 text-white' : 'text-gamana-600/60'
            }`}
          >
            Hotel pickup
          </button>
        </div>

        {mode === 'pickup' && (
          <div className="relative mb-3">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search pickup points"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gamana-100 bg-surface text-sm text-heading"
            />
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide px-4 pb-8">
        {mode === 'meet' ? (
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
        ) : (
          <div className="space-y-4">
            {grouped.map(([area, locations]) => (
              <div key={area}>
                <p className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-2">
                  {area}
                </p>
                <div className="space-y-2">
                  {locations.map((loc) => (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => setSelectedId(loc.id)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-colors ${
                        selectedId === loc.id
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
        )}
      </div>

      <div className="flex-shrink-0 px-4 pt-3 pb-4 border-t border-gamana-100">
        <button
          type="button"
          disabled={!canContinue}
          onClick={() => onContinue(mode === 'meet' ? null : selectedId)}
          className="w-full py-3.5 rounded-xl bg-gamana-500 text-white font-bold text-sm disabled:opacity-50"
        >
          Confirm pickup →
        </button>
      </div>
    </div>
  );
}
