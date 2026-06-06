import { Radio } from 'lucide-react';
import type { TrackingMode } from '../../types';

interface TrackingBannerProps {
  mode: TrackingMode;
  permissionState: 'prompt' | 'granted' | 'denied';
}

export default function TrackingBanner({ mode, permissionState }: TrackingBannerProps) {
  if (mode === 'off' && permissionState !== 'denied') return null;

  if (permissionState === 'denied') {
    return (
      <div className="mx-4 mb-3 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
          <Radio size={12} className="text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-amber-800">Location permission denied</p>
          <p className="text-[10px] text-amber-600">Open Settings to re-enable location access.</p>
        </div>
      </div>
    );
  }

  if (mode !== 'off') {
    return (
      <div className="mx-4 mb-3 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
        <div className="relative flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <div className="absolute w-4 h-4 rounded-full bg-emerald-500/20 animate-ping-slow" />
        </div>
        <span className="text-xs font-medium text-emerald-700">
          {mode === 'background' ? 'Sharing in background' : 'Sharing while app is open'}
        </span>
      </div>
    );
  }

  return null;
}
