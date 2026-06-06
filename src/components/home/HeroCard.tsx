import { Sparkles, ChevronRight } from 'lucide-react';
import type { Story, Narrator } from '../../types';
import PlayButton from '../shared/PlayButton';
import NarratorPill from '../shared/NarratorPill';
import TrustChip from '../shared/TrustChip';
import OfflineBadge from '../shared/OfflineBadge';
import AudioWave from '../shared/AudioWave';
import { useDownloadState } from '../../hooks/useDownloadState';

interface HeroCardProps {
  story: Story | null;
  narrator: Narrator | null;
  isPlaying: boolean;
  isCurrentStory: boolean;
  onPlay: () => void;
  onNarratorTap: () => void;
  onTapDetail?: () => void;
}

export default function HeroCard({
  story,
  narrator,
  isPlaying,
  isCurrentStory,
  onPlay,
  onNarratorTap,
  onTapDetail,
}: HeroCardProps) {
  const { downloadState } = useDownloadState('story', story?.id ?? '');
  if (!story) return null;

  const badgeStatus =
    downloadState.status === 'ready'
      ? 'ready'
      : downloadState.status === 'downloading' || downloadState.status === 'queued'
        ? 'downloading'
        : 'available';

  return (
    <div className="mx-4 mt-3">
      <p className="text-xs font-semibold text-gamana-500 uppercase tracking-wide mb-2 px-1">
        Today&apos;s Best Pick
      </p>
      <div className="rounded-3xl bg-surface shadow-card overflow-hidden">
      <button
        onClick={onTapDetail}
        className="relative h-36 overflow-hidden w-full text-left block"
      >
        {story.image_url ? (
          <img
            src={story.image_url}
            alt={story.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gamana-100 to-gamana-200" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4">
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles size={12} className="text-amber-300" />
            <span className="px-2 py-0.5 rounded-md bg-amber-500/90 text-[10px] font-bold text-white uppercase tracking-wider">
              Start here
            </span>
          </div>
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold text-lg leading-tight">{story.title}</h2>
            <ChevronRight size={18} className="text-white/60 flex-shrink-0" />
          </div>
        </div>
      </button>

      <div className="px-4 pt-3 pb-4">
        <button onClick={onTapDetail} className="text-left w-full mb-3">
          <p className="text-sm text-secondary leading-relaxed">{story.subtitle}</p>
        </button>

        <div className="flex items-center gap-2 mb-3">
          <TrustChip level={story.trust_level} />
          <NarratorPill narrator={narrator} onTap={onNarratorTap} />
          <OfflineBadge status={badgeStatus} compact />
        </div>

        <div className="flex items-center gap-3 p-3 rounded-2xl bg-gamana-50/60 dark:bg-gamana-900/20 border border-gamana-100/50">
          <PlayButton isPlaying={isCurrentStory && isPlaying} onClick={onPlay} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-heading">
                {isCurrentStory && isPlaying ? 'Now playing' : 'Play now'}
              </span>
              {isCurrentStory && isPlaying && <AudioWave />}
            </div>
            <p className="text-xs text-gamana-600/70 mt-0.5 truncate">
              {story.why_this_matters}
            </p>
          </div>
          <span className="text-xs text-gamana-400 font-medium whitespace-nowrap">
            {Math.round(story.duration_seconds / 60)} min
          </span>
        </div>
      </div>
      </div>
    </div>
  );
}
