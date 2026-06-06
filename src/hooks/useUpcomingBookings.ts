import { useMemo } from 'react';
import { MOCK_BOOKINGS, type BookingRecord } from '../lib/experience-bookings-mock';

export interface UpcomingBookingMatch {
  booking: BookingRecord;
  daysUntil: number;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysBetween(from: Date, toIso: string): number {
  const to = startOfDay(new Date(`${toIso}T12:00:00`));
  return Math.round((to.getTime() - from.getTime()) / 86_400_000);
}

function withDemoDate(booking: BookingRecord, today: Date): BookingRecord {
  if (booking.id !== 'bk-001') return booking;
  const demoDate = new Date(today);
  demoDate.setDate(demoDate.getDate() + 2);
  return { ...booking, selectedDate: demoDate.toISOString().slice(0, 10) };
}

export function useUpcomingBookings() {
  return useMemo(() => {
    const today = startOfDay(new Date());

    const confirmedUpcoming = MOCK_BOOKINGS.filter(
      (b) => b.status === 'confirmed',
    ).map((b) => withDemoDate(b, today));

    const matches: UpcomingBookingMatch[] = confirmedUpcoming
      .map((booking) => ({
        booking,
        daysUntil: daysBetween(today, booking.selectedDate),
      }))
      .filter((m) => m.daysUntil >= 0)
      .sort((a, b) => a.daysUntil - b.daysUntil);

    const todayMatch = matches.find((m) => m.daysUntil === 0) ?? null;
    const tomorrow = matches.find((m) => m.daysUntil === 1) ?? null;
    const daysBefore = matches.find((m) => m.daysUntil >= 2) ?? null;

    return {
      daysBefore,
      tomorrow,
      today: todayMatch,
      allUpcoming: matches,
    };
  }, []);
}
