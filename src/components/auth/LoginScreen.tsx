import { useState, useCallback, useEffect } from 'react';
import { ArrowLeft, Phone, Mail, Loader2 } from 'lucide-react';
import { requestOtp, verifyOtp } from '../../lib/auth';
import { useAuth } from '../../hooks/useAuth';
import StatusBar from '../layout/StatusBar';

interface LoginScreenProps {
  onBack: () => void;
  onLoginSuccess: () => void;
}

type LoginStep = 'identifier' | 'otp';

export default function LoginScreen({ onBack, onLoginSuccess }: LoginScreenProps) {
  const { login } = useAuth();
  const [step, setStep] = useState<LoginStep>('identifier');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'phone' | 'email'>('phone');

  useEffect(() => {
    console.info('login_screen_viewed', { timestamp: Date.now() });
  }, []);

  const handleRequestOtp = useCallback(async () => {
    if (!identifier.trim()) {
      setError(mode === 'phone' ? 'Please enter your phone number' : 'Please enter your email');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await requestOtp(identifier.trim());
      if (result.success) {
        setStep('otp');
      } else {
        setError(result.error ?? 'Failed to send OTP');
      }
    } catch {
      setError('Unable to connect. Check your network.');
    } finally {
      setIsLoading(false);
    }
  }, [identifier, mode]);

  const handleVerifyOtp = useCallback(async () => {
    if (!otp.trim()) {
      setError('Please enter the OTP');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await verifyOtp(identifier.trim(), otp.trim());
      if (result.session) {
        login(result.session);
        onLoginSuccess();
      } else {
        setError(result.error ?? 'Verification failed');
      }
    } catch {
      setError('Unable to connect. Check your network.');
    } finally {
      setIsLoading(false);
    }
  }, [identifier, otp, login, onLoginSuccess]);

  return (
    <div className="flex flex-col h-full bg-canvas">
      <StatusBar />

      <div className="px-5 pt-2 pb-4">
        <button
          onClick={step === 'otp' ? () => { setStep('identifier'); setOtp(''); setError(null); } : onBack}
          className="p-2 -ml-2 rounded-xl hover:bg-surface-muted transition-colors"
        >
          <ArrowLeft size={20} className="text-heading" />
        </button>
      </div>

      <div className="flex-1 px-6">
        {step === 'identifier' ? (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-semibold text-heading mb-2">
              Log in to Gamana
            </h1>
            <p className="text-sm text-muted mb-8">
              {mode === 'phone'
                ? 'Enter your phone number to receive a verification code'
                : 'Enter your email to receive a verification code'}
            </p>

            <div className="flex gap-2 mb-6">
              <button
                onClick={() => { setMode('phone'); setIdentifier(''); setError(null); }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  mode === 'phone'
                    ? 'bg-gamana-500 text-white'
                    : 'bg-surface-muted text-secondary'
                }`}
              >
                <Phone size={14} />
                Phone
              </button>
              <button
                onClick={() => { setMode('email'); setIdentifier(''); setError(null); }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  mode === 'email'
                    ? 'bg-gamana-500 text-white'
                    : 'bg-surface-muted text-secondary'
                }`}
              >
                <Mail size={14} />
                Email
              </button>
            </div>

            <input
              type={mode === 'phone' ? 'tel' : 'email'}
              value={identifier}
              onChange={(e) => { setIdentifier(e.target.value); setError(null); }}
              placeholder={mode === 'phone' ? '+91 98765 43210' : 'you@example.com'}
              className="w-full px-4 py-3.5 rounded-xl border border-border-default text-sm text-heading placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-gamana-200 focus:border-gamana-300 transition-all"
              autoFocus
            />

            {error && (
              <p className="text-xs text-red-500 mt-2">{error}</p>
            )}
          </div>
        ) : (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-semibold text-heading mb-2">
              Enter verification code
            </h1>
            <p className="text-sm text-muted mb-8">
              We sent a 4-digit code to <span className="text-body font-medium">{identifier}</span>
            </p>

            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={otp}
              onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); setError(null); }}
              placeholder="0000"
              className="w-full px-4 py-3.5 rounded-xl border border-border-default text-center text-2xl font-semibold text-heading tracking-[0.5em] placeholder:text-faint placeholder:tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-gamana-200 focus:border-gamana-300 transition-all"
              autoFocus
            />

            {error && (
              <p className="text-xs text-red-500 mt-2">{error}</p>
            )}

            <button
              onClick={() => { setOtp(''); requestOtp(identifier); }}
              className="mt-4 text-xs text-gamana-500 font-medium"
            >
              Resend code
            </button>
          </div>
        )}
      </div>

      <div className="px-6 pb-10">
        <button
          onClick={step === 'identifier' ? handleRequestOtp : handleVerifyOtp}
          disabled={isLoading}
          className="w-full py-3.5 rounded-2xl bg-gamana-500 text-white text-sm font-semibold shadow-md hover:bg-gamana-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
        >
          {isLoading && <Loader2 size={16} className="animate-spin" />}
          {step === 'identifier' ? 'Send Code' : 'Verify & Log In'}
        </button>

        {step === 'identifier' && (
          <button
            onClick={onBack}
            className="w-full mt-3 py-3 text-sm text-muted font-medium"
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}
