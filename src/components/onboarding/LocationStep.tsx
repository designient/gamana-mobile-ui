import { useState, useEffect, useCallback } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

interface LocationStepProps {
  onNext: (locationGranted: boolean) => void;
}

export default function LocationStep({ onNext }: LocationStepProps) {
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    console.info('location_step_viewed', { timestamp: Date.now() });
  }, []);

  const handleEnable = useCallback(() => {
    if (!navigator.geolocation) {
      console.info('location_permission_result', { result: 'denied', reason: 'not_supported' });
      onNext(false);
      return;
    }

    setIsRequesting(true);
    navigator.geolocation.getCurrentPosition(
      () => {
        console.info('location_permission_result', { result: 'granted' });
        setIsRequesting(false);
        onNext(true);
      },
      () => {
        console.info('location_permission_result', { result: 'denied' });
        setIsRequesting(false);
        onNext(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [onNext]);

  const handleSkip = useCallback(() => {
    console.info('location_permission_result', { result: 'skipped' });
    onNext(false);
  }, [onNext]);

  return (
    <div className="flex flex-col h-full bg-canvas animate-fade-in">
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="w-20 h-20 rounded-full bg-gamana-50 dark:bg-gamana-900/20 flex items-center justify-center mb-8">
          <MapPin size={36} className="text-gamana-500" />
        </div>

        <h1 className="text-xl font-semibold text-heading text-center mb-2">
          Find stories near you
        </h1>

        <p className="text-sm text-muted text-center leading-relaxed max-w-[280px] mb-10">
          We use your location to surface nearby stories. You can always search or explore manually.
        </p>
      </div>

      <div className="px-6 pb-10 space-y-3">
        <button
          onClick={handleEnable}
          disabled={isRequesting}
          className="w-full py-3.5 rounded-2xl bg-gamana-500 text-white text-sm font-semibold shadow-md hover:bg-gamana-600 active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {isRequesting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Requesting…
            </>
          ) : (
            'Enable Location'
          )}
        </button>
        <button
          onClick={handleSkip}
          disabled={isRequesting}
          className="w-full py-2.5 text-sm text-gamana-600 font-medium hover:text-gamana-700 transition-colors"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
