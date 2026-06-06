import { useMemo } from 'react';

export type BookingStatus =
  | 'confirmed'
  | 'on_request_pending'
  | 'completed'
  | 'cancelled';

export interface BookingRecord {
  id: string;
  referenceCode: string;
  experienceId: string;
  slug: string;
  status: BookingStatus;
  selectedDate: string;
  selectedTime: string | null;
  adults: number;
  children: number;
  totalPrice: number;
  operatorName: string;
  isOnRequest: boolean;
  completedAt?: string;
  cancelledAt?: string;
  refundAmount?: number;
}

export const MOCK_BOOKINGS: BookingRecord[] = [
  {
    id: 'bk-001',
    referenceCode: 'GAM-X7K2M',
    experienceId: 'exp-001',
    slug: 'heritage-old-bengaluru-walk',
    status: 'confirmed',
    selectedDate: '2026-06-12',
    selectedTime: '09:00 AM',
    adults: 2,
    children: 0,
    totalPrice: 3798,
    operatorName: 'Karnataka Heritage Walks',
    isOnRequest: false,
  },
  {
    id: 'bk-002',
    referenceCode: 'GAM-P3N8Q',
    experienceId: 'exp-013',
    slug: 'silk-weaving-workshop',
    status: 'on_request_pending',
    selectedDate: '2026-06-15',
    selectedTime: null,
    adults: 1,
    children: 0,
    totalPrice: 2100,
    operatorName: 'Bengaluru Crafts Cooperative',
    isOnRequest: true,
  },
  {
    id: 'bk-003',
    referenceCode: 'GAM-L5W1R',
    experienceId: 'exp-003',
    slug: 'malleswaram-food-walk',
    status: 'completed',
    selectedDate: '2026-05-28',
    selectedTime: '09:00 AM',
    adults: 2,
    children: 1,
    totalPrice: 5720,
    operatorName: 'Bengaluru Food Trails',
    isOnRequest: false,
    completedAt: '2026-05-28T12:00:00Z',
  },
  {
    id: 'bk-004',
    referenceCode: 'GAM-T9H4V',
    experienceId: 'exp-005',
    slug: 'iskcon-temple-spiritual-tour',
    status: 'cancelled',
    selectedDate: '2026-05-20',
    selectedTime: '05:00 PM',
    adults: 2,
    children: 0,
    totalPrice: 1998,
    operatorName: 'Spiritual Bengaluru',
    isOnRequest: false,
    cancelledAt: '2026-05-18T10:00:00Z',
    refundAmount: 1998,
  },
];

const UPCOMING_STATUSES: BookingStatus[] = ['confirmed', 'on_request_pending'];
const PAST_STATUSES: BookingStatus[] = ['completed', 'cancelled'];

export function useMockBookings() {
  return useMemo(() => {
    const upcoming = MOCK_BOOKINGS.filter((b) => UPCOMING_STATUSES.includes(b.status));
    const past = MOCK_BOOKINGS.filter((b) => PAST_STATUSES.includes(b.status));

    function getBookingById(id: string): BookingRecord | undefined {
      return MOCK_BOOKINGS.find((b) => b.id === id);
    }

    return {
      bookings: MOCK_BOOKINGS,
      upcoming,
      past,
      getBookingById,
    };
  }, []);
}
