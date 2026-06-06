import {
  MapPin, Lightbulb, Eye, Heart, ShieldAlert, Globe,
} from 'lucide-react';
import type { QuickMode } from '../../types';

const iconMap: Record<string, typeof MapPin> = {
  MapPin, Lightbulb, Eye, Heart, ShieldAlert, Globe,
};

interface QuickModeIconProps {
  mode: QuickMode;
  label: string;
  iconName: string;
  isActive: boolean;
  onTap: () => void;
}

export default function QuickModeIcon({ label, iconName, isActive, onTap }: QuickModeIconProps) {
  const Icon = iconMap[iconName] ?? MapPin;

  return (
    <button
      onClick={onTap}
      className={`
        flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all active:scale-95
        ${isActive
          ? 'bg-gamana-500 text-white shadow-md'
          : 'bg-surface text-body shadow-card hover:shadow-elevated'
        }
      `}
    >
      <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
      <span className="text-[11px] font-medium leading-tight">{label}</span>
    </button>
  );
}
