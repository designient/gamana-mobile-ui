import type { Experience } from '../types/experience';

export interface BookingSlot {
  id: string;
  time: string;
  spotsLeft: number;
  sellingFast?: boolean;
  cutoff?: boolean;
}

export interface PickupLocation {
  id: string;
  name: string;
  address: string;
  pickupTime: string;
  area: string;
}

export interface BookingQuestion {
  id: string;
  type: 'multiselect' | 'textarea' | 'checkbox';
  label: string;
  options?: string[];
  required?: boolean;
}

export interface BookingFlowState {
  experienceId: string;
  slug: string;
  selectedDate: string;
  adults: number;
  children: number;
  seniors: number;
  total: number;
  selectedTime?: string;
  selectedSlotId?: string;
  pickupLocationId?: string | null;
  pickupMode?: 'meet' | 'pickup';
  answers?: Record<string, string | string[] | boolean>;
}

export const PICKUP_LOCATIONS: PickupLocation[] = [
  {
    id: 'pickup-leela',
    name: 'The Leela Palace',
    address: '23, Old Airport Rd, Kodihalli',
    pickupTime: '08:15 AM',
    area: 'HAL / Old Airport Road',
  },
  {
    id: 'pickup-mg-road',
    name: 'MG Road Metro',
    address: 'MG Road Station, Trinity Circle side exit',
    pickupTime: '08:30 AM',
    area: 'Central Bengaluru',
  },
  {
    id: 'pickup-ub-city',
    name: 'UB City Mall',
    address: '24, Vittal Mallya Rd, Ashok Nagar',
    pickupTime: '08:45 AM',
    area: 'CBD',
  },
  {
    id: 'pickup-indiranagar',
    name: 'Indiranagar 100ft Road',
    address: '100 Feet Rd, near CMH Junction',
    pickupTime: '09:00 AM',
    area: 'Indiranagar',
  },
];

const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Halal', 'Gluten-free', 'No nuts', 'None'];

export const DEMO_DIETARY_PREFERENCES = ['Vegetarian'];

export function roundToNearest50(amount: number): number {
  return Math.round(amount / 50) * 50;
}

export function getUnitPrice(
  type: 'adult' | 'child' | 'senior',
  priceFrom: number,
): number {
  if (type === 'adult') return priceFrom;
  if (type === 'child') return roundToNearest50(priceFrom * 0.6);
  return roundToNearest50(priceFrom * 0.8);
}

export function calculateTotal(
  state: Pick<BookingFlowState, 'adults' | 'children' | 'seniors'>,
  priceFrom: number,
): number {
  const adultTotal = state.adults * priceFrom;
  const childTotal = state.children * getUnitPrice('child', priceFrom);
  const seniorTotal = state.seniors * getUnitPrice('senior', priceFrom);
  return roundToNearest50(adultTotal + childTotal + seniorTotal);
}

export function getMockSlots(_date: string): BookingSlot[] {
  return [
    { id: 'slot-0900', time: '09:00 AM', spotsLeft: 4 },
    { id: 'slot-1100', time: '11:00 AM', spotsLeft: 12 },
    { id: 'slot-1400', time: '02:00 PM', spotsLeft: 8 },
    { id: 'slot-1600', time: '04:00 PM', spotsLeft: 2, sellingFast: true },
    { id: 'slot-1800', time: '06:00 PM', spotsLeft: 0, cutoff: true },
  ];
}

export function getBookingQuestions(experienceId: string): BookingQuestion[] {
  if (experienceId === 'exp-005') {
    return [
      {
        id: 'dietary',
        type: 'multiselect',
        label: 'Dietary requirements',
        options: DIETARY_OPTIONS,
        required: true,
      },
      {
        id: 'photography',
        type: 'checkbox',
        label: 'I understand photography restrictions inside the sanctum',
        required: true,
      },
    ];
  }

  return [
    {
      id: 'dietary',
      type: 'multiselect',
      label: 'Dietary requirements',
      options: DIETARY_OPTIONS,
      required: true,
    },
    {
      id: 'special_requests',
      type: 'textarea',
      label: 'Special requests',
      required: false,
    },
  ];
}

export function isPassExperience(experience: Experience): boolean {
  return experience.experienceType === 'Attraction Ticket';
}

export function isOnRequestExperience(experience: Experience): boolean {
  return experience.instantConfirmation === false;
}

export function needsTimeSlotStep(experience: Experience): boolean {
  return !isOnRequestExperience(experience) && !isPassExperience(experience);
}

export function needsPickupStep(experience: Experience): boolean {
  return (
    !isOnRequestExperience(experience) &&
    (experience.meetingType === 'pick_up' || experience.meetingType === 'meet_or_pickup')
  );
}

export function getBookingStepCount(_experience: Experience): number {
  return 2;
}

export function getStepIndex(
  screen: 'questions' | 'review',
  _experience: Experience,
): number {
  return screen === 'questions' ? 0 : 1;
}

export function buildDateRange(startDate: Date, count: number): Date[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    return d;
  });
}

export function formatDateChip(date: Date): { weekday: string; day: number; iso: string } {
  return {
    weekday: date.toLocaleDateString('en-IN', { weekday: 'short' }),
    day: date.getDate(),
    iso: date.toISOString().slice(0, 10),
  };
}

export function isDateUnavailable(experienceId: string, date: Date, today: Date): boolean {
  if (experienceId !== 'exp-006') return false;
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diff = Math.round((dateStart.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24));
  return [3, 7, 10].includes(diff);
}

export function formatDisplayDate(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00`);
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export function getPickupLocation(id: string | null | undefined): PickupLocation | undefined {
  if (!id) return undefined;
  return PICKUP_LOCATIONS.find((loc) => loc.id === id);
}

export function generateConfirmationCode(experienceId: string): string {
  return `GAM-${experienceId.slice(-3).toUpperCase()}${Date.now().toString(36).slice(-3).toUpperCase()}`;
}

export function createInitialFlowState(
  experience: Experience,
  partial: Pick<BookingFlowState, 'selectedDate' | 'adults' | 'children' | 'seniors' | 'total'>,
): BookingFlowState {
  return {
    experienceId: experience.id,
    slug: experience.slug,
    selectedDate: partial.selectedDate,
    adults: partial.adults,
    children: partial.children,
    seniors: partial.seniors,
    total: partial.total,
  };
}
