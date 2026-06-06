import { useState, useCallback, useEffect } from 'react';
import { Building2, ArrowRight, ArrowLeft, Phone, Mail, Loader2, CheckCircle2 } from 'lucide-react';
import { requestOtp, verifyOtp, fetchOrgMemberships, fetchOrgConfig } from '../../lib/auth';
import { useAuth } from '../../hooks/useAuth';
import { useOrgContext } from '../../hooks/useOrgContext';
import type { OrgMembership } from '../../types';

interface LoginStepProps {
  onNext: (skipped: boolean) => void;
}

type SubStep = 'prompt' | 'identifier' | 'otp' | 'org_select' | 'success';

export default function LoginStep({ onNext }: LoginStepProps) {
  const { login } = useAuth();
  const { selectOrg, setMemberships, updateConfig } = useOrgContext();

  const [subStep, setSubStep] = useState<SubStep>('prompt');
  const [mode, setMode] = useState<'phone' | 'email'>('phone');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [memberships, setLocalMemberships] = useState<OrgMembership[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  useEffect(() => {
    console.info('onboarding_login_step_viewed', { timestamp: Date.now() });
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
        setSubStep('otp');
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

        const orgs = await fetchOrgMemberships(result.session.userId);
        setMemberships(orgs);
        setLocalMemberships(orgs);

        if (orgs.length === 0) {
          setSubStep('success');
          setTimeout(() => onNext(false), 1200);
        } else if (orgs.length === 1 && orgs[0].status === 'active') {
          selectOrg(orgs[0].orgId);
          const config = await fetchOrgConfig(orgs[0].orgId);
          updateConfig(config);
          setSelectedOrgId(orgs[0].orgId);
          setSubStep('success');
          setTimeout(() => onNext(false), 1200);
        } else {
          setSubStep('org_select');
        }
      } else {
        setError(result.error ?? 'Verification failed');
      }
    } catch {
      setError('Unable to connect. Check your network.');
    } finally {
      setIsLoading(false);
    }
  }, [identifier, otp, login, onNext, setMemberships, selectOrg, updateConfig]);

  const handleOrgSelect = useCallback(async (orgId: string) => {
    setIsLoading(true);
    selectOrg(orgId);
    const config = await fetchOrgConfig(orgId);
    updateConfig(config);
    setSelectedOrgId(orgId);
    setIsLoading(false);
    setSubStep('success');
    setTimeout(() => onNext(false), 1200);
  }, [selectOrg, updateConfig, onNext]);

  const handleBack = useCallback(() => {
    setError(null);
    if (subStep === 'otp') {
      setSubStep('identifier');
      setOtp('');
    } else if (subStep === 'identifier') {
      setSubStep('prompt');
      setIdentifier('');
    }
  }, [subStep]);

  // Prompt screen
  if (subStep === 'prompt') {
    return (
      <div className="flex flex-col h-full bg-canvas animate-fade-in">
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <div className="w-16 h-16 rounded-full bg-gamana-100 dark:bg-gamana-900/30 flex items-center justify-center mb-6">
            <Building2 size={28} className="text-gamana-500" />
          </div>
          <h1 className="text-xl font-semibold text-heading text-center mb-2">
            Part of an organization?
          </h1>
          <p className="text-sm text-muted text-center leading-relaxed max-w-[280px] mb-10">
            Log in to access your organization's curated stories, narrators, and special content.
          </p>
          <button
            onClick={() => setSubStep('identifier')}
            className="w-full max-w-[280px] py-3.5 rounded-2xl bg-gamana-500 text-white text-sm font-semibold shadow-md hover:bg-gamana-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            Log in to organization
            <ArrowRight size={16} />
          </button>
        </div>
        <div className="px-6 pb-10">
          <button onClick={() => onNext(true)} className="w-full py-3 text-sm text-muted font-medium">
            Skip for now
          </button>
        </div>
      </div>
    );
  }

  // Success screen
  if (subStep === 'success') {
    const orgName = memberships.find((m) => m.orgId === selectedOrgId)?.orgName;
    return (
      <div className="flex flex-col h-full bg-canvas animate-fade-in">
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <div className="w-16 h-16 rounded-full bg-gamana-50 dark:bg-gamana-900/20 flex items-center justify-center mb-4">
            <CheckCircle2 size={32} className="text-gamana-500" />
          </div>
          <h2 className="text-lg font-semibold text-heading mb-1">You're logged in</h2>
          {orgName && (
            <p className="text-sm text-muted">{orgName}</p>
          )}
        </div>
      </div>
    );
  }

  // Org selector screen
  if (subStep === 'org_select') {
    const activeOrgs = memberships.filter((m) => m.status === 'active');
    return (
      <div className="flex flex-col h-full bg-canvas animate-fade-in">
        <div className="px-5 pt-6 pb-4">
          <h1 className="text-xl font-semibold text-heading mb-1">Choose your organization</h1>
          <p className="text-sm text-muted">Select which organization to use with Gamana</p>
        </div>
        <div className="flex-1 overflow-y-auto px-5 pb-4">
          <div className="space-y-2">
            {activeOrgs.map((org) => (
              <button
                key={org.orgId}
                onClick={() => handleOrgSelect(org.orgId)}
                disabled={isLoading}
                className="w-full flex items-center gap-3 p-4 rounded-xl border border-border-default hover:border-gamana-200 hover:bg-gamana-50/50 dark:hover:bg-gamana-900/10 transition-all disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-full bg-gamana-100 dark:bg-gamana-900/30 flex items-center justify-center flex-shrink-0">
                  <Building2 size={18} className="text-gamana-500" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-heading">{org.orgName}</p>
                  <p className="text-xs text-muted">Active</p>
                </div>
                <ArrowRight size={16} className="text-faint" />
              </button>
            ))}
          </div>
        </div>
        <div className="px-6 pb-10">
          <button
            onClick={() => { setSubStep('success'); setTimeout(() => onNext(false), 1200); }}
            className="w-full py-3 text-sm text-muted font-medium"
          >
            Continue without organization
          </button>
        </div>
      </div>
    );
  }

  // Identifier + OTP screens
  return (
    <div className="flex flex-col h-full bg-canvas animate-fade-in">
      <div className="px-5 pt-6 pb-4">
        <button onClick={handleBack} className="p-2 -ml-2 rounded-xl hover:bg-surface-muted transition-colors">
          <ArrowLeft size={20} className="text-heading" />
        </button>
      </div>

      <div className="flex-1 px-6">
        {subStep === 'identifier' ? (
          <div className="animate-fade-in">
            <h1 className="text-xl font-semibold text-heading mb-2">
              Log in to your organization
            </h1>
            <p className="text-sm text-muted mb-6">
              {mode === 'phone'
                ? 'Enter your phone number to receive a verification code'
                : 'Enter your email to receive a verification code'}
            </p>

            <div className="flex gap-2 mb-5">
              <button
                onClick={() => { setMode('phone'); setIdentifier(''); setError(null); }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  mode === 'phone' ? 'bg-gamana-500 text-white' : 'bg-surface-muted text-secondary'
                }`}
              >
                <Phone size={14} /> Phone
              </button>
              <button
                onClick={() => { setMode('email'); setIdentifier(''); setError(null); }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  mode === 'email' ? 'bg-gamana-500 text-white' : 'bg-surface-muted text-secondary'
                }`}
              >
                <Mail size={14} /> Email
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
            {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
          </div>
        ) : (
          <div className="animate-fade-in">
            <h1 className="text-xl font-semibold text-heading mb-2">
              Enter verification code
            </h1>
            <p className="text-sm text-muted mb-6">
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
            {error && <p className="text-xs text-red-500 mt-2">{error}</p>}

            <button
              onClick={() => { setOtp(''); requestOtp(identifier); }}
              className="mt-3 text-xs text-gamana-500 font-medium"
            >
              Resend code
            </button>
          </div>
        )}
      </div>

      <div className="px-6 pb-10">
        <button
          onClick={subStep === 'identifier' ? handleRequestOtp : handleVerifyOtp}
          disabled={isLoading}
          className="w-full py-3.5 rounded-2xl bg-gamana-500 text-white text-sm font-semibold shadow-md hover:bg-gamana-600 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading && <Loader2 size={16} className="animate-spin" />}
          {subStep === 'identifier' ? 'Send Code' : 'Verify & Log In'}
        </button>
      </div>
    </div>
  );
}
