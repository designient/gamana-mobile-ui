import { Lock } from 'lucide-react';
import type { Story, ModeContent } from '../../types';
import { useContentAccess } from '../../hooks/useContentAccess';
import PlayButton from '../shared/PlayButton';
import TrustChip from '../shared/TrustChip';
import DurationBadge from '../shared/DurationBadge';
import DistanceBadge from '../shared/DistanceBadge';
import AudioWave from '../shared/AudioWave';
import OfflineBadge from '../shared/OfflineBadge';
import { useDownloadState } from '../../hooks/useDownloadState';

interface StoryCardProps {
  type: 'story';
  data: Story;
  isPlaying: boolean;
  onPlay: () => void;
  onTapDetail?: () => void;
}

interface ModeCardProps {
  type: 'mode_content';
  data: ModeContent;
  isPlaying: boolean;
  onPlay: () => void;
  onTapDetail?: never;
}

type ContentCardProps = StoryCardProps | ModeCardProps;

function StoryContentCard({ data, isPlaying, onPlay, onTapDetail }: { data: Story; isPlaying: boolean; onPlay: () => void; onTapDetail?: () => void }) {
  const { access } = useContentAccess('story', data.id);
  const { downloadState } = useDownloadState('story', data.id);
  const badgeStatus = downloadState.status === 'ready' ? 'ready' as const : downloadState.status === 'downloading' || downloadState.status === 'queued' ? 'downloading' as const : 'available' as const;
  const isLocked = !access.is_unlocked && !access.is_expired;

  return (
    <div className="flex items-center gap-3 p-3 bg-surface rounded-2xl shadow-card transition-all hover:shadow-elevated">
      <button
        onClick={onTapDetail}
        className="flex items-center gap-3 flex-1 min-w-0 text-left"
      >
        <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
          {data.image_url ? (
            <img src={data.image_url} alt={data.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gamana-100" />
          )}
          {isLocked && !isPlaying && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <Lock size={14} className="text-white/80" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <h4 className="text-sm font-medium text-heading truncate">{data.title}</h4>
            {isPlaying && <AudioWave />}
          </div>
          <p className="text-xs text-muted truncate mb-1.5">{data.subtitle}</p>
          <div className="flex items-center gap-2">
            <DurationBadge seconds={data.duration_seconds} />
            {data.distance_meters != null && (
              <DistanceBadge meters={data.distance_meters} />
            )}
            {isLocked ? (
              <span className="inline-flex items-center gap-1 text-amber-500 text-[10px] font-medium">
                <Lock size={9} /> Locked
              </span>
            ) : (
              <>
                <TrustChip level={data.trust_level} />
                <OfflineBadge status={badgeStatus} compact />
              </>
            )}
          </div>
        </div>
      </button>
      {isLocked ? (
        <button
          onClick={onTapDetail}
          className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-500 flex items-center justify-center hover:bg-amber-100 transition-all active:scale-95 flex-shrink-0"
        >
          <Lock size={15} />
        </button>
      ) : (
        <PlayButton size="sm" isPlaying={isPlaying} onClick={onPlay} />
      )}
    </div>
  );
}

export default function ContentCard(props: ContentCardProps) {
  const { isPlaying, onPlay } = props;

  if (props.type === 'story') {
    return <StoryContentCard data={props.data} isPlaying={isPlaying} onPlay={onPlay} onTapDetail={props.onTapDetail} />;
  }

  const content = props.data;
  return (
    <div className="p-4 bg-surface rounded-2xl shadow-card transition-all hover:shadow-elevated">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <h4 className="text-sm font-medium text-heading">{content.title}</h4>
            {isPlaying && <AudioWave />}
          </div>
          <p className="text-xs text-secondary leading-relaxed line-clamp-2">{content.body}</p>
          <div className="flex items-center gap-2 mt-2">
            {content.duration_seconds && <DurationBadge seconds={content.duration_seconds} />}
            <TrustChip level={content.trust_level} />
          </div>
        </div>
        {content.duration_seconds && (
          <PlayButton size="sm" isPlaying={isPlaying} onClick={onPlay} />
        )}
      </div>
    </div>
  );
}
