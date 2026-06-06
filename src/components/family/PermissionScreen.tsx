import { MapPin, Eye, Clock, ShieldCheck, X } from 'lucide-react';

interface PermissionScreenProps {
  onContinue: () => void;
  onDismiss: () => void;
}

const disclosures = [
  {
    icon: MapPin,
    title: 'Location data',
    body: 'Your approximate GPS coordinates are shared with your family group members while tracking is enabled.',
  },
  {
    icon: Eye,
    title: 'Who can see it',
    body: 'Only members of family groups you belong to can view your location and battery level.',
  },
  {
    icon: Clock,
    title: 'When sharing occurs',
    body: 'Location updates are sent every 30–60 seconds while the app is open. Background sharing is optional.',
  },
  {
    icon: ShieldCheck,
    title: 'Your control',
    body: 'You can stop sharing at any time. Location data is automatically deleted after 30 minutes of inactivity.',
  },
];

export default function PermissionScreen({ onContinue, onDismiss }: PermissionScreenProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center animate-fade-in">
      <div className="w-full max-w-[402px] bg-surface rounded-t-3xl p-6 pb-8 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-heading">Family Tracking</h2>
          <button onClick={onDismiss} className="p-1 rounded-full hover:bg-surface-muted">
            <X size={20} className="text-muted" />
          </button>
        </div>

        <p className="text-sm text-secondary mb-5">
          To share your location with family members, Gamana needs access to your device's location.
          Here's how your data is used:
        </p>

        <div className="space-y-4 mb-6">
          {disclosures.map((d) => {
            const Icon = d.icon;
            return (
              <div key={d.title} className="flex gap-3">
                <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gamana-50 dark:bg-gamana-900/20 flex items-center justify-center">
                  <Icon size={18} className="text-gamana-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-heading">{d.title}</p>
                  <p className="text-xs text-secondary mt-0.5 leading-relaxed">{d.body}</p>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={onContinue}
          className="w-full py-3 rounded-xl bg-gamana-500 text-white font-semibold text-sm hover:bg-gamana-600 transition-colors"
        >
          Continue &amp; Allow Location
        </button>
        <button
          onClick={onDismiss}
          className="w-full py-2.5 mt-2 rounded-xl text-secondary font-medium text-sm hover:bg-surface-alt transition-colors"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
