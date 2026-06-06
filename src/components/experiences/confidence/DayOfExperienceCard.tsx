import { useEffect, useState } from 'react';
import { BookOpen, MapPin, Phone } from 'lucide-react';
import type { Experience } from '../../../types/experience';
import type { BookingRecord } from '../../../lib/experience-bookings-mock';

interface DayOfExperienceCardProps {
  booking: BookingRecord;
  experience: Experience;
  onOpenBrief: () => void;
  onOpenMeetingPoint: () => void;
}

function parseStartTime(dateIso: string, timeStr: string | null): Date {
  const base = new Date(`${dateIso}T12:00:00`);
  if (!timeStr) {
    base.setHours(9, 0, 0, 0);
    return base;
  }
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) {
    base.setHours(9, 0, 0, 0);
    return base;
  }
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = match[3].toUpperCase();
  if (meridiem === 'PM' && hours !== 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;
  base.setHours(hours, minutes, 0, 0);
  return base;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return 'Starting now';
  const totalMinutes = Math.floor(ms / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${hours}h ${minutes}m until start`;
  return `${minutes}m until start`;
}

export default function DayOfExperienceCard({
  booking,
  experience,
  onOpenBrief,
  onOpenMeetingPoint,
}: DayOfExperienceCardProps) {
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    const startAt = parseStartTime(booking.selectedDate, booking.selectedTime);

    function tick() {
      setCountdown(formatCountdown(startAt.getTime() - Date.now()));
    }

    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [booking.selectedDate, booking.selectedTime]);

  return (
    <div className="px-4 pt-3">
      <div className="w-full min-h-[120px] rounded-xl bg-gamana-500 text-white p-4 flex flex-col justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">Today</p>
          <p className="text-sm font-bold mt-1 line-clamp-2">{experience.title}</p>
          <p className="text-xs text-white/80 mt-1">{countdown}</p>
        </div>
        <div className="flex gap-2 mt-3">
          <IconButton icon={BookOpen} label="Brief" onClick={onOpenBrief} />
          <IconButton icon={MapPin} label="Meeting" onClick={onOpenMeetingPoint} />
          <a
            href="tel:+919876543210"
            className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2 rounded-lg bg-white/15 hover:bg-white/25 transition-colors"
          >
            <Phone size={18} />
            <span className="text-[9px] font-semibold">Call</span>
          </a>
        </div>
      </div>
    </div>
  );
}

function IconButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof BookOpen;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2 rounded-lg bg-white/15 hover:bg-white/25 transition-colors"
    >
      <Icon size={18} />
      <span className="text-[9px] font-semibold">{label}</span>
    </button>
  );
}
