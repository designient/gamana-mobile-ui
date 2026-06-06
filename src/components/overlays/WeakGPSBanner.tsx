import { MapPinOff } from 'lucide-react';

export default function WeakGPSBanner() {
  return (
    <div className="mx-4 mt-2 flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60">
      <MapPinOff size={14} className="text-amber-500 flex-shrink-0" />
      <p className="text-xs text-amber-700 font-medium">
        Location signal is weak — showing approximate results
      </p>
    </div>
  );
}
