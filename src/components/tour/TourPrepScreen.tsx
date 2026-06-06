import { useState, useEffect } from 'react';
import { CheckCircle2, MapPin, Battery, Wifi, Download, Loader2, Clock, ArrowRight } from 'lucide-react';
import type { TourSessionStop } from '../../types';

interface TourPrepScreenProps {
  tourTitle: string;
  tourImage: string | null;
  stops: TourSessionStop[];
  onStart: () => void;
  onBack: () => void;
}

interface CheckItem {
  id: string;
  label: string;
  description: string;
  icon: typeof MapPin;
  status: 'pending' | 'checking' | 'ready';
}

export default function TourPrepScreen({ tourTitle, tourImage, stops, onStart, onBack }: TourPrepScreenProps) {
  const [checks, setChecks] = useState<CheckItem[]>([
    { id: 'gps', label: 'GPS Tracking', description: 'Required for auto-play at stops', icon: MapPin, status: 'pending' },
    { id: 'battery', label: 'Battery Optimization', description: 'Keep GPS active while walking', icon: Battery, status: 'pending' },
    { id: 'download', label: 'Download Audio', description: `${stops.length} stories for offline`, icon: Download, status: 'pending' },
  ]);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Simulate progressive checks
  useEffect(() => {
    const timers: number[] = [];

    // GPS check
    timers.push(window.setTimeout(() => {
      setChecks((prev) => prev.map((c) => c.id === 'gps' ? { ...c, status: 'checking' } : c));
    }, 400));
    timers.push(window.setTimeout(() => {
      setChecks((prev) => prev.map((c) => c.id === 'gps' ? { ...c, status: 'ready' } : c));
    }, 1200));

    // Battery check
    timers.push(window.setTimeout(() => {
      setChecks((prev) => prev.map((c) => c.id === 'battery' ? { ...c, status: 'checking' } : c));
    }, 1400));
    timers.push(window.setTimeout(() => {
      setChecks((prev) => prev.map((c) => c.id === 'battery' ? { ...c, status: 'ready' } : c));
    }, 2200));

    // Download check
    timers.push(window.setTimeout(() => {
      setChecks((prev) => prev.map((c) => c.id === 'download' ? { ...c, status: 'checking' } : c));
    }, 2400));

    // Simulate download progress
    let progress = 0;
    const downloadTimer = window.setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(downloadTimer);
        setChecks((prev) => prev.map((c) => c.id === 'download' ? { ...c, status: 'ready' } : c));
      }
      setDownloadProgress(Math.min(100, Math.round(progress)));
    }, 300);

    timers.push(window.setTimeout(() => {
      // Start the download progress simulation
    }, 2600));

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(downloadTimer);
    };
  }, []);

  const allReady = checks.every((c) => c.status === 'ready');
  const totalDuration = stops.reduce((acc, s) => acc + (s.story?.duration_seconds ?? 0), 0);

  return (
    <div className="h-full flex flex-col bg-canvas">
      {/* Hero Header */}
      <div className="relative h-48 w-full overflow-hidden">
        {tourImage && (
          <img src={tourImage} alt={tourTitle} className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gamana-900/90 via-gamana-900/40 to-transparent" />

        {/* Back button */}
        <button
          onClick={onBack}
          className="absolute top-12 left-4 w-8 h-8 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white"
        >
          ←
        </button>

        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-xs font-medium text-white/70 uppercase tracking-wider mb-1">Get Ready</p>
          <h1 className="text-xl font-bold text-white leading-tight">{tourTitle}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-white/80 flex items-center gap-1">
              <MapPin size={11} /> {stops.length} stops
            </span>
            <span className="text-xs text-white/80 flex items-center gap-1">
              <Clock size={11} /> {Math.round(totalDuration / 60)} min audio
            </span>
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div className="flex-1 overflow-y-auto px-4 pt-5 pb-32">
        <h3 className="text-xs font-semibold text-body uppercase tracking-wider mb-3">Pre-Tour Checklist</h3>

        <div className="flex flex-col gap-2.5">
          {checks.map((check) => {
            const Icon = check.icon;
            return (
              <div
                key={check.id}
                className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-300 ${
                  check.status === 'ready'
                    ? 'bg-emerald-50 border-emerald-200'
                    : check.status === 'checking'
                      ? 'bg-gamana-50 dark:bg-gamana-900/20 border-gamana-200'
                      : 'bg-surface border-border-default'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                  check.status === 'ready'
                    ? 'bg-emerald-500'
                    : check.status === 'checking'
                      ? 'bg-gamana-100'
                      : 'bg-surface-muted'
                }`}>
                  {check.status === 'ready' ? (
                    <CheckCircle2 size={18} className="text-white" />
                  ) : check.status === 'checking' ? (
                    <Loader2 size={16} className="text-gamana-500 animate-spin" />
                  ) : (
                    <Icon size={16} className="text-muted" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${check.status === 'ready' ? 'text-emerald-800' : 'text-heading'}`}>
                    {check.label}
                  </p>
                  <p className="text-xs text-muted mt-0.5">{check.description}</p>
                  {check.id === 'download' && check.status === 'checking' && (
                    <div className="mt-2 h-1.5 bg-gamana-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gamana-500 rounded-full transition-all duration-300"
                        style={{ width: `${downloadProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Route Preview */}
        <h3 className="text-xs font-semibold text-body uppercase tracking-wider mt-6 mb-3">Tour Route</h3>
        <div className="relative border-l-2 border-dashed border-gamana-200 ml-4 pl-5 space-y-4">
          {stops.map((stop, i) => (
            <div key={stop.id} className="relative">
              <div className="absolute -left-[25px] top-1 w-3.5 h-3.5 rounded-full bg-surface border-[3px] border-gamana-400" />
              <div className="flex items-center gap-2.5">
                {stop.story?.image_url ? (
                  <img src={stop.story.image_url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gamana-50 dark:bg-gamana-900/20 flex items-center justify-center flex-shrink-0">
                    <MapPin size={14} className="text-gamana-400" />
                  </div>
                )}
                <div>
                  <p className="text-[13px] font-medium text-heading">
                    {i + 1}. {stop.story?.title ?? stop.pinnedLabel ?? `Stop ${i + 1}`}
                  </p>
                  <p className="text-[11px] text-muted">
                    {stop.story ? `${Math.round(stop.story.duration_seconds / 60)} min audio` : 'Pinned location'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Start Button */}
      <div className="absolute bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-sm border-t border-border-default p-4 pb-8 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <button
          onClick={onStart}
          disabled={!allReady}
          className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm transition-all active:scale-[0.98] shadow-md ${
            allReady
              ? 'bg-gamana-500 text-white shadow-gamana-500/20 hover:bg-gamana-600'
              : 'bg-surface-muted text-muted cursor-not-allowed'
          }`}
        >
          {allReady ? (
            <>
              Start Walking Tour
              <ArrowRight size={16} />
            </>
          ) : (
            <>
              <Loader2 size={16} className="animate-spin" />
              Preparing...
            </>
          )}
        </button>
      </div>
    </div>
  );
}
