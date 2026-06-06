import { useState, useEffect, useCallback, useRef } from 'react';
import type { FamilyMessage } from '../types';
import {
  getGroupMessages,
  sendMessage as dbSendMessage,
  sendLocationPing as dbSendLocationPing,
  markMessagesRead,
  getUnreadCount,
  generateSimulatedMessage,
} from '../lib/familyMessages';
import { getSelfUid } from '../lib/familyDb';

const SIMULATE_MIN_MS = 15000;
const SIMULATE_MAX_MS = 30000;

export function useFamilyMessages(groupId: string | null) {
  const [messages, setMessages] = useState<FamilyMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const selfUid = getSelfUid();
  const simulateRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isChatOpenRef = useRef(false);

  const refresh = useCallback(() => {
    if (!groupId) {
      setMessages([]);
      setUnreadCount(0);
      return;
    }
    setMessages(getGroupMessages(groupId));
    setUnreadCount(getUnreadCount(groupId, selfUid));
  }, [groupId, selfUid]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const sendTextMessage = useCallback(
    (text: string) => {
      if (!groupId || !text.trim()) return;
      dbSendMessage(groupId, text.trim());
      refresh();
    },
    [groupId, refresh]
  );

  const sendLocationPing = useCallback(
    (lat: number, lng: number) => {
      if (!groupId) return;
      dbSendLocationPing(groupId, lat, lng);
      refresh();
    },
    [groupId, refresh]
  );

  const markAsRead = useCallback(() => {
    if (!groupId) return;
    markMessagesRead(groupId, selfUid);
    setUnreadCount(0);
  }, [groupId, selfUid]);

  const setChatOpen = useCallback(
    (open: boolean) => {
      isChatOpenRef.current = open;
      if (open) {
        markAsRead();
      }
    },
    [markAsRead]
  );

  // Simulate incoming messages while chat is open
  useEffect(() => {
    if (!groupId) return;

    const scheduleNext = () => {
      const delay = SIMULATE_MIN_MS + Math.random() * (SIMULATE_MAX_MS - SIMULATE_MIN_MS);
      simulateRef.current = setTimeout(() => {
        if (isChatOpenRef.current && groupId) {
          generateSimulatedMessage(groupId);
          refresh();
          if (isChatOpenRef.current) markAsRead();
        }
        scheduleNext();
      }, delay);
    };

    scheduleNext();
    return () => {
      if (simulateRef.current) clearTimeout(simulateRef.current);
    };
  }, [groupId, refresh, markAsRead]);

  // Periodic refresh for unread counts even when chat is closed
  useEffect(() => {
    if (!groupId) return;
    const interval = setInterval(() => {
      if (!isChatOpenRef.current) {
        setUnreadCount(getUnreadCount(groupId, selfUid));
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [groupId, selfUid]);

  return {
    messages,
    unreadCount,
    sendTextMessage,
    sendLocationPing,
    markAsRead,
    setChatOpen,
    refresh,
  };
}
