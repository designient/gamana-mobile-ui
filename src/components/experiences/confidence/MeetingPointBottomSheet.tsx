import { useCallback, useEffect, useRef, useState } from 'react';
import { X, MapPin, Copy, Navigation, Check } from 'lucide-react';
import { experienceSeedData } from '../../../lib/experience-seed-data';
import { MOCK_BOOKINGS } from '../../../lib/experience-bookings-mock';
import ToggleSwitch from '../../shared/ToggleSwitch';

const DEFAULT_ADDRESS = 'Bull Temple entrance, Basavanagudi, Bengaluru, Karnataka 560004';
const OPERATOR_PHONE = '+91 98765 43210';

interface MeetingPointBottomSheetProps {
  isOpen: boolean;
  bookingId: string;
  onClose: () => void;
}

export default function MeetingPointBottomSheet({
  isOpen,
  bookingId,
  onClose,
}: MeetingPointBottomSheetProps) {
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
  const [isClosing, setIsClosing] = useState(false);
  const [dragY, setDragY] = useState(0);
  const dragStartY = useRef(0);
  const isDragging = useRef(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setDragY(0);
      onClose();
    }, 300);
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      setDragY(0);
    }
  }, [isOpen]);

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

  function handleDragStart(clientY: number) {
    isDragging.current = true;
    dragStartY.current = clientY;
  }

  function handleDragMove(clientY: number) {
    if (!isDragging.current) return;
    setDragY(Math.max(0, clientY - dragStartY.current));
  }

  function handleDragEnd() {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (dragY > 100) handleClose();
    else setDragY(0);
  }

  if (!isOpen && !isClosing) return null;
  if (!booking) return null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <button
        type="button"
        aria-label="Close"
        className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
      />

      <div
        className={`relative bg-surface rounded-t-3xl shadow-elevated max-h-[85vh] flex flex-col transition-transform duration-300 ease-out ${
          isClosing ? 'translate-y-full' : 'translate-y-0'
        }`}
        style={dragY > 0 && !isClosing ? { transform: `translateY(${dragY}px)` } : undefined}
      >
        <div
          className="flex justify-center pt-3 pb-1 touch-none"
          onMouseDown={(e) => handleDragStart(e.clientY)}
          onMouseMove={(e) => isDragging.current && handleDragMove(e.clientY)}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={(e) => handleDragStart(e.touches[0].clientY)}
          onTouchMove={(e) => handleDragMove(e.touches[0].clientY)}
          onTouchEnd={handleDragEnd}
        >
          <div className="w-10 h-1 rounded-full bg-gamana-200" />
        </div>

        <div className="flex items-center justify-between px-5 pb-2">
          <h2 className="text-base font-semibold text-heading">Meeting point</h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-gamana-500/10"
            aria-label="Close"
          >
            <X size={18} className="text-muted" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide px-5 pb-8 space-y-4">
          <div className="relative h-40 rounded-xl bg-gamana-500/10 border-2 border-dashed border-gamana-300 flex items-center justify-center">
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
            <a
              href={`tel:${OPERATOR_PHONE.replace(/\s/g, '')}`}
              className="text-sm font-semibold text-gamana-600 mt-1 block"
            >
              {OPERATOR_PHONE}
            </a>
            <p className="text-xs text-muted mt-1">{booking.operatorName}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
