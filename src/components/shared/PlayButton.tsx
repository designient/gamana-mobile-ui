import { Play, Pause, Loader2 } from 'lucide-react';

interface PlayButtonProps {
  isPlaying?: boolean;
  isLoading?: boolean;
  size?: 'sm' | 'lg';
  onClick: () => void;
}

export default function PlayButton({ isPlaying, isLoading, size = 'lg', onClick }: PlayButtonProps) {
  const isLarge = size === 'lg';

  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center justify-center rounded-full transition-all active:scale-95
        ${isLarge
          ? 'w-12 h-12 bg-gamana-500 text-white shadow-md hover:bg-gamana-600'
          : 'w-8 h-8 bg-gamana-500/10 text-gamana-500 hover:bg-gamana-500/20'
        }
      `}
    >
      {isLoading ? (
        <Loader2 size={isLarge ? 22 : 15} className="animate-spin" />
      ) : isPlaying ? (
        <Pause size={isLarge ? 22 : 15} fill="currentColor" />
      ) : (
        <Play size={isLarge ? 22 : 15} fill="currentColor" className={isLarge ? 'ml-0.5' : 'ml-px'} />
      )}
    </button>
  );
}
