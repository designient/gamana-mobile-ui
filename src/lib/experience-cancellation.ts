import type { BookingRecord } from './experience-bookings-mock';

export type RefundTier = 'full' | 'partial' | 'none';

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

export function getEffectiveBookingDate(booking: BookingRecord): string {
  if (booking.id === 'bk-001') {
    const demoDate = new Date();
    demoDate.setDate(demoDate.getDate() + 2);
    return demoDate.toISOString().slice(0, 10);
  }
  return booking.selectedDate;
}

export function getHoursUntilExperience(booking: BookingRecord): number {
  const start = parseStartTime(getEffectiveBookingDate(booking), booking.selectedTime);
  return (start.getTime() - Date.now()) / 3_600_000;
}

export function getRefundTier(booking: BookingRecord): RefundTier {
  const hours = getHoursUntilExperience(booking);
  if (hours > 48) return 'full';
  if (hours >= 24) return 'partial';
  return 'none';
}

export function calculateRefundAmount(booking: BookingRecord): number {
  const tier = getRefundTier(booking);
  if (tier === 'full') return booking.totalPrice;
  if (tier === 'partial') return Math.round(booking.totalPrice * 0.5);
  return 0;
}

export function generateCancellationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `CXL-${code}`;
}

export function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
