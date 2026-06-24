import { MOCK_BOOKINGS } from '../lib/experience-bookings-mock';

export type SegmentSignal = 'discovery' | 'action';

export function useUserSegmentSignal(): SegmentSignal {
  const params = new URLSearchParams(window.location.search);
  const override = params.get('segment');
  if (override === 'discovery' || override === 'action') return override;

  const hasAnyBookingHistory = MOCK_BOOKINGS.length > 0;
  return hasAnyBookingHistory ? 'action' : 'discovery';
}
