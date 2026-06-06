import { useState } from 'react';
import { X, LogIn, Users, Check, AlertCircle } from 'lucide-react';

interface JoinGroupSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function JoinGroupSheet({ isOpen, onClose }: JoinGroupSheetProps) {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'joining' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const formatCode = (value: string) => {
    // Allow only alphanumeric and dashes
    const clean = value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    return clean.slice(0, 9); // GMNA-XXXX format
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCode(e.target.value);
    setCode(formatted);
    if (status === 'error') setStatus('idle');
  };

  const handleJoin = () => {
    const trimmed = code.trim();
    if (!trimmed) return;

    setStatus('joining');

    // Simulate join attempt
    setTimeout(() => {
      if (trimmed.startsWith('GMNA-')) {
        setStatus('success');
        setTimeout(() => {
          setCode('');
          setStatus('idle');
          onClose();
        }, 1500);
      } else {
        setStatus('error');
        setErrorMsg('Invalid invite code. Please check and try again.');
      }
    }, 1200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleJoin();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-[402px] bg-surface rounded-t-3xl animate-slide-up" onClick={(e) => e.stopPropagation()}>
        {/* Gradient accent bar */}
        <div className="h-1 rounded-t-3xl bg-gradient-to-r from-blue-400 via-gamana-400 to-purple-400" />

        <div className="p-6 pb-8">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <LogIn size={20} className="text-blue-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-heading">Join a Group</h2>
                <p className="text-[11px] text-muted">Enter the invite code shared with you</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-surface-muted transition-colors">
              <X size={20} className="text-muted" />
            </button>
          </div>

          {status === 'success' ? (
            <div className="flex flex-col items-center py-8 animate-scale-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                <Check size={32} className="text-emerald-500" />
              </div>
              <h3 className="text-base font-bold text-heading mb-1">Joined Successfully!</h3>
              <p className="text-sm text-secondary">You've been added to the group.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <label className="block text-sm font-medium text-heading mb-2">
                Invite Code
              </label>
              <div className="relative mb-3">
                <input
                  type="text"
                  value={code}
                  onChange={handleCodeChange}
                  placeholder="GMNA-XXXX"
                  maxLength={9}
                  autoFocus
                  className={`w-full px-4 py-3.5 rounded-xl border text-center text-lg font-bold tracking-[0.3em] font-mono placeholder:text-muted placeholder:tracking-[0.3em] placeholder:font-normal focus:outline-none focus:ring-2 transition-all ${
                    status === 'error'
                      ? 'border-red-300 focus:ring-red-400 bg-red-50/50 dark:bg-red-900/10'
                      : 'border-border-default focus:ring-gamana-400 bg-surface'
                  }`}
                />
                {status === 'error' && (
                  <div className="flex items-center gap-1.5 mt-2 px-1">
                    <AlertCircle size={12} className="text-red-500 flex-shrink-0" />
                    <p className="text-xs text-red-500">{errorMsg}</p>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-muted mb-5 text-center">
                Ask the group admin for the invite code. It looks like <span className="font-mono font-semibold text-secondary">GMNA-XXXX</span>
              </p>

              <button
                type="submit"
                disabled={!code.trim() || status === 'joining'}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                  status === 'joining'
                    ? 'bg-gamana-400 text-white/80'
                    : 'bg-gamana-500 text-white hover:bg-gamana-600 disabled:opacity-40 disabled:cursor-not-allowed'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  {status === 'joining' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      <Users size={16} />
                      Join Group
                    </>
                  )}
                </span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
