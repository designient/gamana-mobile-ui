import { MapPin, ExternalLink } from 'lucide-react';

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

interface LocationPingCardProps {
  senderName: string;
  lat: number;
  lng: number;
  isOutgoing: boolean;
}

export default function LocationPingCard({ senderName, lat, lng, isOutgoing }: LocationPingCardProps) {
  const staticMapUrl = MAPS_API_KEY
    ? `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=280x120&scale=2&markers=color:red%7C${lat},${lng}&key=${MAPS_API_KEY}&style=feature:poi|visibility:off`
    : null;

  const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

  return (
    <div className={`max-w-[260px] rounded-2xl overflow-hidden border ${
      isOutgoing ? 'border-gamana-300/50 bg-gamana-50 dark:bg-gamana-900/20' : 'border-border-default bg-surface'
    }`}>
      {staticMapUrl ? (
        <img
          src={staticMapUrl}
          alt="Location"
          className="w-full h-[100px] object-cover"
        />
      ) : (
        <div className="w-full h-[80px] bg-surface-muted flex items-center justify-center">
          <MapPin size={24} className="text-muted" />
        </div>
      )}
      <div className="px-3 py-2">
        <p className={`text-[11px] font-medium ${isOutgoing ? 'text-heading' : 'text-gray-700'}`}>
          <MapPin size={10} className="inline mr-0.5" />
          {senderName === 'You' ? 'You shared your location' : `${senderName} shared their location`}
        </p>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1 mt-1 text-[10px] font-medium ${
            isOutgoing ? 'text-gamana-600' : 'text-gamana-500'
          }`}
        >
          <ExternalLink size={9} />
          View on Map
        </a>
      </div>
    </div>
  );
}
