import { MapPin, ChevronDown, Coins, Wifi, WifiOff, Signal } from 'lucide-react';
import { useOrgContext } from '../../hooks/useOrgContext';
import { useConnectivity } from '../../hooks/useConnectivity';
import GamanaLogo from './GamanaLogo';

interface HeaderBarProps {
  locationName: string;
  coinBalance: number;
  onCoinsTap?: () => void;
  onLocationTap?: () => void;
}

export default function HeaderBar({ locationName, coinBalance, onCoinsTap, onLocationTap }: HeaderBarProps) {
  const { config: orgConfig } = useOrgContext();
  const { isOnline, isWeak } = useConnectivity();

  return (
    <header
      className="flex items-center justify-between px-5 py-3 bg-surface/80 backdrop-blur-md sticky top-0 z-40"
      style={orgConfig.orgColors ? { borderTop: `2px solid ${orgConfig.orgColors.primary}` } : undefined}
    >
      <div className="flex items-center gap-2">
        {orgConfig.orgLogo ? (
          <>
            <img src={orgConfig.orgLogo} alt={orgConfig.orgName} className="h-6 w-auto rounded" />
            <span className="text-[10px] text-faint">×</span>
            <GamanaLogo />
          </>
        ) : (
          <GamanaLogo />
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium ${
          !isOnline
            ? 'bg-surface-muted text-secondary'
            : isWeak
              ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
              : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
        }`}>
          {!isOnline ? (
            <><WifiOff size={10} /> Offline</>
          ) : isWeak ? (
            <><Signal size={10} /> Weak</>
          ) : (
            <><Wifi size={10} /> Online</>
          )}
        </div>

        <button onClick={onLocationTap} className="flex items-center gap-1 text-sm text-body font-medium">
          <MapPin size={14} className="text-gamana-500" />
          <span>{locationName}</span>
          <ChevronDown size={14} className="text-gamana-400" />
        </button>

        <button
          onClick={onCoinsTap}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200/60 transition-all hover:bg-amber-100 active:scale-95 dark:bg-amber-900/30 dark:border-amber-700/40 dark:hover:bg-amber-900/50"
        >
          <Coins size={14} className="text-amber-500" />
          <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">{coinBalance}</span>
        </button>
      </div>
    </header>
  );
}
