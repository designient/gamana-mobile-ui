import { Play, Pause, Navigation, ChevronRight, Lock } from 'lucide-react';
import type { Story } from '../../types';
import { useContentAccess } from '../../hooks/useContentAccess';
import TrustChip from '../shared/TrustChip';
import AudioWave from '../shared/AudioWave';
import OfflineBadge from '../shared/OfflineBadge';
import { useDownloadState } from '../../hooks/useDownloadState';

interface NearbyHeroCardProps {
  story: Story;
  isPlaying: boolean;
  onPlay: () => void;
  onTap: () => void;
}

function formatDistance(meters?: number): string {
  if (meters == null) return '';
  return meters >= 1000
    ? `${(meters / 1000).toFixed(1)} km`
    : `${Math.round(meters)} m`;
}

export default function NearbyHeroCard({ story, isPlaying, onPlay, onTap }: NearbyHeroCardProps) {
  const { access } = useContentAccess('story', story.id);
  const { downloadState } = useDownloadState('story', story.id);
  const badgeStatus = downloadState.status === 'ready' ? 'ready' as const : downloadState.status === 'downloading' || downloadState.status === 'queued' ? 'downloading' as const : 'available' as const;
  const isLocked = !access.is_unlocked && !access.is_expired;

  return (
    <div className="mx-4 rounded-3xl bg-surface shadow-card overflow-hidden">
      <button onClick={onTap} className="relative w-full h-44 overflow-hidden block text-left">
        {story.image_url ? (
          <img
            src={story.image_url}
            alt={story.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gamana-100 to-gamana-200" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />

        {story.distance_meters != null && (
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface/20 backdrop-blur-sm">
            <Navigation size={11} className="text-white" />
            <span className="text-[11px] font-semibold text-white">
              {formatDistance(story.distance_meters)} away
            </span>
          </div>
        )}

        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {isLocked && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-400/90 backdrop-blur-sm">
              <Lock size={10} className="text-white" />
              <span className="text-[10px] font-semibold text-white">Locked</span>
            </div>
          )}
          <TrustChip level={story.trust_level} />
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <h2 className="text-white font-semibold text-lg leading-tight mb-1">{story.title}</h2>
          <div className="flex items-center gap-1">
            <p className="text-white/75 text-xs">{story.subtitle}</p>
            <ChevronRight size={14} className="text-white/40 flex-shrink-0" />
          </div>
        </div>
      </button>

      <div className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <button
            onClick={onTap}
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all active:scale-95 flex-shrink-0 ${
              isLocked
                ? 'bg-amber-400 text-white hover:bg-amber-500'
                : 'bg-gamana-500 text-white hover:bg-gamana-600'
            }`}
          >
            {isPlaying ? (
              <Pause size={20} fill="currentColor" />
            ) : isLocked ? (
              <Lock size={20} />
            ) : (
              <Play size={20} fill="currentColor" className="ml-0.5" />
            )}
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-heading">
                {isPlaying ? 'Listening' : isLocked ? 'Unlock to listen' : 'Listen now'}
              </span>
              {isPlaying && <AudioWave />}
            </div>
            <p className="text-xs text-gamana-600/60 mt-0.5 truncate">
              {story.why_this_matters}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {!isLocked && <OfflineBadge status={badgeStatus} compact />}
            <span className="text-xs text-gamana-400 font-semibold whitespace-nowrap">
              {Math.round(story.duration_seconds / 60)} min
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
