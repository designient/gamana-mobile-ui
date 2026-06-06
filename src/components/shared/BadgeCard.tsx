import type { Badge, BadgeId } from '../../types';
import { Trophy, MapPin, Clock, Sparkles, Lock } from 'lucide-react';
import { BADGE_CATALOG } from '../../lib/badges';

interface BadgeCardProps {
  badge: Badge;
  size?: 'compact' | 'large';
}

// Gradient colors per badge
const BADGE_GRADIENTS: Record<BadgeId, string> = {
  first_tour: 'from-emerald-400 to-teal-500',
  heritage_explorer: 'from-amber-400 to-orange-500',
  temple_pilgrim: 'from-violet-400 to-purple-500',
  nature_lover: 'from-green-400 to-emerald-500',
  speed_walker: 'from-yellow-400 to-amber-500',
  marathon_tourist: 'from-rose-400 to-red-500',
  city_master: 'from-indigo-400 to-blue-500',
  night_owl: 'from-slate-500 to-gray-700',
  early_bird: 'from-orange-300 to-yellow-400',
  offline_adventurer: 'from-cyan-400 to-teal-500',
};

function getBadgeIcon(iconName: string, size: number) {
  switch (iconName) {
    case 'footprints': return <MapPin size={size} />;
    case 'landmark': return <Trophy size={size} />;
    case 'church': return <Sparkles size={size} />;
    case 'trees': return <MapPin size={size} />;
    case 'zap': return <Clock size={size} />;
    case 'trophy': return <Trophy size={size} />;
    case 'crown': return <Sparkles size={size} />;
    case 'moon': return <Clock size={size} />;
    case 'sunrise': return <Sparkles size={size} />;
    case 'wifi-off': return <MapPin size={size} />;
    default: return <Trophy size={size} />;
  }
}

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export default function BadgeCard({ badge, size = 'compact' }: BadgeCardProps) {
  const isEarned = badge.earnedAt !== null;
  const gradient = BADGE_GRADIENTS[badge.id] ?? 'from-gray-400 to-gray-500';

  if (size === 'compact') {
    return (
      <div className="flex flex-col items-center w-[72px] flex-shrink-0">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-all ${
            isEarned
              ? `bg-gradient-to-br ${gradient} text-white shadow-md`
              : 'bg-surface-muted text-faint'
          }`}
        >
          {isEarned ? (
            getBadgeIcon(badge.icon, 22)
          ) : (
            <Lock size={16} />
          )}
        </div>
        <p className={`text-[10px] font-medium mt-1.5 text-center leading-tight ${
          isEarned ? 'text-heading' : 'text-muted'
        }`}>
          {badge.title}
        </p>
        {isEarned && badge.earnedAt && (
          <p className="text-[8px] text-muted mt-0.5">{timeAgo(badge.earnedAt)}</p>
        )}
      </div>
    );
  }

  // Large variant (for celebration)
  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl transition-all ${
      isEarned
        ? 'bg-surface shadow-card'
        : 'bg-surface-alt opacity-60'
    }`}>
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
          isEarned
            ? `bg-gradient-to-br ${gradient} text-white shadow-md`
            : 'bg-surface-muted text-muted'
        }`}
      >
        {isEarned ? getBadgeIcon(badge.icon, 20) : <Lock size={18} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${isEarned ? 'text-heading' : 'text-secondary'}`}>
          {badge.title}
        </p>
        <p className="text-xs text-muted mt-0.5">{badge.description}</p>
        {isEarned && badge.earnedAt && (
          <p className="text-[10px] text-gamana-500 mt-0.5">Earned {timeAgo(badge.earnedAt)}</p>
        )}
      </div>
    </div>
  );
}

/** Utility to get all badge definitions merged with earned state */
export function getAllBadgeDisplayItems(earnedBadges: Badge[]): Badge[] {
  const earnedMap = new Map(earnedBadges.map((b) => [b.id, b]));
  return (Object.keys(BADGE_CATALOG) as BadgeId[]).map((id) => {
    const earned = earnedMap.get(id);
    if (earned) return earned;
    return { ...BADGE_CATALOG[id], earnedAt: null };
  });
}
