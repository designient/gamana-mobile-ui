import { useState, useCallback } from 'react';
import {
  X,
  MapPin,
  MessageCircle,
  ChevronRight,
  ShieldCheck,
  Baby,
} from 'lucide-react';
import type { FamilyGroup } from '../../types';
import { getMemberFreshness, isAdmin, isChild } from '../../types';
import { useFamilyMessages } from '../../hooks/useFamilyMessages';
import BatteryIndicator from '../family/BatteryIndicator';
import FamilyChat from '../family/FamilyChat';

interface TourFamilyPanelProps {
  isOpen: boolean;
  onClose: () => void;
  group: FamilyGroup;
}

const FRESHNESS_DOT: Record<string, string> = {
  fresh: 'bg-emerald-500',
  delayed: 'bg-amber-400',
  stale: 'bg-gray-400',
  offline: 'bg-surface-muted',
  expired: 'bg-surface-muted',
};

export default function TourFamilyPanel({ isOpen, onClose, group }: TourFamilyPanelProps) {
  const [showChat, setShowChat] = useState(false);
  const [chatMention, setChatMention] = useState<string | null>(null);
  const { unreadCount, sendLocationPing } = useFamilyMessages(group.id);

  const handleShareLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => sendLocationPing(pos.coords.latitude, pos.coords.longitude),
      () => {},
      { enableHighAccuracy: true, timeout: 5000 },
    );
  }, [sendLocationPing]);

  const handleOpenChatWith = useCallback((name?: string) => {
    setChatMention(name ?? null);
    setShowChat(true);
  }, []);

  const handleCloseChat = useCallback(() => {
    setShowChat(false);
    setChatMention(null);
  }, []);

  if (!isOpen) return null;

  if (showChat) {
    return (
      <div className="absolute inset-0 z-[60] flex flex-col bg-surface animate-fade-in">
        <FamilyChat
          group={group}
          onBack={handleCloseChat}
          initialMention={chatMention}
        />
      </div>
    );
  }

  const sharingMembers = group.members.filter(
    (m) => m.visibility === 'visible' && m.location,
  );

  return (
    <div className="absolute inset-0 z-[60] flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} />
      <div className="relative w-full bg-surface rounded-t-3xl p-5 pb-7 animate-slide-up max-h-[70%] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gamana-50 dark:bg-gamana-900/20 flex items-center justify-center">
              <MessageCircle size={18} className="text-gamana-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-heading">{group.name}</h2>
              <p className="text-[11px] text-muted">
                {sharingMembers.length} sharing · {group.members.length} members
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-surface-muted">
            <X size={20} className="text-muted" />
          </button>
        </div>

        {/* Member strip */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-3 scrollbar-hide">
          {group.members.map((member) => {
            const freshness = member.location
              ? getMemberFreshness(member.location.timestamp)
              : 'offline';
            const dotColor = FRESHNESS_DOT[freshness] ?? 'bg-surface-muted';

            return (
              <button
                key={member.uid}
                onClick={() => handleOpenChatWith(member.displayName)}
                className="flex-shrink-0 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-surface-alt hover:bg-surface-muted transition-colors min-w-[140px]"
              >
                <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                  {member.avatarUrl ? (
                    <img src={member.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-white text-[10px] font-bold"
                      style={{ backgroundColor: member.color }}
                    >
                      {member.initials}
                    </div>
                  )}
                  {/* Freshness dot */}
                  <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${dotColor}`} />
                  {isChild(member) && (
                    <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-purple-500 border border-white flex items-center justify-center">
                      <Baby size={7} className="text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-1">
                    <p className="text-[11px] font-medium text-heading truncate">
                      {member.isSelf ? 'You' : member.displayName}
                    </p>
                    {isAdmin(member) && (
                      <ShieldCheck size={10} className="text-amber-500 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    {member.battery ? (
                      <BatteryIndicator
                        level={member.battery.level}
                        charging={member.battery.charging}
                        size="sm"
                      />
                    ) : (
                      <span className="text-[9px] text-muted">
                        {member.visibility === 'not_sharing' ? 'Not sharing' : freshness}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Quick actions */}
        <div className="flex gap-2">
          <button
            onClick={handleShareLocation}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gamana-50 dark:bg-gamana-900/20 text-body text-sm font-semibold hover:bg-gamana-100 active:scale-[0.97] transition-all"
          >
            <MapPin size={16} />
            Share My Location
          </button>
          <button
            onClick={() => handleOpenChatWith()}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gamana-500 text-white text-sm font-semibold hover:bg-gamana-600 active:scale-[0.97] transition-all relative"
          >
            <MessageCircle size={16} />
            Open Chat
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center border-2 border-white px-0.5">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Tappable member detail rows */}
        {sharingMembers.length > 0 && (
          <div className="mt-4 pt-3 border-t border-border-default">
            <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-2">
              Currently sharing location
            </p>
            <div className="flex flex-col gap-1">
              {sharingMembers.map((member) => {
                const freshness = getMemberFreshness(member.location!.timestamp);
                return (
                  <button
                    key={member.uid}
                    onClick={() => handleOpenChatWith(member.displayName)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-alt transition-colors"
                  >
                    <div className="relative w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
                      {member.avatarUrl ? (
                        <img src={member.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center text-white text-[9px] font-bold"
                          style={{ backgroundColor: member.color }}
                        >
                          {member.initials}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-xs font-medium text-heading truncate">
                        {member.isSelf ? 'You' : member.displayName}
                      </p>
                    </div>
                    <span className={`text-[10px] font-medium ${
                      freshness === 'fresh' ? 'text-emerald-600' : 'text-muted'
                    }`}>
                      {freshness === 'fresh' ? 'Just now' : freshness}
                    </span>
                    <ChevronRight size={14} className="text-faint flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
