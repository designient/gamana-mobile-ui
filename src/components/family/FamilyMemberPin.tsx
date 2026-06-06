import { getMemberFreshness, getBatteryTier, isChild as isMemberChild } from '../../types';
import type { FamilyMember, MemberFreshness } from '../../types';
import { Baby } from 'lucide-react';

const freshnessOpacity: Record<MemberFreshness, string> = {
  fresh: 'opacity-100',
  delayed: 'opacity-90',
  stale: 'opacity-50',
  offline: 'opacity-30',
  expired: 'opacity-0',
};

interface FamilyMemberPinProps {
  member: FamilyMember;
  onTap?: () => void;
  showPulse?: boolean;
}

export default function FamilyMemberPin({ member, onTap, showPulse }: FamilyMemberPinProps) {
  const freshness = getMemberFreshness(member.location?.timestamp);
  const isSelf = member.isSelf;
  const isChildMember = isMemberChild(member);
  const size = isSelf ? 'w-12 h-12' : 'w-10 h-10';
  const batteryTier = member.battery ? getBatteryTier(member.battery.level) : null;

  const borderColor = isSelf
    ? 'ring-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.4)]'
    : isChildMember
      ? 'ring-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.3)]'
      : 'ring-white';

  return (
    <button
      onClick={onTap}
      className={`relative flex flex-col items-center transition-opacity duration-500 ${freshnessOpacity[freshness]}`}
    >
      {/* Pulse ring for self or fresh update */}
      {(isSelf || showPulse) && freshness === 'fresh' && (
        <div
          className={`absolute rounded-full animate-ping-slow ${
            isSelf ? 'w-14 h-14 bg-blue-400/20 -top-1 -left-1' : 'w-12 h-12 bg-gamana-400/20 -top-1 -left-1'
          }`}
        />
      )}

      {/* Avatar circle */}
      <div
        className={`relative ${size} rounded-full ring-[3px] ${borderColor} overflow-hidden shadow-lg`}
      >
        {member.avatarUrl ? (
          <img
            src={member.avatarUrl}
            alt={member.displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: member.color }}
          >
            <span className={isSelf ? 'text-sm' : 'text-xs'}>{member.initials}</span>
          </div>
        )}
      </div>

      {/* Child badge (top-left corner) */}
      {isChildMember && (
        <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-purple-500 border-2 border-white flex items-center justify-center z-10">
          <Baby size={9} className="text-white" />
        </div>
      )}

      {/* Battery overlay (bottom-right corner) */}
      {member.battery && batteryTier && (
        <div
          className={`absolute -bottom-0.5 -right-1 flex items-center justify-center w-5 h-5 rounded-full border-2 border-white text-[8px] font-bold shadow-sm ${
            batteryTier === 'good'
              ? 'bg-emerald-500 text-white'
              : batteryTier === 'medium'
                ? 'bg-amber-500 text-white'
                : 'bg-red-500 text-white'
          }`}
        >
          {member.battery.level < 100 ? member.battery.level : ''}
        </div>
      )}

      {/* Name label */}
      <div className="mt-1 px-2 py-0.5 rounded-md bg-surface/90 shadow-sm backdrop-blur-sm">
        <span className={`text-[10px] font-medium text-heading whitespace-nowrap ${
          isSelf ? 'font-semibold text-heading' : ''
        }`}>
          {member.displayName}
        </span>
      </div>

      {/* Stale indicator */}
      {(freshness === 'stale' || freshness === 'offline') && (
        <div className="mt-0.5 px-1.5 py-0.5 rounded bg-surface-muted">
          <span className="text-[8px] text-secondary">
            {freshness === 'stale' ? 'Delayed' : 'Offline'}
          </span>
        </div>
      )}
    </button>
  );
}
