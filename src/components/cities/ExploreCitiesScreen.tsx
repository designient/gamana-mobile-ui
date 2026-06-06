import { ArrowLeft, Globe } from 'lucide-react';
import { getCities } from '../../lib/localDb';
import type { City } from '../../types';
import StatusBar from '../layout/StatusBar';

interface ExploreCitiesScreenProps {
  onBack: () => void;
  onSelectCity?: (city: City) => void;
}

export default function ExploreCitiesScreen({ onBack, onSelectCity }: ExploreCitiesScreenProps) {
  const cities = getCities();

  return (
    <div className="relative flex flex-col h-full bg-canvas">
      <StatusBar />

      <header className="flex items-center gap-3 px-5 py-3 bg-surface/80 backdrop-blur-md sticky top-0 z-40">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center hover:bg-surface-muted transition-colors"
        >
          <ArrowLeft size={16} className="text-secondary" />
        </button>
        <h1 className="text-base font-semibold text-heading">Explore Cities</h1>
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-hide pb-16">
        <div className="px-4 pt-4 grid grid-cols-2 gap-3">
          {cities.map((city) => (
            <button
              key={city.id}
              onClick={() => {
                onSelectCity?.(city);
                onBack();
              }}
              className="rounded-2xl bg-surface shadow-card hover:shadow-elevated transition-all text-left active:scale-[0.97] overflow-hidden"
            >
              <div className="aspect-[4/3] w-full bg-gamana-50 dark:bg-gamana-900/20">
                {city.image_url ? (
                  <img src={city.image_url} alt={city.name} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Globe size={24} className="text-gamana-300" />
                  </div>
                )}
              </div>
              <div className="px-3 py-2.5">
                <h3 className="text-sm font-semibold text-heading">{city.name}</h3>
                <p className="text-[11px] text-muted mt-0.5">{city.country}</p>
              </div>
            </button>
          ))}
        </div>

        {cities.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
            <div className="w-16 h-16 rounded-full bg-gamana-50 dark:bg-gamana-900/20 flex items-center justify-center mb-4">
              <Globe size={28} className="text-gamana-300" />
            </div>
            <h3 className="text-sm font-semibold text-heading mb-1.5">No cities yet</h3>
            <p className="text-xs text-muted leading-relaxed max-w-[240px]">
              More cities are being added. Check back soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
