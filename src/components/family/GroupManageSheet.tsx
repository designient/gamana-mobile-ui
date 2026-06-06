import { useState } from 'react';
import { X, UserMinus, Trash2, Pencil, Check, ShieldCheck, Baby, MapPinOff, ChevronDown, Shield, User, Crown, MapPin, Clock } from 'lucide-react';
import type { FamilyGroup, FamilyMember, MemberRole } from '../../types';
import { isAdmin, isChild, getMemberFreshness } from '../../types';
import BatteryIndicator from './BatteryIndicator';

interface GroupManageSheetProps {
  isOpen: boolean;
  group: FamilyGroup;
  selfUid: string;
  onClose: () => void;
  onRemoveMember: (groupId: string, memberId: string) => void;
  onDeleteGroup: (groupId: string) => void;
  onRenameGroup: (groupId: string, name: string) => void;
  onPromoteToAdmin: (groupId: string, memberId: string) => void;
  onDemoteFromAdmin: (groupId: string, memberId: string) => void;
  onSetMemberRole: (groupId: string, memberId: string, role: MemberRole) => void;
}

const ROLE_INFO: Record<MemberRole, { label: string; description: string; color: string; bg: string; border: string; icon: typeof Shield }> = {
  admin: {
    label: 'Admin',
    description: 'Can manage members, change roles, and edit group settings.',
    color: 'text-amber-600',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800',
    icon: ShieldCheck,
  },
  member: {
    label: 'Member',
    description: 'Can view locations, send messages, and share their own location.',
    color: 'text-slate-600',
    bg: 'bg-slate-50 dark:bg-slate-800/30',
    border: 'border-slate-200 dark:border-slate-700',
    icon: User,
  },
  child: {
    label: 'Child',
    description: 'Location always shared with admins. Cannot disable tracking.',
    color: 'text-purple-600',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-200 dark:border-purple-800',
    icon: Baby,
  },
};

function RoleBadge({ member, isCreator }: { member: FamilyMember; isCreator: boolean }) {
  const info = ROLE_INFO[member.role];
  const Icon = info.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${info.bg} ${info.color} text-[10px] font-semibold border ${info.border}`}>
      {isCreator ? <Crown size={10} /> : <Icon size={10} />}
      {isCreator ? 'Owner' : info.label}
    </span>
  );
}

function timeAgo(timestamp: string): string {
  const ms = Date.now() - new Date(timestamp).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  return `${hr}h ${min % 60}m ago`;
}

interface RoleConfirmDialogProps {
  member: FamilyMember;
  newRole: MemberRole;
  onConfirm: () => void;
  onCancel: () => void;
}

function RoleConfirmDialog({ member, newRole, onConfirm, onCancel }: RoleConfirmDialogProps) {
  const currentInfo = ROLE_INFO[member.role];
  const newInfo = ROLE_INFO[newRole];
  const NewIcon = newInfo.icon;

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center animate-fade-in px-6">
      <div className="w-full max-w-sm bg-surface rounded-3xl p-6 animate-scale-in shadow-elevated">
        <h3 className="text-base font-bold text-heading mb-1 text-center">Change Role</h3>
        <p className="text-xs text-secondary text-center mb-5">
          Update <span className="font-semibold text-heading">{member.displayName}</span>'s role
        </p>

        {/* Role transition */}
        <div className="flex items-center justify-center gap-3 mb-5">
          <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl ${currentInfo.bg} border ${currentInfo.border}`}>
            <currentInfo.icon size={14} className={currentInfo.color} />
            <span className={`text-xs font-semibold ${currentInfo.color}`}>{currentInfo.label}</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-0.5 bg-border-default" />
            <div className="w-0 h-0 border-t-4 border-b-4 border-l-6 border-t-transparent border-b-transparent border-l-secondary" />
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl ${newInfo.bg} border ${newInfo.border} ring-2 ring-offset-2 ring-gamana-400`}>
            <NewIcon size={14} className={newInfo.color} />
            <span className={`text-xs font-semibold ${newInfo.color}`}>{newInfo.label}</span>
          </div>
        </div>

        {/* Role description */}
        <div className={`px-4 py-3 rounded-xl ${newInfo.bg} border ${newInfo.border} mb-5`}>
          <p className="text-xs text-secondary leading-relaxed">
            <span className={`font-semibold ${newInfo.color}`}>{newInfo.label}:</span>{' '}
            {newInfo.description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-surface-muted text-secondary font-semibold text-sm hover:bg-surface-alt transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-gamana-500 text-white font-semibold text-sm hover:bg-gamana-600 transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GroupManageSheet({
  isOpen,
  group,
  selfUid,
  onClose,
  onRemoveMember,
  onDeleteGroup,
  onRenameGroup,
  onPromoteToAdmin,
  onDemoteFromAdmin,
  onSetMemberRole,
}: GroupManageSheetProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(group.name);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [roleMenuFor, setRoleMenuFor] = useState<string | null>(null);
  const [pendingRoleChange, setPendingRoleChange] = useState<{ member: FamilyMember; newRole: MemberRole } | null>(null);

  if (!isOpen) return null;

  const selfMember = group.members.find((m) => m.uid === selfUid);
  const selfIsAdmin = selfMember ? isAdmin(selfMember) : false;

  const handleRename = () => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== group.name) {
      onRenameGroup(group.id, trimmed);
    }
    setIsEditing(false);
  };

  const handleRoleChange = (memberId: string, role: MemberRole) => {
    if (role === 'admin') {
      onPromoteToAdmin(group.id, memberId);
    } else if (role === 'member') {
      const member = group.members.find((m) => m.uid === memberId);
      if (member && isAdmin(member)) {
        onDemoteFromAdmin(group.id, memberId);
      } else {
        onSetMemberRole(group.id, memberId, 'member');
      }
    } else {
      onSetMemberRole(group.id, memberId, role);
    }
    setRoleMenuFor(null);
    setPendingRoleChange(null);
  };

  const initiateRoleChange = (member: FamilyMember, newRole: MemberRole) => {
    if (member.role === newRole) {
      setRoleMenuFor(null);
      return;
    }
    setPendingRoleChange({ member, newRole });
    setRoleMenuFor(null);
  };

  const canChangeRole = (member: FamilyMember): boolean => {
    if (!selfIsAdmin) return false;
    if (member.isSelf) return false;
    if (member.uid === group.ownerId) return false;
    return true;
  };

  // Always show all 3 roles for any member — no DOB gating
  const getAvailableRoles = (_member: FamilyMember): { role: MemberRole; label: string; icon: typeof Shield; description: string }[] => {
    return [
      { role: 'admin', label: 'Admin', icon: ShieldCheck, description: 'Can manage the group' },
      { role: 'member', label: 'Member', icon: User, description: 'Can view & share' },
      { role: 'child', label: 'Child', icon: Baby, description: 'Always shares location' },
    ];
  };

  // Group members by role
  const adminMembers = group.members.filter((m) => isAdmin(m));
  const regularMembers = group.members.filter((m) => m.role === 'member');
  const childMembers = group.members.filter((m) => isChild(m));
  const sharingCount = group.members.filter((m) => m.visibility === 'visible' && m.location).length;

  const renderMember = (member: FamilyMember) => {
    const freshness = member.location ? getMemberFreshness(member.location.timestamp) : 'offline';
    const freshnessColor = freshness === 'fresh' ? 'bg-emerald-400' : freshness === 'delayed' ? 'bg-amber-400' : 'bg-slate-300';

    return (
      <div
        key={member.uid}
        className="flex items-center gap-3 p-3 rounded-2xl bg-surface hover:bg-surface-alt transition-colors border border-border-subtle"
      >
        {/* Avatar with status dot */}
        <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
          {member.avatarUrl ? (
            <img src={member.avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: member.color }}
            >
              {member.initials}
            </div>
          )}
          {/* Freshness dot */}
          <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${freshnessColor}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-semibold text-heading truncate">
              {member.displayName}
            </span>
            {member.isSelf && (
              <span className="text-[10px] text-gamana-500 font-semibold bg-gamana-50 dark:bg-gamana-900/20 px-1.5 py-0.5 rounded-full">(You)</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <RoleBadge member={member} isCreator={member.uid === group.ownerId} />
            {member.battery && (
              <BatteryIndicator level={member.battery.level} charging={member.battery.charging} size="sm" />
            )}
            {member.visibility === 'not_sharing' ? (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-muted">
                <MapPinOff size={10} /> Not sharing
              </span>
            ) : member.location?.timestamp ? (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-secondary">
                <Clock size={9} /> {freshness === 'fresh' ? 'Active now' : timeAgo(member.location.timestamp)}
              </span>
            ) : null}
          </div>
        </div>

        {/* Role dropdown for admins */}
        {canChangeRole(member) && (
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setRoleMenuFor(roleMenuFor === member.uid ? null : member.uid)}
              className="p-2 rounded-xl hover:bg-surface-muted transition-colors border border-border-subtle"
              title="Change role"
            >
              <ChevronDown size={14} className={`text-muted transition-transform duration-200 ${roleMenuFor === member.uid ? 'rotate-180' : ''}`} />
            </button>
            {roleMenuFor === member.uid && (
              <div className="absolute right-0 top-10 z-10 bg-surface rounded-2xl shadow-elevated border border-border-default py-1.5 min-w-[180px] animate-scale-in">
                <p className="px-3 py-1 text-[10px] font-semibold text-muted uppercase tracking-wider">Set Role</p>
                {getAvailableRoles(member).map(({ role, label, icon: Icon, description }) => (
                  <button
                    key={role}
                    onClick={() => initiateRoleChange(member, role)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-surface-alt transition-colors ${
                      member.role === role ? 'bg-gamana-50 dark:bg-gamana-900/10' : ''
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${ROLE_INFO[role].bg}`}>
                      <Icon size={14} className={ROLE_INFO[role].color} />
                    </div>
                    <div className="flex-1 text-left">
                      <span className={`text-sm font-medium ${member.role === role ? 'text-gamana-600' : 'text-heading'}`}>
                        {label}
                      </span>
                      <p className="text-[10px] text-muted">{description}</p>
                    </div>
                    {member.role === role && (
                      <Check size={14} className="text-gamana-500 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Remove button */}
        {selfIsAdmin && !member.isSelf && member.uid !== group.ownerId && (
          <button
            onClick={() => onRemoveMember(group.id, member.uid)}
            className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0"
            title="Remove member"
          >
            <UserMinus size={14} className="text-red-400" />
          </button>
        )}
      </div>
    );
  };

  const renderRoleSection = (title: string, icon: typeof Shield, members: FamilyMember[], color: string, bgColor: string) => {
    if (members.length === 0) return null;
    return (
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-5 h-5 rounded-md flex items-center justify-center ${bgColor}`}>
            {(() => { const Icon = icon; return <Icon size={11} className={color} />; })()}
          </div>
          <span className={`text-[11px] font-semibold uppercase tracking-wider ${color}`}>
            {title} ({members.length})
          </span>
        </div>
        <div className="space-y-2">
          {members.map(renderMember)}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center animate-fade-in" onClick={onClose}>
        <div className="w-full max-w-[402px] bg-surface rounded-t-3xl animate-slide-up max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          {/* Header with gradient accent */}
          <div className="sticky top-0 bg-surface z-10 rounded-t-3xl">
            <div className="h-1 rounded-t-3xl bg-gradient-to-r from-gamana-400 via-purple-400 to-amber-400" />
            <div className="flex items-center justify-between px-6 pt-5 pb-3">
              <h2 className="text-lg font-bold text-heading">Manage Group</h2>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-surface-muted transition-colors">
                <X size={20} className="text-muted" />
              </button>
            </div>
          </div>

          <div className="px-6 pb-8">
            {/* Group name */}
            <div className="mb-5">
              <label className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2 block">
                Group Name
              </label>
              {isEditing ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    maxLength={40}
                    autoFocus
                    className="flex-1 px-3 py-2.5 rounded-xl border border-border-default text-sm focus:outline-none focus:ring-2 focus:ring-gamana-400 bg-surface"
                  />
                  <button
                    onClick={handleRename}
                    className="px-4 py-2.5 rounded-xl bg-gamana-500 text-white hover:bg-gamana-600 transition-colors"
                  >
                    <Check size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-xl bg-surface-alt border border-border-subtle">
                  <span className="text-sm font-semibold text-heading">{group.name}</span>
                  {selfIsAdmin && (
                    <button
                      onClick={() => { setEditName(group.name); setIsEditing(true); }}
                      className="p-1.5 rounded-lg hover:bg-surface-muted transition-colors"
                    >
                      <Pencil size={14} className="text-muted" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Group stats bar */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              <div className="flex flex-col items-center py-2.5 rounded-xl bg-surface-alt border border-border-subtle">
                <span className="text-lg font-bold text-heading">{group.members.length}</span>
                <span className="text-[10px] text-muted font-medium">Members</span>
              </div>
              <div className="flex flex-col items-center py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
                <div className="flex items-center gap-1">
                  <MapPin size={12} className="text-emerald-500" />
                  <span className="text-lg font-bold text-emerald-600">{sharingCount}</span>
                </div>
                <span className="text-[10px] text-emerald-600 font-medium">Sharing</span>
              </div>
              <div className="flex flex-col items-center py-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800">
                <div className="flex items-center gap-1">
                  <Baby size={12} className="text-purple-500" />
                  <span className="text-lg font-bold text-purple-600">{childMembers.length}</span>
                </div>
                <span className="text-[10px] text-purple-600 font-medium">Children</span>
              </div>
            </div>

            {/* Members grouped by role */}
            {renderRoleSection('Admins', ShieldCheck, adminMembers, 'text-amber-600', 'bg-amber-50 dark:bg-amber-900/20')}
            {renderRoleSection('Members', User, regularMembers, 'text-slate-500', 'bg-slate-100 dark:bg-slate-800/30')}
            {renderRoleSection('Children', Baby, childMembers, 'text-purple-600', 'bg-purple-50 dark:bg-purple-900/20')}

            {/* Danger zone */}
            {selfIsAdmin && selfUid === group.ownerId && (
              <div className="pt-5 mt-3 border-t border-border-default">
                <p className="text-[10px] font-semibold text-red-400 uppercase tracking-wider mb-2">Danger Zone</p>
                {confirmDelete ? (
                  <div className="space-y-3 p-4 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-600 font-medium">
                      Delete "{group.name}"? This removes all members and tracking data.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setConfirmDelete(false)}
                        className="flex-1 py-2.5 rounded-xl bg-white dark:bg-surface text-gray-700 text-sm font-medium border border-border-default"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => { onDeleteGroup(group.id); onClose(); }}
                        className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors"
                      >
                        Delete Group
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="flex items-center gap-2 w-full py-3 px-4 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-medium border border-red-100 dark:border-red-900/30"
                  >
                    <Trash2 size={15} />
                    Delete Group
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Role change confirmation dialog */}
      {pendingRoleChange && (
        <RoleConfirmDialog
          member={pendingRoleChange.member}
          newRole={pendingRoleChange.newRole}
          onConfirm={() => handleRoleChange(pendingRoleChange.member.uid, pendingRoleChange.newRole)}
          onCancel={() => setPendingRoleChange(null)}
        />
      )}
    </>
  );
}
