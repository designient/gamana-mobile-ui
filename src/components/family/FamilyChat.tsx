import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, MapPin, Lock } from 'lucide-react';
import type { FamilyGroup, FamilyMessage } from '../../types';
import { isChild } from '../../types';
import { useFamilyMessages } from '../../hooks/useFamilyMessages';
import { getSelfUid } from '../../lib/familyDb';
import MessageBubble from './MessageBubble';

interface FamilyChatProps {
  group: FamilyGroup;
  onBack: () => void;
  initialMention?: string | null;
}

function formatDayLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function shouldShowDayDivider(current: FamilyMessage, prev: FamilyMessage | null): boolean {
  if (!prev) return true;
  const curDay = new Date(current.createdAt).toDateString();
  const prevDay = new Date(prev.createdAt).toDateString();
  return curDay !== prevDay;
}

function shouldShowSender(current: FamilyMessage, prev: FamilyMessage | null): boolean {
  if (!prev) return true;
  if (prev.senderId !== current.senderId) return true;
  if (prev.type === 'system' || prev.type === 'alert') return true;
  const gap = new Date(current.createdAt).getTime() - new Date(prev.createdAt).getTime();
  return gap > 120000;
}

function shouldShowTimestamp(current: FamilyMessage, next: FamilyMessage | null): boolean {
  if (!next) return true;
  if (next.senderId !== current.senderId) return true;
  const gap = new Date(next.createdAt).getTime() - new Date(current.createdAt).getTime();
  return gap > 120000;
}

export default function FamilyChat({ group, onBack, initialMention }: FamilyChatProps) {
  const selfUid = getSelfUid();
  const selfMember = group.members.find((m) => m.isSelf);
  const selfIsChild = selfMember ? isChild(selfMember) : false;
  const {
    messages,
    sendTextMessage,
    sendLocationPing,
    setChatOpen,
  } = useFamilyMessages(group.id);

  const [input, setInput] = useState(initialMention ? `@${initialMention} ` : '');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevMsgCountRef = useRef(messages.length);

  useEffect(() => {
    setChatOpen(true);
    return () => setChatOpen(false);
  }, [setChatOpen]);

  useEffect(() => {
    if (initialMention && inputRef.current) {
      inputRef.current.focus();
    }
  }, [initialMention]);

  useEffect(() => {
    if (scrollRef.current) {
      const isNewMessage = messages.length > prevMsgCountRef.current;
      prevMsgCountRef.current = messages.length;
      if (isNewMessage) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }
  }, [messages.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    sendTextMessage(text);
    setInput('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleLocationPing = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        sendLocationPing(pos.coords.latitude, pos.coords.longitude);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-3 bg-surface border-b border-border-default z-10">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg hover:bg-surface-muted transition-colors"
        >
          <ArrowLeft size={20} className="text-secondary" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold text-heading truncate">{group.name}</h1>
          <p className="text-[11px] text-secondary">{group.members.length} members</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-sm text-muted">No messages yet</p>
            <p className="text-xs text-faint mt-1">Send a message to your family group</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const prev = i > 0 ? messages[i - 1] : null;
            const next = i < messages.length - 1 ? messages[i + 1] : null;
            const isOutgoing = msg.senderId === selfUid;
            const showDay = shouldShowDayDivider(msg, prev);
            const showSender = !isOutgoing && shouldShowSender(msg, prev);
            const showTime = shouldShowTimestamp(msg, next);

            return (
              <div key={msg.id}>
                {showDay && (
                  <div className="flex justify-center my-4">
                    <span className="text-[10px] font-medium text-muted bg-surface-alt px-3 py-1 rounded-full">
                      {formatDayLabel(msg.createdAt)}
                    </span>
                  </div>
                )}
                <MessageBubble
                  message={msg}
                  isOutgoing={isOutgoing}
                  showSender={showSender}
                  showTimestamp={showTime}
                />
              </div>
            );
          })
        )}
      </div>

      {/* Compose bar */}
      <div className="border-t border-border-default bg-surface px-3 py-3 pb-6">
        {selfIsChild ? (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800">
            <Lock size={14} className="text-purple-400 flex-shrink-0" />
            <p className="text-xs text-purple-600">
              Messaging is available but monitored by family admins.
            </p>
          </div>
        ) : null}
        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={handleLocationPing}
            className="p-2.5 rounded-xl bg-surface-alt hover:bg-surface-muted transition-colors flex-shrink-0"
            title="Share your location"
          >
            <MapPin size={18} className="text-secondary" />
          </button>
          <div className="flex-1 flex items-center bg-surface-alt rounded-xl border border-border-default focus-within:ring-2 focus-within:ring-gamana-400 focus-within:border-transparent transition-shadow">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 bg-transparent px-3 py-2.5 text-sm text-gray-900 placeholder:text-muted focus:outline-none"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-2.5 rounded-xl bg-gamana-500 text-white hover:bg-gamana-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex-shrink-0"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
