import type { FamilyGroup, FamilyMember, MemberLocation, MemberBattery, MemberRole } from '../types';

const STORAGE_KEY = 'gamana_family_groups';
const SELF_UID = 'self_user_001';

const MEMBER_COLORS = [
  '#1A5F7A', '#D97706', '#059669', '#DC2626',
  '#7C3AED', '#DB2777', '#0284C7', '#CA8A04',
  '#0D9488', '#9333EA',
];

function randomOffset(base: number, range: number): number {
  return base + (Math.random() - 0.5) * range;
}

function minutesAgo(min: number): string {
  return new Date(Date.now() - min * 60000).toISOString();
}

const MOCK_MEMBERS: Omit<FamilyMember, 'isSelf'>[] = [
  {
    uid: SELF_UID,
    displayName: 'You',
    avatarUrl: null,
    initials: 'YO',
    color: MEMBER_COLORS[0],
    visibility: 'visible',
    trackingMode: 'foreground',
    location: null,
    battery: null,
    role: 'admin',
    dateOfBirth: '1990-06-15',
  },
  {
    uid: 'member_002',
    displayName: 'Priya Sharma',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&fit=crop&crop=face',
    initials: 'PS',
    color: MEMBER_COLORS[1],
    visibility: 'visible',
    trackingMode: 'background',
    location: { lat: 12.9725, lng: 77.5960, accuracy: 15, timestamp: minutesAgo(0.5) },
    battery: { level: 72, charging: false, timestamp: minutesAgo(0.5) },
    role: 'admin',
    dateOfBirth: '1988-11-22',
  },
  {
    uid: 'member_003',
    displayName: 'Arjun Reddy',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop&crop=face',
    initials: 'AR',
    color: MEMBER_COLORS[2],
    visibility: 'visible',
    trackingMode: 'foreground',
    location: { lat: 12.9680, lng: 77.5910, accuracy: 30, timestamp: minutesAgo(1) },
    battery: { level: 45, charging: false, timestamp: minutesAgo(1) },
    role: 'member',
    dateOfBirth: '1995-04-10',
  },
  {
    uid: 'member_004',
    displayName: 'Meera Nair',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=128&h=128&fit=crop&crop=face',
    initials: 'MN',
    color: MEMBER_COLORS[3],
    visibility: 'visible',
    trackingMode: 'foreground',
    location: { lat: 12.9750, lng: 77.5990, accuracy: 20, timestamp: minutesAgo(6) },
    battery: { level: 12, charging: false, timestamp: minutesAgo(6) },
    role: 'member',
    dateOfBirth: '1992-09-03',
  },
  {
    uid: 'member_005',
    displayName: 'Karthik Iyer',
    avatarUrl: null,
    initials: 'KI',
    color: MEMBER_COLORS[4],
    visibility: 'visible',
    trackingMode: 'foreground',
    location: { lat: 12.9700, lng: 77.5935, accuracy: 25, timestamp: minutesAgo(3) },
    battery: { level: 68, charging: true, timestamp: minutesAgo(3) },
    role: 'child',
    dateOfBirth: '2012-03-15',
  },
];

function buildMember(
  m: Omit<FamilyMember, 'isSelf'>,
): FamilyMember {
  return { ...m, isSelf: m.uid === SELF_UID };
}

function createDefaultGroup(): FamilyGroup {
  return {
    id: 'grp_001',
    name: 'Sharma Family',
    ownerId: SELF_UID,
    inviteCode: 'GMNA-SH42',
    members: MOCK_MEMBERS.map((m) => buildMember(m)),
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  };
}

/**
 * Migrate members from old schema (isOwner boolean) to new schema (role + dateOfBirth).
 */
function migrateMember(m: FamilyMember & { isOwner?: boolean }): FamilyMember {
  if (m.role === undefined) {
    const legacy = m as FamilyMember & { isOwner?: boolean };
    return {
      ...m,
      role: legacy.isOwner ? 'admin' : 'member',
      dateOfBirth: m.dateOfBirth ?? null,
    };
  }
  if (m.dateOfBirth === undefined) {
    return { ...m, dateOfBirth: null };
  }
  return m;
}

function migrateGroups(groups: FamilyGroup[]): FamilyGroup[] {
  return groups.map((g) => ({
    ...g,
    members: g.members.map(migrateMember),
  }));
}

export function getSelfUid(): string {
  return SELF_UID;
}

export function getFamilyGroups(): FamilyGroup[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as FamilyGroup[];
      const migrated = migrateGroups(parsed);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    } catch { /* fall through */ }
  }
  const defaults = [createDefaultGroup()];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
  return defaults;
}

export function saveFamilyGroups(groups: FamilyGroup[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
}

export function createFamilyGroup(name: string): FamilyGroup {
  const groups = getFamilyGroups();
  const code = `GMNA-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const selfMember: FamilyMember = {
    uid: SELF_UID,
    displayName: 'You',
    avatarUrl: null,
    initials: 'YO',
    color: MEMBER_COLORS[0],
    visibility: 'visible',
    trackingMode: 'off',
    location: null,
    battery: null,
    role: 'admin',
    dateOfBirth: '1990-06-15',
    isSelf: true,
  };
  const newGroup: FamilyGroup = {
    id: `grp_${Date.now()}`,
    name,
    ownerId: SELF_UID,
    inviteCode: code,
    members: [selfMember],
    createdAt: new Date().toISOString(),
  };
  groups.push(newGroup);
  saveFamilyGroups(groups);
  return newGroup;
}

export function removeMemberFromGroup(groupId: string, memberId: string): FamilyGroup[] {
  const groups = getFamilyGroups();
  const group = groups.find((g) => g.id === groupId);
  if (group) {
    group.members = group.members.filter((m) => m.uid !== memberId);
    saveFamilyGroups(groups);
  }
  return groups;
}

export function deleteGroup(groupId: string): FamilyGroup[] {
  const groups = getFamilyGroups().filter((g) => g.id !== groupId);
  saveFamilyGroups(groups);
  return groups;
}

export function renameGroup(groupId: string, name: string): FamilyGroup[] {
  const groups = getFamilyGroups();
  const group = groups.find((g) => g.id === groupId);
  if (group) {
    group.name = name;
    saveFamilyGroups(groups);
  }
  return groups;
}

export function setMemberRole(groupId: string, memberId: string, role: MemberRole): FamilyGroup[] {
  const groups = getFamilyGroups();
  const group = groups.find((g) => g.id === groupId);
  if (!group) return groups;
  if (memberId === group.ownerId && role !== 'admin') return groups;

  const member = group.members.find((m) => m.uid === memberId);
  if (member) {
    member.role = role;
    saveFamilyGroups(groups);
  }
  return groups;
}

export function promoteMemberToAdmin(groupId: string, memberId: string): FamilyGroup[] {
  return setMemberRole(groupId, memberId, 'admin');
}

export function demoteMemberFromAdmin(groupId: string, memberId: string): FamilyGroup[] {
  const groups = getFamilyGroups();
  const group = groups.find((g) => g.id === groupId);
  if (!group) return groups;
  if (memberId === group.ownerId) return groups;
  return setMemberRole(groupId, memberId, 'member');
}

/**
 * Simulate other members drifting slightly from their last known positions.
 */
export function simulateMemberUpdates(groups: FamilyGroup[]): FamilyGroup[] {
  return groups.map((group) => ({
    ...group,
    members: group.members.map((m) => {
      if (m.isSelf || m.visibility === 'not_sharing' || !m.location) return m;

      const drift = Math.random() > 0.3;
      const newLocation: MemberLocation = drift
        ? {
            lat: randomOffset(m.location.lat, 0.001),
            lng: randomOffset(m.location.lng, 0.001),
            accuracy: m.location.accuracy + (Math.random() - 0.5) * 10,
            timestamp: new Date().toISOString(),
          }
        : m.location;

      const batteryDrain = Math.random() > 0.7 ? 1 : 0;
      const newBattery: MemberBattery | null = m.battery
        ? {
            level: Math.max(0, m.battery.level - batteryDrain),
            charging: m.battery.charging,
            timestamp: new Date().toISOString(),
          }
        : null;

      return { ...m, location: newLocation, battery: newBattery };
    }),
  }));
}
