import { ChevronUp, WifiOff } from 'lucide-react';
import type { Story, Narrator } from '../../types';
import PlayButton from '../shared/PlayButton';
import AudioWave from '../shared/AudioWave';
import { useDownloadState } from '../../hooks/useDownloadState';
import { useConnectivity } from '../../hooks/useConnectivity';

interface MiniPlayerProps {
  story: Story;
  narrator: Narrator | null;
  isPlaying: boolean;
  progress: number;
  onTogglePlay: () => void;
}

export default function MiniPlayer({ story, narrator, isPlaying, progress, onTogglePlay }: MiniPlayerProps) {
  const { isDownloaded } = useDownloadState('story', story.id);
  const { isOnline } = useConnectivity();
  const playingOffline = !isOnline && isDownloaded;

  return (
    <div className="animate-slide-up">
      <div className="mx-3 mb-1 rounded-2xl bg-surface/95 backdrop-blur-md shadow-player overflow-hidden">
        <div className="h-0.5 bg-surface-muted">
          <div
            className="h-full bg-gamana-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center gap-3 px-3 py-2.5">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
            {story.image_url ? (
              <img src={story.image_url} alt={story.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gamana-100" />
            )}
            {isDownloaded && (
              <div className="absolute bottom-0 right-0 w-4 h-4 rounded-tl-md bg-emerald-500 flex items-center justify-center">
                <svg width="8" height="8" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-medium text-heading truncate">{story.title}</h4>
              {isPlaying && <AudioWave />}
            </div>
            <div className="flex items-center gap-1.5">
              <p className="text-[11px] text-muted truncate">
                {narrator?.name ?? 'Narrator'}
              </p>
              {playingOffline && (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-medium text-muted bg-surface-muted px-1.5 py-0.5 rounded-full">
                  <WifiOff size={8} /> Offline
                </span>
              )}
            </div>
          </div>

          <PlayButton size="sm" isPlaying={isPlaying} onClick={onTogglePlay} />
          <ChevronUp size={18} className="text-faint flex-shrink-0" />
        </div>
      </div>
    </div>
  );
}
