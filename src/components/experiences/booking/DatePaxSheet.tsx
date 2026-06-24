import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { X, Minus, Plus, ChevronLeft } from 'lucide-react';
import type { Experience } from '../../../types/experience';
import {
  buildDateRange,
  calculateTotal,
  formatDateChip,
  formatDisplayDate,
  getMockSlots,
  getUnitPrice,
  isDateUnavailable,
  isOnRequestExperience,
  isPassExperience,
  type BookingFlowState,
} from '../../../lib/experience-booking-flow';

interface DatePaxSheetProps {
  isOpen: boolean;
  experience: Experience;
  onClose: () => void;
  onContinue: (state: BookingFlowState) => void;
}

type SheetStep = 'date_pax' | 'time';

export default function DatePaxSheet({
  isOpen,
  experience,
  onClose,
  onContinue,
}: DatePaxSheetProps) {
  const [today] = useState(() => new Date());
  const dates = useMemo(() => buildDateRange(today, 14), [today]);
  const defaultDate = useMemo(
    () =>
      dates.find((d) => !isDateUnavailable(experience.id, d, today)) ?? dates[0],
    [dates, experience.id, today],
  );

  const [step, setStep] = useState<SheetStep>('date_pax');
  const [selectedDate, setSelectedDate] = useState(formatDateChip(defaultDate).iso);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [seniors, setSeniors] = useState(0);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [dragY, setDragY] = useState(0);
  const dragStartY = useRef(0);
  const isDragging = useRef(false);

  const skipTimeStep =
    isOnRequestExperience(experience) || isPassExperience(experience);

  const priceFrom = experience.priceFrom ?? 0;
  const total = calculateTotal({ adults, children, seniors }, priceFrom);
  const paxValid = adults + children + seniors > 0;
  const slots = getMockSlots(selectedDate);
  const selectedSlot = slots.find((s) => s.id === selectedSlotId);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      setDragY(0);
      setStep('date_pax');
      setSelectedSlotId(null);
      const first = dates.find((d) => !isDateUnavailable(experience.id, d, today));
      if (first) setSelectedDate(formatDateChip(first).iso);
    }
  }, [isOpen, experience.id, today, dates]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setDragY(0);
      setStep('date_pax');
      onClose();
    }, 300);
  }, [onClose]);

  function buildState(selectedTime: string | null, slotId?: string): BookingFlowState {
    return {
      experienceId: experience.id,
      slug: experience.slug,
      selectedDate,
      adults,
      children,
      seniors,
      total,
      selectedTime: selectedTime ?? undefined,
      selectedSlotId: slotId,
    };
  }

  function finishAndClose(selectedTime: string | null, slotId?: string) {
    onContinue(buildState(selectedTime, slotId));
    handleClose();
  }

  function handleDatePaxContinue() {
    if (!paxValid) return;
    if (skipTimeStep) {
      finishAndClose(null);
      return;
    }
    setStep('time');
  }

  function handleTimeConfirm() {
    if (!selectedSlot) return;
    finishAndClose(selectedSlot.time, selectedSlot.id);
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
          <div className="flex items-center gap-2">
            {step === 'time' && (
              <button
                type="button"
                onClick={() => setStep('date_pax')}
                className="p-1 -ml-1 rounded-full hover:bg-gamana-500/10"
                aria-label="Back to date and guests"
              >
                <ChevronLeft size={18} className="text-heading" />
              </button>
            )}
            <h2 className="text-base font-semibold text-heading">
              {step === 'date_pax' ? 'Select date & guests' : 'Choose a time'}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-gamana-500/10"
            aria-label="Close"
          >
            <X size={18} className="text-muted" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          <div
            className="flex h-full transition-transform duration-200 ease-out"
            style={{
              width: '200%',
              transform: step === 'time' ? 'translateX(-50%)' : 'translateX(0)',
            }}
          >
            <div className="w-1/2 min-h-0 overflow-y-auto scrollbar-hide px-5 pb-4">
              <p className="text-xs font-semibold text-heading mb-2">Date</p>
              <div className="grid grid-cols-7 gap-1.5 mb-5">
                {dates.map((date) => {
                  const chip = formatDateChip(date);
                  const unavailable = isDateUnavailable(experience.id, date, today);
                  const active = selectedDate === chip.iso;
                  return (
                    <button
                      key={chip.iso}
                      type="button"
                      disabled={unavailable}
                      onClick={() => setSelectedDate(chip.iso)}
                      className={`flex flex-col items-center py-2 rounded-xl text-[10px] font-semibold transition-colors ${
                        unavailable
                          ? 'text-muted/40 line-through bg-gamana-500/5'
                          : active
                            ? 'bg-gamana-500 text-white'
                            : 'bg-gamana-500/8 text-gamana-600 border border-gamana-200'
                      }`}
                    >
                      <span>{chip.weekday}</span>
                      <span className="text-sm font-bold mt-0.5">{chip.day}</span>
                    </button>
                  );
                })}
              </div>

              <p className="text-xs font-semibold text-heading mb-3">Guests</p>
              <div className="space-y-3">
                <PaxRow
                  label="Adults"
                  sublabel={`₹${getUnitPrice('adult', priceFrom).toLocaleString('en-IN')} each`}
                  value={adults}
                  min={0}
                  onChange={setAdults}
                />
                <PaxRow
                  label="Children"
                  sublabel={`₹${getUnitPrice('child', priceFrom).toLocaleString('en-IN')} each`}
                  value={children}
                  min={0}
                  onChange={setChildren}
                />
                <PaxRow
                  label="Seniors"
                  sublabel={`₹${getUnitPrice('senior', priceFrom).toLocaleString('en-IN')} each`}
                  value={seniors}
                  min={0}
                  onChange={setSeniors}
                />
              </div>
            </div>

            <div className="w-1/2 min-h-0 overflow-y-auto scrollbar-hide px-5 pb-4">
              <div className="inline-flex px-3 py-1.5 rounded-full bg-gamana-500/8 border border-gamana-200 text-xs font-semibold text-gamana-600 mb-4">
                {formatDisplayDate(selectedDate)}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {slots.map((slot) => {
                  const soldOut = slot.cutoff || slot.spotsLeft === 0;
                  const selected = selectedSlotId === slot.id;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={soldOut}
                      onClick={() => setSelectedSlotId(slot.id)}
                      className={`p-4 rounded-xl border text-left transition-colors disabled:opacity-50 ${
                        selected
                          ? 'border-gamana-500 bg-gamana-500/5'
                          : 'border-gamana-100 bg-surface'
                      }`}
                    >
                      <p className="text-lg font-semibold text-heading">{slot.time}</p>
                      {soldOut ? (
                        <p className="text-[11px] text-muted mt-1">Sold out</p>
                      ) : slot.sellingFast ? (
                        <p className="text-[11px] text-amber-600 font-medium mt-1">
                          Only {slot.spotsLeft} left!
                        </p>
                      ) : (
                        <p className="text-[11px] text-emerald-600 mt-1">
                          {slot.spotsLeft} spots left
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>

              <p className="text-[11px] text-muted leading-relaxed mt-4">
                Times are local to {experience.city}. Cutoff is 2 hours before start.
              </p>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 px-5 pt-3 pb-6 border-t border-gamana-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted">Total</span>
            <span className="text-lg font-bold text-gamana-600">
              ₹{total.toLocaleString('en-IN')}
            </span>
          </div>
          {step === 'date_pax' ? (
            <button
              type="button"
              disabled={!paxValid}
              onClick={handleDatePaxContinue}
              className="w-full py-3.5 rounded-xl bg-gamana-500 text-white font-bold text-sm disabled:opacity-50"
            >
              Continue →
            </button>
          ) : (
            <button
              type="button"
              disabled={!selectedSlot}
              onClick={handleTimeConfirm}
              className="w-full py-3.5 rounded-xl bg-gamana-500 text-white font-bold text-sm disabled:opacity-50"
            >
              Confirm time →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function PaxRow({
  label,
  sublabel,
  value,
  min,
  onChange,
}: {
  label: string;
  sublabel: string;
  value: number;
  min: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gamana-100/70 last:border-0">
      <div>
        <p className="text-sm font-medium text-heading">{label}</p>
        <p className="text-[11px] text-muted">{sublabel}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-8 h-8 rounded-full border border-gamana-200 flex items-center justify-center disabled:opacity-40"
        >
          <Minus size={14} />
        </button>
        <span className="w-6 text-center text-sm font-semibold text-heading">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="w-8 h-8 rounded-full border border-gamana-200 flex items-center justify-center"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}
