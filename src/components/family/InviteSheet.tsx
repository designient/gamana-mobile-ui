import { useState } from 'react';
import { X, Copy, Check, QrCode, Share2, MessageSquare, Send } from 'lucide-react';

interface InviteSheetProps {
  isOpen: boolean;
  groupName: string;
  inviteCode: string;
  onClose: () => void;
}

export default function InviteSheet({ isOpen, groupName, inviteCode, onClose }: InviteSheetProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const inviteLink = `https://gamana.app/family/join/${inviteCode}`;
  const inviteMessage = `Join my family group "${groupName}" on Gamana for live location sharing! Use code: ${inviteCode} or tap: ${inviteLink}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard not available in some contexts */
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${groupName} on Gamana`,
          text: `Join my family group "${groupName}" on Gamana for live location sharing!`,
          url: inviteLink,
        });
      } catch {
        /* user cancelled share */
      }
    } else {
      handleCopy();
    }
  };

  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(inviteMessage)}`;
    window.open(url, '_blank');
  };

  const handleSMS = () => {
    const url = `sms:?body=${encodeURIComponent(inviteMessage)}`;
    window.location.href = url;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-[402px] bg-surface rounded-t-3xl animate-slide-up" onClick={(e) => e.stopPropagation()}>
        {/* Gradient accent bar */}
        <div className="h-1 rounded-t-3xl bg-gradient-to-r from-gamana-400 via-blue-400 to-purple-400" />

        <div className="p-6 pb-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-heading">Invite Members</h2>
              <p className="text-[11px] text-muted mt-0.5">
                Share the code to invite people to <span className="font-semibold text-heading">{groupName}</span>
              </p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-surface-muted transition-colors">
              <X size={20} className="text-muted" />
            </button>
          </div>

          {/* QR-style code display */}
          <div className="relative flex flex-col items-center py-7 px-4 rounded-2xl bg-gradient-to-b from-surface-alt to-surface border border-border-default mb-5 overflow-hidden">
            {/* Decorative background pattern */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
              backgroundSize: '16px 16px',
            }} />

            <div className="relative w-16 h-16 rounded-2xl bg-gamana-50 dark:bg-gamana-900/20 flex items-center justify-center mb-4 border border-gamana-100 dark:border-gamana-800">
              <QrCode size={32} className="text-gamana-500" />
            </div>
            <p className="text-2xl font-bold text-heading tracking-[0.25em] font-mono relative">
              {inviteCode}
            </p>
            <p className="text-[11px] text-muted mt-1.5">Invite Code</p>

            {/* Copy badge */}
            <button
              onClick={handleCopy}
              className={`mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                copied
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
                  : 'bg-surface-muted hover:bg-surface text-secondary border border-border-subtle'
              }`}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied!' : 'Tap to copy code'}
            </button>
          </div>

          {/* Invite link */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-surface-alt border border-border-subtle mb-5">
            <span className="flex-1 text-xs text-secondary truncate font-mono">{inviteLink}</span>
            <button
              onClick={handleCopy}
              className={`flex-shrink-0 p-2 rounded-lg transition-all ${
                copied ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-surface border border-border-default hover:bg-surface-alt'
              }`}
            >
              {copied ? (
                <Check size={14} className="text-emerald-500" />
              ) : (
                <Copy size={14} className="text-secondary" />
              )}
            </button>
          </div>

          {/* Quick share buttons */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <button
              onClick={handleWhatsApp}
              className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 transition-colors border border-emerald-100 dark:border-emerald-800"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                <MessageSquare size={16} className="text-white" />
              </div>
              <span className="text-[10px] font-semibold text-emerald-700">WhatsApp</span>
            </button>
            <button
              onClick={handleSMS}
              className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 transition-colors border border-blue-100 dark:border-blue-800"
            >
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <Send size={16} className="text-white" />
              </div>
              <span className="text-[10px] font-semibold text-blue-700">SMS</span>
            </button>
            <button
              onClick={handleShare}
              className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-gamana-50 dark:bg-gamana-900/20 hover:bg-gamana-100 transition-colors border border-gamana-100 dark:border-gamana-800"
            >
              <div className="w-8 h-8 rounded-full bg-gamana-500 flex items-center justify-center">
                <Share2 size={16} className="text-white" />
              </div>
              <span className="text-[10px] font-semibold text-gamana-700">Share</span>
            </button>
          </div>

          <p className="text-[10px] text-muted text-center leading-relaxed">
            Anyone with this code can join your group. You can remove members anytime from group settings.
          </p>
        </div>
      </div>
    </div>
  );
}
