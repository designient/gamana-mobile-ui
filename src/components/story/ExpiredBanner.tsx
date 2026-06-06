import { RotateCcw, Coins } from 'lucide-react';

interface ExpiredBannerProps {
  cost: number;
  onReUnlock: () => void;
}

export default function ExpiredBanner({ cost, onReUnlock }: ExpiredBannerProps) {
  return (
    <div className="mx-4 mt-3 p-3.5 rounded-2xl bg-canvas border border-sand-200/60">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center">
            <RotateCcw size={14} className="text-secondary" />
          </div>
          <div>
            <p className="text-sm font-medium text-heading">Access ended</p>
            <p className="text-[11px] text-muted mt-0.5">30-day period has passed</p>
          </div>
        </div>
        <button
          onClick={onReUnlock}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gamana-500 text-white text-xs font-semibold transition-all hover:bg-gamana-600 active:scale-95"
        >
          <Coins size={12} />
          Re-unlock for {cost}
        </button>
      </div>
    </div>
  );
}
