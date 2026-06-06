import { X, MessageCircle, Navigation, ShieldCheck, Baby, Clock, MapPin } from 'lucide-react';
import type { FamilyMember } from '../../types';
import { getMemberFreshness, isAdmin, isChild } from '../../types';
import BatteryIndicator from './BatteryIndicator';

interface MemberDetailCardProps {
  member: FamilyMember;
  onClose: () => void;
  onMessage?: (memberName: string) => void;
}

function timeAgo(timestamp: string): string {
  const ms = Date.now() - new Date(timestamp).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  return `${hr}h ${min % 60}m ago`;
}

const ROLE_CONFIG = {
  admin: { label: 'Admin', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', icon: ShieldCheck },
  member: { label: 'Member', color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-800/30', border: 'border-slate-200 dark:border-slate-700', icon: MapPin },
  child: { label: 'Child', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800', icon: Baby },
};

export default function MemberDetailCard({ member, onClose, onMessage }: MemberDetailCardProps) {
  const freshness = getMemberFreshness(member.location?.timestamp);
  const roleConfig = ROLE_CONFIG[member.role];
  const RoleIcon = roleConfig.icon;
  const freshnessColor = freshness === 'fresh' ? 'bg-emerald-400' : freshness === 'delayed' ? 'bg-amber-400' : 'bg-slate-300';

  return (
    <div className="absolute bottom-20 left-4 right-4 z-20 animate-slide-up">
      <div className="bg-surface/95 backdrop-blur-md rounded-2xl shadow-elevated p-4 border border-border-default">
        <div className="flex items-start gap-3">
          {/* Avatar with status */}
          <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-gray-100 dark:ring-gray-800">
            {member.avatarUrl ? (
              <img src={member.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: member.color }}
              >
                {member.initials}
              </div>
            )}
            {/* Status dot */}
            <div className={`absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${freshnessColor}`} />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <h3 className="text-sm font-bold text-heading truncate">
                  {member.displayName}
                  {member.isSelf && <span className="text-gamana-500 font-medium ml-1">(You)</span>}
                </h3>
              </div>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-surface-muted -mt-1 -mr-1 transition-colors">
                <X size={16} className="text-muted" />
              </button>
            </div>

            {/* Role badge */}
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${roleConfig.bg} ${roleConfig.color} ${roleConfig.border}`}>
                <RoleIcon size={10} />
                {roleConfig.label}
              </span>
              {member.battery && (
                <BatteryIndicator
                  level={member.battery.level}
                  charging={member.battery.charging}
                  size="sm"
                />
              )}
            </div>

            {/* Last seen */}
            <div className="flex items-center gap-1.5 mt-2">
              <Clock size={10} className="text-muted" />
              {member.location?.timestamp ? (
                <span className="text-[11px] text-secondary">
                  {freshness === 'fresh' ? 'Active now' : `Last seen ${timeAgo(member.location.timestamp)}`}
                </span>
              ) : (
                <span className="text-[11px] text-muted">Not sharing location</span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={() => onMessage?.(member.displayName)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gamana-50 dark:bg-gamana-900/20 hover:bg-gamana-100 transition-colors border border-gamana-100 dark:border-gamana-800"
              >
                <MessageCircle size={13} className="text-gamana-600" />
                <span className="text-[11px] font-semibold text-gamana-700">Message</span>
              </button>
              {member.location && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${member.location.lat},${member.location.lng}&travelmode=walking`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 transition-colors border border-blue-100 dark:border-blue-800"
                >
                  <Navigation size={12} className="text-blue-600" />
                  <span className="text-[11px] font-semibold text-blue-700">Directions</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
