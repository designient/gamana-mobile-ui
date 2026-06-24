export interface HomeAlert {
  id: string;
  title: string;
  subtitle: string;
  statusText: string;
  imageUrl?: string | null;
  unread: boolean;
}

export const HOME_ALERTS: HomeAlert[] = [
  {
    id: 'home-alert-prep-1',
    title: 'Old Bengaluru Heritage Walk',
    subtitle: 'Wed, 17 Jun · 09:00 AM',
    statusText: 'Your prep brief is ready',
    imageUrl:
      'https://images.pexels.com/photos/1029604/pexels-photo-1029604.jpeg?auto=compress&cs=tinysrgb&w=300',
    unread: true,
  },
];

export function getUnreadAlertCount(): number {
  return HOME_ALERTS.filter((item) => item.unread).length;
}

