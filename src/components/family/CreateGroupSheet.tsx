import { useState } from 'react';
import { X, Users, ChevronRight, Sparkles } from 'lucide-react';

interface CreateGroupSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

const GROUP_EMOJIS = ['👨‍👩‍👧‍👦', '🏠', '✈️', '🌍', '🎯', '🛡️', '💙', '🌸', '⭐', '🔥', '🎒', '🚗'];

export default function CreateGroupSheet({ isOpen, onClose, onCreate }: CreateGroupSheetProps) {
  const [name, setName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('👨‍👩‍👧‍👦');
  const [step, setStep] = useState<1 | 2>(1);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreate(trimmed);
    setName('');
    setSelectedEmoji('👨‍👩‍👧‍👦');
    setStep(1);
    onClose();
  };

  const handleClose = () => {
    setName('');
    setSelectedEmoji('👨‍👩‍👧‍👦');
    setStep(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center animate-fade-in" onClick={handleClose}>
      <div className="w-full max-w-[402px] bg-surface rounded-t-3xl animate-slide-up" onClick={(e) => e.stopPropagation()}>
        {/* Gradient accent bar */}
        <div className="h-1 rounded-t-3xl bg-gradient-to-r from-gamana-400 via-emerald-400 to-amber-400" />

        <div className="p-6 pb-8">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gamana-50 dark:bg-gamana-900/20 flex items-center justify-center text-xl">
                {selectedEmoji}
              </div>
              <div>
                <h2 className="text-lg font-bold text-heading">New Family Group</h2>
                <p className="text-[11px] text-muted">Step {step} of 2</p>
              </div>
            </div>
            <button onClick={handleClose} className="p-1.5 rounded-full hover:bg-surface-muted transition-colors">
              <X size={20} className="text-muted" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="flex gap-1.5 mb-5">
            <div className="flex-1 h-1 rounded-full bg-gamana-500" />
            <div className={`flex-1 h-1 rounded-full transition-colors duration-300 ${step === 2 ? 'bg-gamana-500' : 'bg-surface-muted'}`} />
          </div>

          {step === 1 ? (
            <div className="animate-fade-in">
              <label className="block text-sm font-medium text-heading mb-2">
                Choose a group icon
              </label>
              <div className="grid grid-cols-6 gap-2 mb-5">
                {GROUP_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setSelectedEmoji(emoji)}
                    className={`w-full aspect-square rounded-xl text-xl flex items-center justify-center transition-all ${
                      selectedEmoji === emoji
                        ? 'bg-gamana-50 dark:bg-gamana-900/20 ring-2 ring-gamana-400 scale-110'
                        : 'bg-surface-alt hover:bg-surface-muted border border-border-subtle'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gamana-500 text-white font-semibold text-sm hover:bg-gamana-600 transition-all"
              >
                Continue
                <ChevronRight size={16} />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="animate-fade-in">
              <label className="block text-sm font-medium text-heading mb-2">
                Group name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Sharma Family, Travel Squad"
                maxLength={40}
                autoFocus
                className="w-full px-4 py-3 rounded-xl border border-border-default text-sm text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-gamana-400 focus:border-transparent transition-shadow bg-surface"
              />
              <p className="text-[11px] text-muted mt-1.5 mb-3">
                Groups are limited to 10 members. You can rename the group later.
              </p>

              {/* Preview card */}
              {name.trim() && (
                <div className="mb-5 p-3.5 rounded-2xl bg-surface-alt border border-border-subtle animate-fade-in">
                  <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-2">Preview</p>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gamana-50 dark:bg-gamana-900/20 flex items-center justify-center text-lg">
                      {selectedEmoji}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-heading">{name.trim()}</h4>
                      <p className="text-[11px] text-muted">1 member · You (Admin)</p>
                    </div>
                    <ChevronRight size={16} className="text-faint" />
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-3 rounded-xl bg-surface-muted text-secondary font-medium text-sm hover:bg-surface-alt transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gamana-500 text-white font-semibold text-sm hover:bg-gamana-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <Sparkles size={16} />
                  Create Group
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
