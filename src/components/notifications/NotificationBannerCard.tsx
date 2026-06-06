import { Check, AlertTriangle, Bell, Zap, MapPin } from 'lucide-react';
import type { Experience } from '../../types/experience';
import type { NotificationMock, NotificationIconType } from '../../lib/notification-mock-data';

interface NotificationBannerCardProps {
  notification: NotificationMock;
  format: 'banner' | 'lockscreen';
  experience?: Experience | null;
  onAction?: () => void;
}

const ICON_CONFIG: Record<
  NotificationIconType,
  { bg: string; icon: typeof Check; iconClass: string }
> = {
  success: { bg: 'bg-green-100', icon: Check, iconClass: 'text-green-600' },
  warning: { bg: 'bg-amber-100', icon: AlertTriangle, iconClass: 'text-amber-600' },
  info: { bg: 'bg-gamana-500/15', icon: Bell, iconClass: 'text-gamana-600' },
  urgent: { bg: 'bg-red-100', icon: Zap, iconClass: 'text-red-600' },
  location: { bg: 'bg-gamana-500/15', icon: MapPin, iconClass: 'text-gamana-600' },
};

export default function NotificationBannerCard({
  notification,
  format,
  experience,
  onAction,
}: NotificationBannerCardProps) {
  const isLockscreen = format === 'lockscreen';
  const config = ICON_CONFIG[notification.iconType];
  const Icon = config.icon;
  const isUrgent = notification.iconType === 'urgent';

  return (
    <div
      className={`bg-white rounded-2xl shadow-md ${
        isLockscreen ? 'px-5 py-4' : 'px-4 py-3'
      }`}
    >
      {!isLockscreen && (
        <div className="flex justify-center mb-2">
          <div className="w-8 h-1 rounded-full bg-slate-200" />
        </div>
      )}

      <div className="flex gap-3">
        {isLockscreen && experience?.heroImageUrl ? (
          <img
            src={experience.heroImageUrl}
            alt=""
            className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
          />
        ) : isLockscreen ? (
          <div className={`w-12 h-12 rounded-xl flex-shrink-0 ${config.bg}`} />
        ) : (
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${config.bg}`}
          >
            <Icon size={18} className={config.iconClass} />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p
              className={`font-semibold text-heading leading-snug ${
                isLockscreen ? 'text-[15px]' : 'text-[13px]'
              }`}
            >
              {notification.title}
            </p>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span className="text-[10px] text-muted whitespace-nowrap">
                {notification.timestamp}
              </span>
              <div className="relative">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-gamana-500 text-white text-[10px] font-bold">
                  G
                </span>
                {isUrgent && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500 border border-white" />
                )}
              </div>
            </div>
          </div>

          <p
            className={`text-xs text-muted mt-1 leading-relaxed ${
              isLockscreen ? '' : 'line-clamp-2'
            }`}
          >
            {notification.body}
          </p>
        </div>
      </div>

      {notification.actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className={`text-xs font-semibold text-gamana-600 hover:text-gamana-700 ${
            isLockscreen ? 'mt-3 ml-[60px]' : 'mt-2.5 ml-[52px]'
          }`}
        >
          {notification.actionLabel}
        </button>
      )}
    </div>
  );
}
