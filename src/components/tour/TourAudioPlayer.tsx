import type { Story, Narrator } from '../../types';
import { Play, Pause, SkipForward } from 'lucide-react';

interface TourAudioPlayerProps {
  story: Story;
  narrator: Narrator | null;
  isPlaying: boolean;
  progress: number;
  onTogglePlay: () => void;
  onSkip: () => void;
  mini?: boolean;
}

/** Mini inline player for the peek state */
function MiniPlayer({
  isPlaying,
  progress,
  onTogglePlay,
  onSkip,
}: Pick<TourAudioPlayerProps, 'isPlaying' | 'progress' | 'onTogglePlay' | 'onSkip'>) {
  return (
    <div className="flex items-center gap-2.5 mt-2">
      <button
        onClick={onTogglePlay}
        className="w-9 h-9 rounded-full bg-gamana-500 flex items-center justify-center text-white shadow-md shadow-gamana-500/20 active:scale-95 transition-transform flex-shrink-0"
      >
        {isPlaying ? <Pause size={14} fill="white" /> : <Play size={14} fill="white" className="ml-0.5" />}
      </button>
      <div className="flex-1 min-w-0">
        <div className="h-1.5 bg-gamana-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gamana-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <button
        onClick={onSkip}
        className="w-7 h-7 rounded-full bg-surface-muted flex items-center justify-center text-secondary hover:bg-surface-muted transition-colors active:scale-95 flex-shrink-0"
      >
        <SkipForward size={12} />
      </button>
    </div>
  );
}

/** Full audio player for the half/expanded sheet states */
function FullPlayer({
  story,
  narrator,
  isPlaying,
  progress,
  onTogglePlay,
  onSkip,
}: Omit<TourAudioPlayerProps, 'mini'>) {
  const duration = Math.round(story.duration_seconds / 60);
  const elapsed = Math.round((progress / 100) * story.duration_seconds / 60);

  return (
    <div className="bg-surface rounded-2xl shadow-card border border-border-default/50 overflow-hidden">
      <div className="flex items-center gap-3 p-3">
        {/* Album art */}
        <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
          <img
            src={story.image_url ?? ''}
            alt={story.title}
            className="w-full h-full object-cover"
          />
          {isPlaying && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <div className="flex items-end gap-[2px] h-4">
                <div className="w-[3px] bg-surface rounded-full animate-[soundbar_0.8s_ease-in-out_infinite]" style={{ height: '40%' }} />
                <div className="w-[3px] bg-surface rounded-full animate-[soundbar_0.8s_ease-in-out_infinite_0.2s]" style={{ height: '70%' }} />
                <div className="w-[3px] bg-surface rounded-full animate-[soundbar_0.8s_ease-in-out_infinite_0.4s]" style={{ height: '50%' }} />
                <div className="w-[3px] bg-surface rounded-full animate-[soundbar_0.8s_ease-in-out_infinite_0.1s]" style={{ height: '80%' }} />
              </div>
            </div>
          )}
        </div>

        {/* Track info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-heading truncate">{story.title}</h4>
          {narrator && (
            <p className="text-[11px] text-gamana-500 mt-0.5">{narrator.name} · {narrator.style}</p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-muted">{elapsed}:{String(Math.round((progress / 100) * story.duration_seconds % 60)).padStart(2, '0')}</span>
            <div className="flex-1 h-1 bg-surface-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gamana-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] text-muted">{duration}m</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onTogglePlay}
            className="w-11 h-11 rounded-full bg-gamana-500 flex items-center justify-center text-white shadow-md shadow-gamana-500/20 active:scale-95 transition-transform"
          >
            {isPlaying ? <Pause size={18} fill="white" /> : <Play size={18} fill="white" className="ml-0.5" />}
          </button>
          <button
            onClick={onSkip}
            className="w-9 h-9 rounded-full bg-surface-muted flex items-center justify-center text-secondary hover:bg-surface-muted transition-colors active:scale-95"
          >
            <SkipForward size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TourAudioPlayer(props: TourAudioPlayerProps) {
  if (props.mini) {
    return <MiniPlayer {...props} />;
  }
  return <FullPlayer {...props} />;
}
