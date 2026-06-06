import { useState, useEffect } from 'react';
import { ArrowLeft, ExternalLink, RefreshCw, WifiOff, AlertCircle } from 'lucide-react';
import { getExperienceBySlugSync, postBookingEvent } from '../../lib/experience-mock-api';
import { recordExperienceBooking } from '../../lib/experience-bookings';
import { trackExperienceEvent } from '../../lib/experience-analytics';
import { useConnectivity } from '../../hooks/useConnectivity';
import StatusBar from '../layout/StatusBar';

type WebViewState = 'offline' | 'load_failed' | 'exited';

type ViewPhase = 'loading' | 'active' | 'processing';

export interface BookingWebViewResult {
  success: boolean;
  reason?: 'sold_out' | 'payment_error';
}

interface BookingWebViewScreenProps {
  experienceId: string;
  slug: string;
  bookingUrl: string;
  operatorName: string;
  onBack: () => void;
  onDone: (result: BookingWebViewResult) => void;
}

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="h-1 bg-gamana-100">
      <div
        className="h-full bg-gamana-500 transition-all duration-500 ease-out"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex-1 px-4 py-6 space-y-4 animate-pulse">
      <div className="h-8 rounded-lg bg-gamana-500/10 w-3/4" />
      <div className="h-4 rounded-lg bg-gamana-500/10 w-1/2" />
      <div className="h-32 rounded-xl bg-gamana-500/10" />
      <div className="h-4 rounded-lg bg-gamana-500/10 w-full" />
      <div className="h-4 rounded-lg bg-gamana-500/10 w-5/6" />
      <div className="h-12 rounded-xl bg-gamana-500/10 w-full mt-4" />
    </div>
  );
}

export default function BookingWebViewScreen({
  experienceId,
  slug,
  bookingUrl,
  operatorName,
  onBack,
  onDone,
}: BookingWebViewScreenProps) {
  const { isOnline } = useConnectivity();
  const [state, setState] = useState<WebViewState | null>(null);
  const [phase, setPhase] = useState<ViewPhase>('loading');
  const [simulateFail, setSimulateFail] = useState(false);

  useEffect(() => {
    trackExperienceEvent('booking_webview_opened', { experienceId });
    postBookingEvent({
      experienceId,
      eventType: 'webview_opened',
      timestamp: new Date().toISOString(),
    });
  }, [experienceId]);

  useEffect(() => {
    if (!isOnline) {
      setState('offline');
      return;
    }
    if (simulateFail) {
      setState('load_failed');
      return;
    }
    setState(null);
    setPhase('loading');
    const t = setTimeout(() => setPhase('active'), 1500);
    return () => clearTimeout(t);
  }, [isOnline, simulateFail, bookingUrl]);

  function handleExit() {
    trackExperienceEvent('booking_abandoned', { experienceId });
    postBookingEvent({
      experienceId,
      eventType: 'abandoned',
      timestamp: new Date().toISOString(),
    });
    setState('exited');
    onBack();
  }

  function recordConfirmation() {
    trackExperienceEvent('booking_confirmed', { experienceId });
    postBookingEvent({
      experienceId,
      eventType: 'confirmed',
      timestamp: new Date().toISOString(),
    });
    const exp = getExperienceBySlugSync(slug);
    if (exp) {
      recordExperienceBooking({
        experienceId: exp.id,
        slug: exp.slug,
        title: exp.title,
        heroImageUrl: exp.heroImageUrl,
        category: exp.category,
        uiTabIntent: exp.uiTabIntent,
        operatorName,
      });
    }
  }

  function handleSimulateSuccess() {
    setPhase('processing');
    recordConfirmation();
    setTimeout(() => onDone({ success: true }), 1200);
  }

  function handleSimulateFailure() {
    setPhase('processing');
    setTimeout(() => onDone({ success: false, reason: 'payment_error' }), 1200);
  }

  function openInBrowser() {
    window.open(bookingUrl, '_blank', 'noopener,noreferrer');
  }

  const progressPercent = phase === 'loading' ? 30 : 70;

  return (
    <div className="flex flex-col h-full min-h-0 bg-canvas relative">
      <StatusBar />
      <div className="flex items-center gap-2 px-4 py-3 bg-surface border-b border-gamana-100">
        <button type="button" onClick={handleExit} className="p-2 -ml-2 rounded-full hover:bg-gamana-500/10">
          <ArrowLeft size={20} className="text-heading" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted">Booking with</p>
          <p className="text-sm font-semibold text-heading truncate">{operatorName}</p>
        </div>
        <button
          type="button"
          onClick={openInBrowser}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-gamana-500"
        >
          <ExternalLink size={14} />
          Browser
        </button>
      </div>

      {state !== 'offline' && state !== 'load_failed' && (
        <ProgressBar percent={progressPercent} />
      )}

      {state === 'offline' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <WifiOff size={40} className="text-muted mb-3" />
          <p className="text-sm font-medium text-heading">You&apos;re offline</p>
          <p className="text-xs text-muted mt-1 mb-4">Reconnect or open booking in your browser.</p>
          <button
            type="button"
            onClick={openInBrowser}
            className="px-4 py-2 rounded-xl bg-gamana-500 text-white text-sm font-semibold"
          >
            Open in browser
          </button>
        </div>
      )}

      {state === 'load_failed' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <AlertCircle size={40} className="text-rose-500 mb-3" />
          <p className="text-sm font-medium text-heading">Failed to load booking</p>
          <p className="text-xs text-muted mt-1 mb-4">Try again or use your browser.</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSimulateFail(false)}
              className="flex items-center gap-1 px-4 py-2 rounded-xl bg-gamana-500/10 text-gamana-600 text-sm font-semibold"
            >
              <RefreshCw size={14} />
              Retry
            </button>
            <button
              type="button"
              onClick={openInBrowser}
              className="px-4 py-2 rounded-xl bg-gamana-500 text-white text-sm font-semibold"
            >
              Open in browser
            </button>
          </div>
        </div>
      )}

      {state === null && phase === 'loading' && (
        <LoadingSkeleton />
      )}

      {state === null && phase === 'active' && (
        <div className="flex-1 flex flex-col min-h-0 relative">
          <iframe
            title={`Booking with ${operatorName}`}
            src={bookingUrl}
            className="flex-1 w-full border-0 bg-white min-h-[280px]"
            sandbox="allow-scripts allow-same-origin allow-forms"
            onError={() => setState('load_failed')}
          />
          <div className="px-4 py-2 opacity-40">
            <p className="text-xs text-muted text-center">
              Simulate:{' '}
              <button
                type="button"
                onClick={handleSimulateSuccess}
                className="font-semibold text-emerald-600 underline"
              >
                Success
              </button>
              {' · '}
              <button
                type="button"
                onClick={handleSimulateFailure}
                className="font-semibold text-rose-600 underline"
              >
                Failure
              </button>
            </p>
          </div>
        </div>
      )}

      {phase === 'processing' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-surface/90 backdrop-blur-sm">
          <div className="w-10 h-10 rounded-full border-2 border-gamana-200 border-t-gamana-500 animate-spin" />
          <p className="text-sm font-medium text-heading mt-4">Processing your payment…</p>
        </div>
      )}
    </div>
  );
}
