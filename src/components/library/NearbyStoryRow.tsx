import { Play, Pause, Navigation, Clock, Lock } from 'lucide-react';
import type { Story } from '../../types';
import { useContentAccess } from '../../hooks/useContentAccess';
import TrustChip from '../shared/TrustChip';
import AudioWave from '../shared/AudioWave';
import OfflineBadge from '../shared/OfflineBadge';
import { useDownloadState } from '../../hooks/useDownloadState';

interface NearbyStoryRowProps {
  story: Story;
  isPlaying: boolean;
  onPlay: () => void;
  onTap: () => void;
}

export default function NearbyStoryRow({ story, isPlaying, onPlay, onTap }: NearbyStoryRowProps) {
  const { access } = useContentAccess('story', story.id);
  const { downloadState } = useDownloadState('story', story.id);
  const badgeStatus = downloadState.status === 'ready' ? 'ready' : downloadState.status === 'downloading' || downloadState.status === 'queued' ? 'downloading' : 'available';
  const isLocked = !access.is_unlocked && !access.is_expired;
  const mins = Math.round(story.duration_seconds / 60);
  const distance = story.distance_meters != null
    ? story.distance_meters >= 1000
      ? `${(story.distance_meters / 1000).toFixed(1)} km`
      : `${Math.round(story.distance_meters)} m`
    : null;

  return (
    <div className="flex items-center gap-3 p-2.5 bg-surface rounded-2xl shadow-card transition-all hover:shadow-elevated">
      <button
        onClick={onTap}
        className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0"
      >
        {story.image_url ? (
          <img src={story.image_url} alt={story.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gamana-100" />
        )}
        {isPlaying && (
          <div className="absolute inset-0 bg-gamana-900/40 flex items-center justify-center">
            <AudioWave />
          </div>
        )}
        {isLocked && !isPlaying && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <Lock size={14} className="text-white/80" />
          </div>
        )}
      </button>

      <button onClick={onTap} className="flex-1 min-w-0 text-left py-0.5">
        <h4 className="text-[13px] font-semibold text-heading truncate leading-tight">
          {story.title}
        </h4>
        <p className="text-[11px] text-gamana-600/50 truncate mt-0.5">{story.subtitle}</p>
        <div className="flex items-center gap-2.5 mt-1.5">
          <span className="inline-flex items-center gap-1 text-gamana-500/60 text-[10px] font-medium">
            <Clock size={10} />
            {mins} min
          </span>
          {distance && (
            <span className="inline-flex items-center gap-1 text-gamana-500/60 text-[10px] font-medium">
              <Navigation size={10} />
              {distance}
            </span>
          )}
          {isLocked ? (
            <span className="inline-flex items-center gap-1 text-amber-500 text-[10px] font-medium">
              <Lock size={9} /> Locked
            </span>
          ) : (
            <>
              <TrustChip level={story.trust_level} />
              <OfflineBadge status={badgeStatus} compact />
            </>
          )}
        </div>
      </button>

      <button
        onClick={onTap}
        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95 flex-shrink-0 ${
          isLocked
            ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-500 hover:bg-amber-100'
            : 'bg-gamana-500/10 text-gamana-600 hover:bg-gamana-500/20'
        }`}
      >
        {isPlaying ? (
          <Pause size={14} fill="currentColor" />
        ) : isLocked ? (
          <Lock size={14} />
        ) : (
          <Play size={14} fill="currentColor" className="ml-px" />
        )}
      </button>
    </div>
  );
}
