import { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Users,
  Settings,
  UserPlus,
  MapPin,
  ChevronRight,
  MapPinOff,
  MessageCircle,
  ShieldCheck,
  Baby,
  Lock,
  ShieldAlert,
  LogIn,
  Clock,
  Sparkles,
  Radio,
} from 'lucide-react';
import type { FamilyGroup, MemberFreshness } from '../../types';
import { getMemberFreshness, isAdmin, isChild } from '../../types';
import { useFamilyTracking } from '../../hooks/useFamilyTracking';
import { useFamilyMessages } from '../../hooks/useFamilyMessages';
import FamilyMapView from './FamilyMapView';
import TrackingToggle from './TrackingToggle';
import TrackingBanner from './TrackingBanner';
import PermissionScreen from './PermissionScreen';
import CreateGroupSheet from './CreateGroupSheet';
import InviteSheet from './InviteSheet';
import GroupManageSheet from './GroupManageSheet';
import BatteryIndicator from './BatteryIndicator';
import FamilyChat from './FamilyChat';
import SOSSheet from './SOSSheet';
import JoinGroupSheet from './JoinGroupSheet';

interface FamilyScreenProps {
  onBack: () => void;
}

type SubView = 'map' | 'chat';

export default function FamilyScreen({ onBack }: FamilyScreenProps) {
  const {
    groups,
    activeGroup,
    setActiveGroupId,
    trackingMode,
    locationPermission,
    showPermissionScreen,
    selfUid,
    selfMember,
    selfIsChild,
    enableTracking,
    stopTracking,
    handlePermissionContinue,
    handlePermissionDismiss,
    handleCreateGroup,
    handleRemoveMember,
    handleDeleteGroup,
    handleRenameGroup,
    handlePromoteToAdmin,
    handleDemoteFromAdmin,
    handleSetMemberRole,
  } = useFamilyTracking();

  const { unreadCount } = useFamilyMessages(activeGroup?.id ?? null);

  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [showJoinSheet, setShowJoinSheet] = useState(false);
  const [showInviteSheet, setShowInviteSheet] = useState(false);
  const [showManageSheet, setShowManageSheet] = useState(false);
  const [showSOS, setShowSOS] = useState(false);
  const [subView, setSubView] = useState<SubView>('map');
  const [chatMention, setChatMention] = useState<string | null>(null);

  const openChat = (mention?: string) => {
    setChatMention(mention ?? null);
    setSubView('chat');
  };

  const selfIsAdmin = selfMember ? isAdmin(selfMember) : false;

  // Active group: chat sub-view
  if (activeGroup && subView === 'chat') {
    return (
      <>
        <FamilyChat
          group={activeGroup}
          onBack={() => { setSubView('map'); setChatMention(null); }}
          initialMention={chatMention}
        />
        {showPermissionScreen && (
          <PermissionScreen
            onContinue={handlePermissionContinue}
            onDismiss={handlePermissionDismiss}
          />
        )}
      </>
    );
  }

  // Active group: map view
  if (activeGroup) {
    const sharingCount = activeGroup.members.filter((m) => m.visibility === 'visible' && m.location).length;

    return (
      <div className="flex flex-col h-full bg-surface">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 pt-12 pb-3 bg-surface border-b border-border-default z-10">
          <button
            onClick={() => setActiveGroupId(null)}
            className="p-1.5 rounded-lg hover:bg-surface-muted transition-colors"
          >
            <ArrowLeft size={20} className="text-secondary" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-heading truncate">
              {activeGroup.name}
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                <Radio size={9} className="animate-pulse" />
                {sharingCount} sharing
              </span>
              <span className="text-[11px] text-faint">·</span>
              <span className="text-[11px] text-secondary">{activeGroup.members.length} members</span>
            </div>
          </div>
          {selfIsAdmin && (
            <>
              <button
                onClick={() => setShowInviteSheet(true)}
                className="p-2 rounded-xl hover:bg-surface-muted transition-colors border border-border-subtle"
              >
                <UserPlus size={18} className="text-secondary" />
              </button>
              <button
                onClick={() => setShowManageSheet(true)}
                className="p-2 rounded-xl hover:bg-surface-muted transition-colors border border-border-subtle"
              >
                <Settings size={18} className="text-secondary" />
              </button>
            </>
          )}
        </div>

        {/* Tracking toggle bar */}
        <div className="px-4 py-3 bg-surface border-b border-border-subtle">
          {selfIsChild ? (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800">
              <Lock size={14} className="text-purple-400 flex-shrink-0" />
              <span className="text-xs text-purple-600 font-medium">
                Your location is shared with family admins
              </span>
            </div>
          ) : (
            <TrackingToggle
              mode={trackingMode}
              onEnable={enableTracking}
              onDisable={stopTracking}
            />
          )}
        </div>

        <TrackingBanner mode={trackingMode} permissionState={locationPermission} />

        {/* Map */}
        <div className="flex-1 min-h-0 relative">
          <FamilyMapView group={activeGroup} onMessageMember={(name) => openChat(name)} />

          {/* SOS FAB */}
          <button
            onClick={() => setShowSOS(true)}
            className="absolute bottom-4 left-4 z-10 w-12 h-12 rounded-full bg-red-500 text-white shadow-elevated flex items-center justify-center hover:bg-red-600 active:scale-95 transition-all"
          >
            <ShieldAlert size={22} />
          </button>

          {/* Chat FAB */}
          <button
            onClick={() => openChat()}
            className="absolute bottom-4 right-4 z-10 w-12 h-12 rounded-full bg-gamana-500 text-white shadow-elevated flex items-center justify-center hover:bg-gamana-600 transition-colors"
          >
            <MessageCircle size={22} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Member strip - Enhanced carousel */}
        <div className="bg-surface border-t border-border-default px-3 py-3">
          <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
            {activeGroup.members.map((member) => {
              const freshness = member.location
                ? getMemberFreshness(member.location.timestamp)
                : 'offline';
              const freshnessColor = freshness === 'fresh' ? 'border-emerald-400' : freshness === 'delayed' ? 'border-amber-400' : 'border-border-subtle';
              const isLive = freshness === 'fresh';

              return (
                <div
                  key={member.uid}
                  className={`flex-shrink-0 flex items-center gap-2.5 px-3 py-2.5 rounded-2xl bg-surface-alt min-w-[160px] border ${freshnessColor} transition-all duration-300 hover:shadow-card cursor-pointer ${isLive ? 'shadow-sm' : ''}`}
                >
                  <div className="relative w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
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
                    {isChild(member) && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-purple-500 border border-white flex items-center justify-center">
                        <Baby size={7} className="text-white" />
                      </div>
                    )}
                    {/* Live indicator dot */}
                    {isLive && (
                      <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white">
                        <div className="w-full h-full rounded-full bg-emerald-400 animate-ping" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="text-[11px] font-semibold text-heading truncate">
                        {member.displayName}
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
                          {member.visibility === 'not_sharing' ? 'Not sharing' : freshness === 'fresh' ? 'Live' : freshness}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Overlay sheets */}
        <InviteSheet
          isOpen={showInviteSheet}
          groupName={activeGroup.name}
          inviteCode={activeGroup.inviteCode}
          onClose={() => setShowInviteSheet(false)}
        />
        <GroupManageSheet
          isOpen={showManageSheet}
          group={activeGroup}
          selfUid={selfUid}
          onClose={() => setShowManageSheet(false)}
          onRemoveMember={handleRemoveMember}
          onDeleteGroup={handleDeleteGroup}
          onRenameGroup={handleRenameGroup}
          onPromoteToAdmin={handlePromoteToAdmin}
          onDemoteFromAdmin={handleDemoteFromAdmin}
          onSetMemberRole={handleSetMemberRole}
        />
        {showPermissionScreen && (
          <PermissionScreen
            onContinue={handlePermissionContinue}
            onDismiss={handlePermissionDismiss}
          />
        )}
        <SOSSheet isOpen={showSOS} onClose={() => setShowSOS(false)} />
      </div>
    );
  }

  // Group list view
  const totalSharing = groups.reduce((sum, g) => sum + g.members.filter((m) => m.visibility === 'visible' && m.location).length, 0);

  return (
    <div className="flex flex-col h-full bg-canvas">
      {/* Header */}
      <div className="bg-surface border-b border-border-default">
        <div className="flex items-center gap-3 px-4 pt-12 pb-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-surface-muted transition-colors"
          >
            <ArrowLeft size={20} className="text-secondary" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-heading">Family Tracking</h1>
            {groups.length > 0 && (
              <p className="text-[11px] text-secondary mt-0.5">
                {groups.length} group{groups.length > 1 ? 's' : ''} · {totalSharing} member{totalSharing !== 1 ? 's' : ''} sharing
              </p>
            )}
          </div>
          <button
            onClick={() => setShowJoinSheet(true)}
            className="p-2 rounded-xl hover:bg-surface-muted transition-colors border border-border-subtle"
            title="Join a group"
          >
            <LogIn size={18} className="text-secondary" />
          </button>
          <button
            onClick={() => setShowCreateSheet(true)}
            className="p-2 rounded-xl bg-gamana-50 dark:bg-gamana-900/20 hover:bg-gamana-100 transition-colors"
          >
            <Plus size={18} className="text-gamana-500" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {selfIsChild ? (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 mb-4">
            <Lock size={14} className="text-purple-400 flex-shrink-0" />
            <span className="text-xs text-purple-600 font-medium">
              Your location is shared with family admins
            </span>
          </div>
        ) : (
          <div className="mb-4">
            <TrackingToggle
              mode={trackingMode}
              onEnable={enableTracking}
              onDisable={stopTracking}
            />
          </div>
        )}

        <TrackingBanner mode={trackingMode} permissionState={locationPermission} />

        {groups.length === 0 ? (
          <EmptyState
            onCreateGroup={() => setShowCreateSheet(true)}
            onJoinGroup={() => setShowJoinSheet(true)}
          />
        ) : (
          <div className="space-y-3">
            <label className="text-[11px] font-semibold text-muted uppercase tracking-wider">
              Your Groups
            </label>
            {groups.map((group, index) => (
              <GroupCard
                key={group.id}
                group={group}
                selfUid={selfUid}
                onTap={() => setActiveGroupId(group.id)}
                index={index}
              />
            ))}
          </div>
        )}
      </div>

      <CreateGroupSheet
        isOpen={showCreateSheet}
        onClose={() => setShowCreateSheet(false)}
        onCreate={handleCreateGroup}
      />
      <JoinGroupSheet
        isOpen={showJoinSheet}
        onClose={() => setShowJoinSheet(false)}
      />
      {showPermissionScreen && (
        <PermissionScreen
          onContinue={handlePermissionContinue}
          onDismiss={handlePermissionDismiss}
        />
      )}
    </div>
  );
}

function EmptyState({ onCreateGroup, onJoinGroup }: { onCreateGroup: () => void; onJoinGroup: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {/* Animated illustration */}
      <div className="relative w-24 h-24 mb-6">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-gamana-100 to-purple-100 dark:from-gamana-900/30 dark:to-purple-900/30 animate-pulse-slow" />
        <div className="absolute inset-2 rounded-2xl bg-surface flex items-center justify-center">
          <Users size={36} className="text-gamana-400" />
        </div>
        {/* Floating pin icons */}
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 flex items-center justify-center animate-bounce-slow">
          <MapPin size={14} className="text-emerald-500" />
        </div>
        <div className="absolute -bottom-1 -left-3 w-7 h-7 rounded-full bg-purple-50 dark:bg-purple-900/20 border border-purple-200 flex items-center justify-center animate-bounce-slow" style={{ animationDelay: '0.3s' }}>
          <Baby size={12} className="text-purple-500" />
        </div>
        <div className="absolute top-1 -left-4 w-6 h-6 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 flex items-center justify-center animate-bounce-slow" style={{ animationDelay: '0.6s' }}>
          <ShieldCheck size={10} className="text-amber-500" />
        </div>
      </div>

      <h3 className="text-base font-bold text-heading mb-1.5">Stay Connected, Stay Safe</h3>
      <p className="text-sm text-secondary mb-2 max-w-[260px]">
        Create a family group to share live locations, get SOS alerts, and keep everyone safe while traveling.
      </p>

      {/* Onboarding steps */}
      <div className="flex items-center gap-3 mb-6 mt-2">
        {[
          { label: 'Create', icon: Plus },
          { label: 'Invite', icon: UserPlus },
          { label: 'Track', icon: MapPin },
        ].map((step, i) => (
          <div key={step.label} className="flex items-center gap-2">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-gamana-50 dark:bg-gamana-900/20 flex items-center justify-center mb-1">
                <step.icon size={14} className="text-gamana-500" />
              </div>
              <span className="text-[9px] font-semibold text-secondary">{step.label}</span>
            </div>
            {i < 2 && <div className="w-6 h-0.5 bg-border-default -mt-3" />}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2.5 w-full max-w-[280px]">
        <button
          onClick={onCreateGroup}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gamana-500 text-white font-semibold text-sm hover:bg-gamana-600 transition-all active:scale-[0.97] shadow-sm"
        >
          <Sparkles size={16} />
          Create a Group
        </button>
        <button
          onClick={onJoinGroup}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-surface border border-border-default text-secondary font-medium text-sm hover:bg-surface-alt transition-all"
        >
          <LogIn size={16} />
          Join with Invite Code
        </button>
      </div>
    </div>
  );
}

function GroupCard({ group, selfUid, onTap, index }: { group: FamilyGroup; selfUid: string; onTap: () => void; index: number }) {
  const { unreadCount } = useFamilyMessages(group.id);
  const activeMemberCount = group.members.filter(
    (m) => m.visibility === 'visible' && m.location
  ).length;
  const totalMembers = group.members.length;
  const childCount = group.members.filter((m) => isChild(m)).length;
  const selfInGroup = group.members.find((m) => m.uid === selfUid);
  const selfIsOwner = selfInGroup && group.ownerId === selfUid;

  // Get latest activity timestamp
  const latestTimestamp = group.members.reduce((latest, m) => {
    if (m.location?.timestamp) {
      const ts = new Date(m.location.timestamp).getTime();
      return ts > latest ? ts : latest;
    }
    return latest;
  }, 0);

  const lastActivityText = latestTimestamp > 0
    ? (() => {
        const min = Math.floor((Date.now() - latestTimestamp) / 60000);
        if (min < 1) return 'Active now';
        if (min < 60) return `${min}m ago`;
        const hr = Math.floor(min / 60);
        return `${hr}h ago`;
      })()
    : null;

  // Activity level determines accent color
  const activityColor = activeMemberCount > 0
    ? 'from-emerald-400/80 to-emerald-500/80'
    : 'from-slate-300/60 to-slate-400/60';

  return (
    <button
      onClick={onTap}
      className="w-full flex items-center gap-3 p-4 rounded-2xl bg-surface shadow-card border border-border-subtle hover:border-gamana-200 hover:shadow-md transition-all text-left group animate-fade-in-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Group icon with activity bar */}
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 rounded-xl bg-gamana-50 dark:bg-gamana-900/20 flex items-center justify-center">
          <Users size={22} className="text-gamana-500" />
        </div>
        {/* Activity bar */}
        <div className={`absolute -bottom-1 left-1 right-1 h-1 rounded-full bg-gradient-to-r ${activityColor}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center border-2 border-white shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <h3 className="text-sm font-bold text-heading truncate">{group.name}</h3>
          {selfIsOwner && (
            <ShieldCheck size={12} className="text-amber-500 flex-shrink-0" />
          )}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-secondary">{totalMembers} members</span>
          <span className="text-[11px] text-faint">·</span>
          {activeMemberCount > 0 ? (
            <span className="flex items-center gap-0.5 text-[11px] text-emerald-600 font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {activeMemberCount} live
            </span>
          ) : (
            <span className="flex items-center gap-0.5 text-[11px] text-muted">
              <MapPinOff size={10} /> None sharing
            </span>
          )}
          {childCount > 0 && (
            <>
              <span className="text-[11px] text-faint">·</span>
              <span className="flex items-center gap-0.5 text-[11px] text-purple-500">
                <Baby size={10} /> {childCount} child{childCount > 1 ? 'ren' : ''}
              </span>
            </>
          )}
        </div>

        {/* Last activity & avatars */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex -space-x-2">
            {group.members.slice(0, 5).map((m) => {
              const f = m.location ? getMemberFreshness(m.location.timestamp) : 'offline';
              const ringColor = f === 'fresh' ? 'ring-emerald-300' : 'ring-white';
              return (
                <div
                  key={m.uid}
                  className={`w-6 h-6 rounded-full border-2 border-white overflow-hidden ring-1 ${ringColor}`}
                >
                  {m.avatarUrl ? (
                    <img src={m.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-white text-[8px] font-bold"
                      style={{ backgroundColor: m.color }}
                    >
                      {m.initials}
                    </div>
                  )}
                </div>
              );
            })}
            {group.members.length > 5 && (
              <div className="w-6 h-6 rounded-full border-2 border-white bg-surface-muted flex items-center justify-center ring-1 ring-white">
                <span className="text-[8px] font-bold text-secondary">
                  +{group.members.length - 5}
                </span>
              </div>
            )}
          </div>
          {lastActivityText && (
            <span className="flex items-center gap-1 text-[10px] text-muted">
              <Clock size={9} />
              {lastActivityText}
            </span>
          )}
        </div>
      </div>

      <ChevronRight size={18} className="text-faint flex-shrink-0 group-hover:text-gamana-400 transition-colors" />
    </button>
  );
}
