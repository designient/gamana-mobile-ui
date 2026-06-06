import { Battery, BatteryCharging, BatteryLow, BatteryWarning } from 'lucide-react';
import { getBatteryTier } from '../../types';
import type { BatteryTier } from '../../types';

const tierConfig: Record<BatteryTier, { color: string; bg: string }> = {
  good: { color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  medium: { color: 'text-amber-500', bg: 'bg-amber-500/10' },
  low: { color: 'text-red-500', bg: 'bg-red-500/10' },
  critical: { color: 'text-red-600', bg: 'bg-red-600/15' },
};

interface BatteryIndicatorProps {
  level: number;
  charging: boolean;
  size?: 'sm' | 'md';
}

export default function BatteryIndicator({ level, charging, size = 'sm' }: BatteryIndicatorProps) {
  const tier = getBatteryTier(level);
  const config = tierConfig[tier];
  const iconSize = size === 'sm' ? 12 : 16;
  const textSize = size === 'sm' ? 'text-[9px]' : 'text-[11px]';

  const Icon = charging
    ? BatteryCharging
    : tier === 'critical'
      ? BatteryWarning
      : tier === 'low'
        ? BatteryLow
        : Battery;

  return (
    <div className={`flex items-center gap-0.5 px-1 py-0.5 rounded-full ${config.bg}`}>
      <Icon size={iconSize} className={config.color} />
      <span className={`${textSize} font-semibold ${config.color}`}>{level}%</span>
    </div>
  );
}
