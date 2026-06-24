export type NotificationType =
  | 'booking_confirmed'
  | 'on_request_submitted'
  | 'on_request_confirmed'
  | 'on_request_rejected'
  | 'pre_experience_24h'
  | 'day_of_morning'
  | 'operator_cancelled'
  | 'last_spots'
  | 'nearby_geo'
  | 'weekend_planner';

export type NotificationIconType = 'success' | 'warning' | 'info' | 'urgent' | 'location';

export interface NotificationMock {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  timestamp: string;
  experienceId: string;
  iconType: NotificationIconType;
  actionLabel: string;
}

export const MOCK_NOTIFICATIONS: NotificationMock[] = [
  {
    id: 'N-01',
    type: 'booking_confirmed',
    title: "You're booked!",
    body: 'Old Bengaluru Heritage Walk on Jun 12. Tap to see what to bring.',
    timestamp: 'Just now',
    experienceId: 'exp-001',
    iconType: 'success',
    actionLabel: 'View Booking',
  },
  {
    id: 'N-02',
    type: 'on_request_submitted',
    title: 'Request sent',
    body: "Silk Weaving Workshop sent to Bengaluru Crafts. They'll confirm within 24h.",
    timestamp: '2 min ago',
    experienceId: 'exp-013',
    iconType: 'info',
    actionLabel: 'Track Request',
  },
  {
    id: 'N-03',
    type: 'on_request_confirmed',
    title: 'Request confirmed!',
    body: 'Bengaluru Crafts confirmed your Silk Weaving Workshop for Jun 15.',
    timestamp: '10 min ago',
    experienceId: 'exp-013',
    iconType: 'success',
    actionLabel: 'View Booking',
  },
  {
    id: 'N-04',
    type: 'on_request_rejected',
    title: 'Request not available',
    body: "Bengaluru Crafts couldn't confirm Jun 15. Here are 3 alternatives.",
    timestamp: '1 hour ago',
    experienceId: 'exp-013',
    iconType: 'warning',
    actionLabel: 'See Alternatives',
  },
  {
    id: 'N-05',
    type: 'pre_experience_24h',
    title: 'Tomorrow: Heritage Walk',
    body: 'Your Old Bengaluru Heritage Walk starts at 9:00 AM. Prep brief ready.',
    timestamp: 'Yesterday',
    experienceId: 'exp-001',
    iconType: 'info',
    actionLabel: 'View Brief',
  },
  {
    id: 'N-06',
    type: 'day_of_morning',
    title: 'Today: Heritage Walk at 9:00 AM',
    body: 'Starts in 3 hours. Meeting point: Bull Temple entrance, Basavanagudi.',
    timestamp: 'Today, 6:00 AM',
    experienceId: 'exp-001',
    iconType: 'urgent',
    actionLabel: 'Get Directions',
  },
  {
    id: 'N-07',
    type: 'operator_cancelled',
    title: 'Experience cancelled',
    body: 'Karnataka Heritage Walks cancelled your Jun 12 booking. Full refund issued.',
    timestamp: '2 hours ago',
    experienceId: 'exp-001',
    iconType: 'warning',
    actionLabel: 'Find Alternatives',
  },
  {
    id: 'N-08',
    type: 'last_spots',
    title: 'Only 2 spots left!',
    body: 'Malleswaram Food Walk on Jun 14 is almost full. You saved this.',
    timestamp: '3 hours ago',
    experienceId: 'exp-003',
    iconType: 'urgent',
    actionLabel: 'Book Now',
  },
  {
    id: 'N-09',
    type: 'nearby_geo',
    title: 'Bookable nearby',
    body: 'Cubbon Park Morning Walk is available 400m from you. Starts in 2 hours.',
    timestamp: 'Just now',
    experienceId: 'exp-004',
    iconType: 'location',
    actionLabel: 'View Experience',
  },
  {
    id: 'N-10',
    type: 'weekend_planner',
    title: "Weekend's open",
    body: '3 activities are bookable near you tomorrow — from cooking classes to sunset walks.',
    timestamp: 'Fri, 5:30 PM',
    experienceId: 'exp-001',
    iconType: 'info',
    actionLabel: "See What's On",
  },
];

export const NOTIFICATION_SECTION_DIVIDERS: Record<string, string> = {
  'N-04': '── Booking & On-Request ──',
  'N-06': '── Pre-Experience ──',
  'N-09': '── Smart Triggers ──',
};
