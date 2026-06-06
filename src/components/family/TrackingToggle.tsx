import { MapPin, MapPinOff, Radio } from 'lucide-react';
import type { TrackingMode } from '../../types';

interface TrackingToggleProps {
  mode: TrackingMode;
  onEnable: () => void;
  onDisable: () => void;
}

export default function TrackingToggle({ mode, onEnable, onDisable }: TrackingToggleProps) {
  const isActive = mode !== 'off';

  return (
    <button
      onClick={isActive ? onDisable : onEnable}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
        isActive
          ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
          : 'bg-surface-alt border border-border-default hover:border-gamana-200'
      }`}
    >
      <div className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
        isActive ? 'bg-emerald-100 dark:bg-emerald-800/30' : 'bg-surface-muted'
      }`}>
        {isActive ? (
          <>
            <MapPin size={18} className="text-emerald-600" />
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </>
        ) : (
          <MapPinOff size={18} className="text-muted" />
        )}
      </div>

      <div className="flex-1 text-left">
        <p className={`text-sm font-semibold ${isActive ? 'text-emerald-700' : 'text-heading'}`}>
          {isActive ? 'Sharing Location' : 'Share My Location'}
        </p>
        <p className="text-[10px] text-muted mt-0.5">
          {isActive
            ? 'Your family can see where you are'
            : 'Enable to let family members see your location'}
        </p>
      </div>

      <div
        className={`relative w-11 h-6 rounded-full transition-colors duration-300 flex-shrink-0 ${
          isActive ? 'bg-emerald-500' : 'bg-surface-muted'
        }`}
      >
        <div
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${
            isActive ? 'translate-x-[22px]' : 'translate-x-0.5'
          }`}
        />
      </div>
    </button>
  );
}
