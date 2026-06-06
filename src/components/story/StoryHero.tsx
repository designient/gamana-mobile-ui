import { ChevronLeft, Share2, MapPin } from 'lucide-react';
import type { Story } from '../../types';
import DurationBadge from '../shared/DurationBadge';
import DistanceBadge from '../shared/DistanceBadge';
import TrustChip from '../shared/TrustChip';

interface StoryHeroProps {
  story: Story;
  onBack: () => void;
}

export default function StoryHero({ story, onBack }: StoryHeroProps) {
  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: story.title, text: story.subtitle, url });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <div className="relative h-60 overflow-hidden">
      {story.image_url ? (
        <img
          src={story.image_url}
          alt={story.title}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-gamana-100 to-gamana-200 flex items-center justify-center">
          <MapPin size={40} className="text-gamana-300" />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      <button
        onClick={onBack}
        className="absolute top-3 left-3 w-9 h-9 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm text-white transition-all active:scale-95 hover:bg-black/40"
      >
        <ChevronLeft size={20} />
      </button>

      <button
        onClick={handleShare}
        className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm text-white transition-all active:scale-95 hover:bg-black/40"
      >
        <Share2 size={16} />
      </button>

      <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
        <h1 className="text-xl font-semibold text-white leading-tight mb-1">{story.title}</h1>
        <p className="text-sm text-white/80 mb-2.5">{story.subtitle}</p>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-white/70 text-[11px] font-medium">
            <DurationBadge seconds={story.duration_seconds} />
          </span>
          {story.distance_meters != null && (
            <span className="inline-flex items-center gap-1 text-white/70 text-[11px] font-medium">
              <DistanceBadge meters={story.distance_meters} />
            </span>
          )}
          <TrustChip level={story.trust_level} />
        </div>
      </div>
    </div>
  );
}
