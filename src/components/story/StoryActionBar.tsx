import { useState } from 'react';
import { Play, Pause, Download, Loader2, CheckCircle2, Navigation, Share2, Lock } from 'lucide-react';
import type { Story, ContentAccessStatus } from '../../types';
import { useDownloadState } from '../../hooks/useDownloadState';
import AudioWave from '../shared/AudioWave';
import { AccessTimer } from '../shared/AccessBadge';

interface StoryActionBarProps {
  story: Story;
  isPlaying: boolean;
  isCurrentStory: boolean;
  access: ContentAccessStatus;
  onPlay: () => void;
}

export default function StoryActionBar({ story, isPlaying, isCurrentStory, access, onPlay }: StoryActionBarProps) {
  const [copied, setCopied] = useState(false);
  const { startDownload, isDownloaded, isDownloading } = useDownloadState('story', story.id);

  const playing = isCurrentStory && isPlaying;
  const isLocked = !access.is_unlocked && !access.is_expired;

  const handleDownload = () => {
    if (!access.is_unlocked) return;
    if (isDownloaded || isDownloading) return;
    startDownload();
    console.info('download_tapped', { item_type: 'story', item_id: story.id, surface: 'story_detail' });
  };

  const handleDirections = () => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${story.lat},${story.lng}`,
      '_blank'
    );
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: story.title, text: story.subtitle, url });
      } catch {
        // cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="mx-4 mt-4 bg-surface rounded-2xl shadow-card px-2 py-3">
      {access.is_unlocked && (
        <div className="flex justify-center mb-2">
          <AccessTimer access={access} />
        </div>
      )}

      <div className="flex justify-around">
        <button onClick={onPlay} className="flex flex-col items-center gap-1.5 group">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-md transition-all group-active:scale-95 ${
            isLocked ? 'bg-gamana-400 group-hover:bg-gamana-500' : 'bg-gamana-500 group-hover:bg-gamana-600'
          }`}>
            {playing ? (
              <Pause size={22} fill="currentColor" />
            ) : isLocked ? (
              <div className="flex items-center gap-1">
                <Lock size={14} />
                <Play size={18} fill="currentColor" />
              </div>
            ) : (
              <Play size={22} fill="currentColor" className="ml-0.5" />
            )}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-medium text-body">
              {playing ? 'Playing' : isLocked ? 'Preview' : 'Play'}
            </span>
            {playing && <AudioWave />}
          </div>
        </button>

        <button
          onClick={handleDownload}
          className={`flex flex-col items-center gap-1.5 group ${!access.is_unlocked ? 'opacity-40 pointer-events-none' : ''}`}
        >
          <div className="w-10 h-10 rounded-full border border-gamana-200 flex items-center justify-center transition-all group-active:scale-95 group-hover:border-gamana-300">
            {isDownloading ? (
              <Loader2 size={18} className="text-gamana-500 animate-spin" />
            ) : isDownloaded ? (
              <CheckCircle2 size={18} className="text-safe-success" />
            ) : (
              <Download size={18} className="text-gamana-500" />
            )}
          </div>
          <span className="text-[11px] font-medium text-body">
            {isDownloading ? 'Saving...' : isDownloaded ? 'Saved' : 'Save'}
          </span>
        </button>

        <button onClick={handleDirections} className="flex flex-col items-center gap-1.5 group">
          <div className="w-10 h-10 rounded-full border border-gamana-200 flex items-center justify-center transition-all group-active:scale-95 group-hover:border-gamana-300">
            <Navigation size={18} className="text-gamana-500" />
          </div>
          <span className="text-[11px] font-medium text-body">Directions</span>
        </button>

        <button onClick={handleShare} className="flex flex-col items-center gap-1.5 group">
          <div className="w-10 h-10 rounded-full border border-gamana-200 flex items-center justify-center transition-all group-active:scale-95 group-hover:border-gamana-300">
            <Share2 size={18} className="text-gamana-500" />
          </div>
          <span className="text-[11px] font-medium text-body">
            {copied ? 'Copied!' : 'Share'}
          </span>
        </button>
      </div>
    </div>
  );
}
