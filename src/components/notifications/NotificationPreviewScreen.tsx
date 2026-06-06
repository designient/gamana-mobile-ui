import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { experienceSeedData } from '../../lib/experience-seed-data';
import {
  MOCK_NOTIFICATIONS,
  NOTIFICATION_SECTION_DIVIDERS,
} from '../../lib/notification-mock-data';
import NotificationBannerCard from './NotificationBannerCard';
import StatusBar from '../layout/StatusBar';

interface NotificationPreviewScreenProps {
  onBack: () => void;
}

export default function NotificationPreviewScreen({ onBack }: NotificationPreviewScreenProps) {
  const [format, setFormat] = useState<'banner' | 'lockscreen'>('banner');

  return (
    <div className="flex flex-col h-full min-h-0 bg-canvas">
      <StatusBar />

      <div className="px-4 py-3 border-b border-gamana-100">
        <div className="flex items-center gap-2">
          <button type="button" onClick={onBack} className="p-2 -ml-2">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-base font-semibold text-heading">Notification Designs</h1>
            <p className="text-[11px] text-muted">(Design Reference)</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-b border-gamana-100 bg-surface/50">
        <p className="text-[10px] text-muted uppercase tracking-wide mb-2 text-center">
          Design reference — not a live inbox
        </p>
        <div className="flex gap-1.5 p-1 rounded-xl bg-surface border border-gamana-100">
          {(['banner', 'lockscreen'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFormat(f)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                format === f ? 'bg-gamana-500 text-white shadow-sm' : 'text-gamana-600/60'
              }`}
            >
              {f === 'banner' ? 'Banner' : 'Lock Screen'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide px-4 py-5 pb-8 space-y-4">
        {MOCK_NOTIFICATIONS.map((notification) => {
          const experience =
            experienceSeedData.find((e) => e.id === notification.experienceId) ?? null;
          const divider = NOTIFICATION_SECTION_DIVIDERS[notification.id];

          return (
            <div key={notification.id}>
              <span className="inline-block bg-gray-100 text-gray-500 font-mono text-xs rounded px-2 py-1 mb-2">
                {notification.id} · {notification.type}
              </span>
              <NotificationBannerCard
                notification={notification}
                format={format}
                experience={experience}
              />
              {divider && (
                <p className="text-center text-[11px] text-muted font-medium mt-4 mb-1 tracking-wide">
                  {divider}
                </p>
              )}
            </div>
          );
        })}

        <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <p className="text-[11px] font-semibold text-heading mb-1.5">Design notes</p>
          <p className="text-[11px] text-muted leading-relaxed">
            P0 (N-01–N-05, N-07): ship with Arcs 1–5. P1 (N-04, N-06, N-08, N-09): ship in Sprint
            3. All triggered by Bókun webhooks or Gamana cron.
          </p>
        </div>
      </div>
    </div>
  );
}
