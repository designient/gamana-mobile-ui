import { MapPin, Car } from 'lucide-react';
import type { Experience } from '../../../types/experience';

const MEETING_LABELS: Record<string, string> = {
  meet_on_location: 'Meet on location',
  pick_up: 'Pickup from your stay',
  meet_or_pickup: 'Meet on location or pickup',
};

interface ExperienceMeetingBlockProps {
  experience: Experience;
}

export default function ExperienceMeetingBlock({ experience }: ExperienceMeetingBlockProps) {
  if (!experience.meetingPointText && !experience.pickupAvailable) return null;

  return (
    <div className="rounded-xl border border-gamana-100 bg-surface p-3.5 space-y-2.5">
      {experience.meetingType && (
        <p className="text-xs font-medium text-heading flex items-center gap-2">
          <Car size={14} className="text-gamana-500" />
          {MEETING_LABELS[experience.meetingType] ?? experience.meetingType}
        </p>
      )}
      {experience.meetingPointText && (
        <p className="text-sm text-muted flex gap-2 leading-relaxed">
          <MapPin size={14} className="text-gamana-500 flex-shrink-0 mt-0.5" />
          {experience.meetingPointText}
        </p>
      )}
      {experience.latitude != null && experience.longitude != null && (
        <div className="h-28 rounded-lg bg-gamana-500/10 flex items-center justify-center text-xs text-muted">
          Map preview · {experience.locality ?? experience.city}
        </div>
      )}
    </div>
  );
}
