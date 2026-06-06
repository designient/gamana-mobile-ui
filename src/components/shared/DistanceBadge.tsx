import { Navigation } from 'lucide-react';

export default function DistanceBadge({ meters }: { meters: number }) {
  const display = meters >= 1000
    ? `${(meters / 1000).toFixed(1)} km`
    : `${Math.round(meters)} m`;

  return (
    <span className="inline-flex items-center gap-1 text-muted text-[11px] font-medium">
      <Navigation size={11} />
      {display}
    </span>
  );
}
