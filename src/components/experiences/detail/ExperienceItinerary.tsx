import { MapPin } from 'lucide-react';
import type { ItineraryStop } from '../../../types/experience';
import { trackExperienceEvent } from '../../../lib/experience-analytics';

interface ExperienceItineraryProps {
  stops: ItineraryStop[];
  experienceId: string;
}

export default function ExperienceItinerary({ stops, experienceId }: ExperienceItineraryProps) {
  if (!stops.length) return null;

  return (
    <ol className="relative border-l-2 border-gamana-200 ml-2 space-y-5">
      {stops.map((stop, i) => (
        <li key={stop.id} className="pl-4 relative">
          <span
            className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-surface ${
              stop.isMainStop ? 'bg-gamana-500' : 'bg-gamana-200'
            }`}
          />
          <div
            onFocus={() =>
              trackExperienceEvent('experience_detail_section_viewed', {
                experienceId,
                section: 'itinerary',
              })
            }
          >
            <p className="text-sm font-semibold text-heading">{stop.title}</p>
            {stop.subtitle && (
              <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                <MapPin size={11} />
                {stop.subtitle}
              </p>
            )}
            {stop.activities && stop.activities.length > 0 && (
              <p className="text-xs text-gamana-600/80 mt-1">{stop.activities.join(' · ')}</p>
            )}
            {stop.isMainStop && (
              <span className="inline-block mt-1 text-[9px] font-bold uppercase text-gamana-500">
                Main stop
              </span>
            )}
          </div>
          {i < stops.length - 1 && <div className="h-1" />}
        </li>
      ))}
    </ol>
  );
}
