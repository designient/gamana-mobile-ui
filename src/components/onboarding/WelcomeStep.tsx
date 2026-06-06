import { useEffect } from 'react';
import { Headphones, ShieldCheck, MapPin } from 'lucide-react';

interface WelcomeStepProps {
  onNext: () => void;
}

export default function WelcomeStep({ onNext }: WelcomeStepProps) {
  useEffect(() => {
    console.info('onboarding_started', { timestamp: Date.now() });
    console.info('welcome_viewed', { timestamp: Date.now() });
  }, []);

  return (
    <div className="flex flex-col h-full bg-canvas animate-fade-in">
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <img
          src="/gamana-logo.svg"
          alt="Gamana"
          className="h-10 w-auto mb-10 animate-scale-in"
        />

        <h1 className="text-2xl font-semibold text-heading text-center leading-snug mb-3">
          Audio stories for the<br />places around you
        </h1>

        <p className="text-sm text-muted text-center leading-relaxed max-w-[280px] mb-10">
          Hear the history beneath your feet. Verified, local, always respectful.
        </p>

        <div className="flex items-center justify-center gap-6 mb-12">
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-10 h-10 rounded-full bg-gamana-50 dark:bg-gamana-900/20 flex items-center justify-center">
              <Headphones size={18} className="text-gamana-500" />
            </div>
            <span className="text-[11px] text-muted font-medium">Audio-first</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-10 h-10 rounded-full bg-gamana-50 dark:bg-gamana-900/20 flex items-center justify-center">
              <ShieldCheck size={18} className="text-gamana-500" />
            </div>
            <span className="text-[11px] text-muted font-medium">Verified</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-10 h-10 rounded-full bg-gamana-50 dark:bg-gamana-900/20 flex items-center justify-center">
              <MapPin size={18} className="text-gamana-500" />
            </div>
            <span className="text-[11px] text-muted font-medium">Location-aware</span>
          </div>
        </div>
      </div>

      <div className="px-6 pb-10">
        <button
          onClick={onNext}
          className="w-full py-3.5 rounded-2xl bg-gamana-500 text-white text-sm font-semibold shadow-md hover:bg-gamana-600 active:scale-[0.98] transition-all"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}
