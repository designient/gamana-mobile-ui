import { useEffect, useState } from 'react';
import { ArrowLeft, MapPin, Copy, Navigation, Check } from 'lucide-react';
import { experienceSeedData } from '../../../lib/experience-seed-data';
import { MOCK_BOOKINGS } from '../../../lib/experience-bookings-mock';
import ToggleSwitch from '../../shared/ToggleSwitch';
import StatusBar from '../../layout/StatusBar';

interface MeetingPointScreenProps {
  bookingId: string;
  onBack: () => void;
}

const DEFAULT_ADDRESS = 'Bull Temple entrance, Basavanagudi, Bengaluru, Karnataka 560004';
const OPERATOR_PHONE = '+91 98765 43210';

export default function MeetingPointScreen({ bookingId, onBack }: MeetingPointScreenProps) {
  const booking = MOCK_BOOKINGS.find((b) => b.id === bookingId);
  const experience = booking
    ? experienceSeedData.find((e) => e.id === booking.experienceId) ?? null
    : null;

  const address =
    experience?.meetingPointText
      ? `${experience.meetingPointText}, Bengaluru, Karnataka`
      : DEFAULT_ADDRESS;

  const [saveOffline, setSaveOffline] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  function handleCopy() {
    navigator.clipboard?.writeText(address).catch(() => {});
    setCopied(true);
  }

  function openDirections() {
    const q = encodeURIComponent(address);
    window.open(`https://maps.google.com?q=${q}`, '_blank', 'noopener,noreferrer');
  }

  if (!booking) {
    return (
      <div className="flex flex-col h-full min-h-0 bg-canvas">
        <StatusBar />
        <div className="p-4">
          <button type="button" onClick={onBack} className="p-2 -ml-2">
            <ArrowLeft size={20} />
          </button>
          <p className="text-sm text-muted mt-8 text-center">Meeting point not found.</p>
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
        <h1 className="text-base font-semibold text-heading">Meeting point</h1>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide px-4 py-5 pb-8 space-y-4">
        <div className="relative h-48 rounded-xl bg-gamana-500/10 border-2 border-dashed border-gamana-300 flex items-center justify-center">
          <div className="text-center">
            <MapPin size={32} className="text-gamana-500 mx-auto mb-2" />
            <p className="text-xs text-muted">Map view available in the mobile app.</p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-gamana-100 bg-surface">
          <p className="text-[10px] font-semibold text-muted uppercase tracking-wide">Address</p>
          <p className="text-sm text-heading mt-1 leading-relaxed">{address}</p>
          <button
            type="button"
            onClick={handleCopy}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-gamana-600"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy address'}
          </button>
        </div>

        <button
          type="button"
          onClick={openDirections}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gamana-500 text-white font-semibold text-sm"
        >
          <Navigation size={18} />
          Directions via Google Maps
        </button>

        <p className="text-xs text-muted text-center">~8 min walk from nearest metro exit</p>

        <div className="flex items-center justify-between p-3.5 rounded-xl border border-gamana-100 bg-surface">
          <div>
            <p className="text-sm font-semibold text-heading">Save offline</p>
            <p className="text-xs text-muted mt-0.5">Keep map &amp; address on this device</p>
          </div>
          <ToggleSwitch checked={saveOffline} onChange={setSaveOffline} />
        </div>

        <div className="p-3.5 rounded-xl border border-gamana-100 bg-surface">
          <p className="text-[10px] font-semibold text-muted uppercase tracking-wide">
            Operator contact
          </p>
          <a href={`tel:${OPERATOR_PHONE.replace(/\s/g, '')}`} className="text-sm font-semibold text-gamana-600 mt-1 block">
            {OPERATOR_PHONE}
          </a>
          <p className="text-xs text-muted mt-1">{booking.operatorName}</p>
        </div>
      </div>
    </div>
  );
}
