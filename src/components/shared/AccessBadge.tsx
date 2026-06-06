import { Unlock, Clock, RotateCcw } from 'lucide-react';
import type { ContentAccessStatus } from '../../types';

interface AccessBadgeProps {
  access: ContentAccessStatus;
  compact?: boolean;
}

export default function AccessBadge({ access, compact = false }: AccessBadgeProps) {
  if (!access.is_unlocked && !access.is_expired) return null;

  if (access.is_unlocked) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gamana-50 dark:bg-gamana-900/20 text-gamana-600">
        <Unlock size={compact ? 9 : 10} />
        <span className={`font-medium ${compact ? 'text-[9px]' : 'text-[10px]'}`}>
          {access.days_remaining}d left
        </span>
      </span>
    );
  }

  if (access.is_expired) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-muted text-secondary">
        <RotateCcw size={compact ? 9 : 10} />
        <span className={`font-medium ${compact ? 'text-[9px]' : 'text-[10px]'}`}>
          Ended
        </span>
      </span>
    );
  }

  return null;
}

interface AccessTimerProps {
  access: ContentAccessStatus;
}

export function AccessTimer({ access }: AccessTimerProps) {
  if (!access.is_unlocked && !access.is_expired) return null;

  if (access.is_unlocked) {
    return (
      <div className="flex items-center gap-1.5 text-gamana-600">
        <Clock size={12} />
        <span className="text-xs font-medium">{access.days_remaining} days remaining</span>
      </div>
    );
  }

  if (access.is_expired) {
    return (
      <div className="flex items-center gap-1.5 text-secondary">
        <RotateCcw size={12} />
        <span className="text-xs font-medium">Access ended</span>
      </div>
    );
  }

  return null;
}
