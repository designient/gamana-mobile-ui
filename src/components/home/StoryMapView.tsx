import { useMemo } from 'react';
import { MapPin } from 'lucide-react';
import type { Story } from '../../types';

interface StoryMapViewProps {
  stories: Story[];
}

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

function buildStaticMapUrl(stories: Story[], width: number, height: number, zoom: number) {
  if (!API_KEY || stories.length === 0) return null;

  const center = stories.find((s) => s.is_featured) ?? stories[0];

  const featured = stories.filter((s) => s.is_featured);
  const verified = stories.filter((s) => !s.is_featured && s.trust_level === 'verified');
  const others = stories.filter((s) => !s.is_featured && s.trust_level !== 'verified');

  const parts = [
    `https://maps.googleapis.com/maps/api/staticmap`,
    `?center=${center.lat},${center.lng}`,
    `&zoom=${zoom}`,
    `&size=${width}x${height}`,
    `&scale=2`,
    `&maptype=roadmap`,
    `&style=feature:poi|visibility:off`,
    `&style=feature:transit|visibility:off`,
  ];

  if (featured.length > 0) {
    const coords = featured.map((s) => `${s.lat},${s.lng}`).join('|');
    parts.push(`&markers=color:0x1A5F7A|size:mid|${coords}`);
  }
  if (verified.length > 0) {
    const coords = verified.map((s) => `${s.lat},${s.lng}`).join('|');
    parts.push(`&markers=color:0x1A5F7A|size:small|${coords}`);
  }
  if (others.length > 0) {
    const coords = others.map((s) => `${s.lat},${s.lng}`).join('|');
    parts.push(`&markers=color:0xFB7185|size:small|${coords}`);
  }

  parts.push(`&key=${API_KEY}`);
  return parts.join('');
}

export default function StoryMapView({ stories }: StoryMapViewProps) {
  const mapUrl = useMemo(() => {
    return buildStaticMapUrl(stories, 400, 500, 13);
  }, [stories]);

  return (
    <div className="relative w-full h-[450px] rounded-2xl overflow-hidden mt-3 shadow-sm bg-[#E8ECEF]">
      {mapUrl ? (
        <img
          src={mapUrl}
          alt="Map showing nearby stories"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <MapFallback stories={stories} />
      )}
    </div>
  );
}

function MapFallback({ stories }: { stories: Story[] }) {
  return (
    <>
      <div
        className="absolute inset-0 opacity-40 bg-[length:24px_24px]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(26,95,122,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(26,95,122,0.06) 1px, transparent 1px)
          `,
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full h-full">
          {stories.slice(0, 8).map((story, i) => {
            const angle = (i / Math.min(stories.length, 8)) * Math.PI * 2;
            const radiusX = 35;
            const radiusY = 35;
            const cx = 50 + Math.cos(angle) * radiusX;
            const cy = 50 + Math.sin(angle) * radiusY;

            return (
              <div
                key={story.id}
                className="absolute flex flex-col items-center transition-all duration-300 pointer-events-none"
                style={{ left: `${cx}%`, top: `${cy}%`, transform: 'translate(-50%, -50%)' }}
              >
                <div className={`
                  flex items-center justify-center rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.12)]
                  ${story.is_featured
                    ? 'w-9 h-9 bg-gamana-500 ring-2 ring-white'
                    : story.trust_level === 'verified'
                      ? 'w-7 h-7 bg-gamana-500 ring-2 ring-white'
                      : 'w-7 h-7 bg-rose-400 ring-2 ring-white'
                  }
                `}>
                  <MapPin size={story.is_featured ? 18 : 14} className="text-white" fill="currentColor" />
                </div>
                <span className="mt-1.5 text-[10px] font-bold text-heading bg-surface/95 px-2 py-0.5 rounded-full whitespace-nowrap max-w-[100px] truncate shadow-sm border border-border-default/50 backdrop-blur-sm">
                  {story.title}
                </span>
              </div>
            );
          })}
          <div
            className="absolute w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg"
            style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
          >
            <div className="absolute inset-0 rounded-full bg-blue-500 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] opacity-30" />
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-surface-alt/80 to-transparent pointer-events-none" />
    </>
  );
}
