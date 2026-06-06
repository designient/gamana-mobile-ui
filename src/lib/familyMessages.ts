import type { FamilyMessage, FamilyMessageType } from '../types';
import { getSelfUid } from './familyDb';

const STORAGE_KEY = 'gamana_family_messages';

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3600000).toISOString();
}

function minutesAgo(min: number): string {
  return new Date(Date.now() - min * 60000).toISOString();
}

const SELF_UID = getSelfUid();

const SEED_MESSAGES: FamilyMessage[] = [
  {
    id: 'msg_001',
    groupId: 'grp_001',
    senderId: 'member_002',
    senderName: 'Priya Sharma',
    senderAvatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&fit=crop&crop=face',
    senderInitials: 'PS',
    senderColor: '#D97706',
    type: 'text',
    text: 'Has everyone reached the hotel? Let me know when you are settled.',
    createdAt: hoursAgo(3),
    readBy: [SELF_UID, 'member_002', 'member_003'],
  },
  {
    id: 'msg_002',
    groupId: 'grp_001',
    senderId: 'member_003',
    senderName: 'Arjun Reddy',
    senderAvatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop&crop=face',
    senderInitials: 'AR',
    senderColor: '#059669',
    type: 'text',
    text: 'Yes! Just checked in. The view from here is amazing.',
    createdAt: hoursAgo(2.8),
    readBy: [SELF_UID, 'member_002', 'member_003'],
  },
  {
    id: 'msg_003',
    groupId: 'grp_001',
    senderId: SELF_UID,
    senderName: 'You',
    senderAvatarUrl: null,
    senderInitials: 'YO',
    senderColor: '#1A5F7A',
    type: 'text',
    text: 'On my way! Traffic is a bit slow near MG Road.',
    createdAt: hoursAgo(2.5),
    readBy: [SELF_UID, 'member_002', 'member_003'],
  },
  {
    id: 'msg_004',
    groupId: 'grp_001',
    senderId: 'member_003',
    senderName: 'Arjun Reddy',
    senderAvatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop&crop=face',
    senderInitials: 'AR',
    senderColor: '#059669',
    type: 'location_ping',
    text: 'Shared their location',
    location: { lat: 12.9680, lng: 77.5910 },
    createdAt: hoursAgo(2.3),
    readBy: [SELF_UID, 'member_002', 'member_003'],
  },
  {
    id: 'msg_005',
    groupId: 'grp_001',
    senderId: 'system',
    senderName: 'System',
    senderAvatarUrl: null,
    senderInitials: 'SY',
    senderColor: '#6B7280',
    type: 'alert',
    text: "Meera's battery is critically low (12%). Last seen near Cubbon Park.",
    createdAt: hoursAgo(1),
    readBy: [SELF_UID],
  },
  {
    id: 'msg_006',
    groupId: 'grp_001',
    senderId: 'member_004',
    senderName: 'Meera Nair',
    senderAvatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=128&h=128&fit=crop&crop=face',
    senderInitials: 'MN',
    senderColor: '#DC2626',
    type: 'text',
    text: "Don't worry, found a charging spot at the cafe. Will be at the meeting point by 5.",
    createdAt: minutesAgo(45),
    readBy: [SELF_UID, 'member_004'],
  },
  {
    id: 'msg_007',
    groupId: 'grp_001',
    senderId: 'member_002',
    senderName: 'Priya Sharma',
    senderAvatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&fit=crop&crop=face',
    senderInitials: 'PS',
    senderColor: '#D97706',
    type: 'text',
    text: 'Perfect. Karthik, stay close to Arjun please!',
    createdAt: minutesAgo(30),
    readBy: ['member_002'],
  },
  {
    id: 'msg_008',
    groupId: 'grp_001',
    senderId: 'member_005',
    senderName: 'Karthik Iyer',
    senderAvatarUrl: null,
    senderInitials: 'KI',
    senderColor: '#7C3AED',
    type: 'text',
    text: 'Okay! We are at the ice cream shop right now 🍦',
    createdAt: minutesAgo(15),
    readBy: ['member_005'],
  },
];

function loadMessages(): FamilyMessage[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as FamilyMessage[];
    } catch { /* fall through */ }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_MESSAGES));
  return [...SEED_MESSAGES];
}

function saveMessages(messages: FamilyMessage[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

export function getGroupMessages(groupId: string): FamilyMessage[] {
  return loadMessages()
    .filter((m) => m.groupId === groupId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export function sendMessage(
  groupId: string,
  text: string,
  type: FamilyMessageType = 'text',
  location?: { lat: number; lng: number }
): FamilyMessage {
  const messages = loadMessages();
  const msg: FamilyMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    groupId,
    senderId: SELF_UID,
    senderName: 'You',
    senderAvatarUrl: null,
    senderInitials: 'YO',
    senderColor: '#1A5F7A',
    type,
    text,
    location,
    createdAt: new Date().toISOString(),
    readBy: [SELF_UID],
  };
  messages.push(msg);
  saveMessages(messages);
  return msg;
}

export function sendLocationPing(
  groupId: string,
  lat: number,
  lng: number
): FamilyMessage {
  return sendMessage(groupId, 'Shared their location', 'location_ping', { lat, lng });
}

export function sendSOSAlert(
  groupId: string,
  lat?: number,
  lng?: number,
): FamilyMessage {
  const location = lat !== undefined && lng !== undefined ? { lat, lng } : undefined;
  return sendMessage(
    groupId,
    'SOS Emergency: I need help! Please check on me.',
    'alert',
    location,
  );
}

export function markMessagesRead(groupId: string, uid: string): void {
  const messages = loadMessages();
  let changed = false;
  messages.forEach((m) => {
    if (m.groupId === groupId && !m.readBy.includes(uid)) {
      m.readBy.push(uid);
      changed = true;
    }
  });
  if (changed) saveMessages(messages);
}

export function getUnreadCount(groupId: string, uid: string): number {
  return loadMessages().filter(
    (m) => m.groupId === groupId && !m.readBy.includes(uid)
  ).length;
}

const RANDOM_REPLIES = [
  "Sounds good, see you there!",
  "Okay, let me check the map.",
  "I'll start walking over now.",
  "Wait for me, almost there!",
  "Can someone share their location?",
  "Taking a short break, will catch up soon.",
  "The weather is so nice today!",
  "Has anyone tried the local food yet?",
];

const SIMULATED_SENDERS = [
  {
    uid: 'member_002',
    name: 'Priya Sharma',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&fit=crop&crop=face',
    initials: 'PS',
    color: '#D97706',
  },
  {
    uid: 'member_003',
    name: 'Arjun Reddy',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop&crop=face',
    initials: 'AR',
    color: '#059669',
  },
  {
    uid: 'member_004',
    name: 'Meera Nair',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=128&h=128&fit=crop&crop=face',
    initials: 'MN',
    color: '#DC2626',
  },
];

export function generateSimulatedMessage(groupId: string): FamilyMessage {
  const sender = SIMULATED_SENDERS[Math.floor(Math.random() * SIMULATED_SENDERS.length)];
  const text = RANDOM_REPLIES[Math.floor(Math.random() * RANDOM_REPLIES.length)];
  const messages = loadMessages();
  const msg: FamilyMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    groupId,
    senderId: sender.uid,
    senderName: sender.name,
    senderAvatarUrl: sender.avatarUrl,
    senderInitials: sender.initials,
    senderColor: sender.color,
    type: 'text',
    text,
    createdAt: new Date().toISOString(),
    readBy: [sender.uid],
  };
  messages.push(msg);
  saveMessages(messages);
  return msg;
}
