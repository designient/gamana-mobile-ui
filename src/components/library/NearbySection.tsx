import { BookOpen, Navigation, Headphones } from 'lucide-react';
import type { Story } from '../../types';
import NearbyHeroCard from './NearbyHeroCard';
import NearbyStoryRow from './NearbyStoryRow';
import LibraryEmptyState from './LibraryEmptyState';

interface NearbySectionProps {
  stories: Story[];
  isLoading: boolean;
  currentPlayingId: string | null;
  isPlaying: boolean;
  onPlayStory: (story: Story) => void;
  onTapStory: (storyId: string) => void;
  onEmptyAction: () => void;
}

export default function NearbySection({
  stories,
  isLoading,
  currentPlayingId,
  isPlaying,
  onPlayStory,
  onTapStory,
  onEmptyAction,
}: NearbySectionProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-2 border-gamana-100" />
          <div className="absolute inset-0 rounded-full border-2 border-gamana-500 border-t-transparent animate-spin" />
          <Headphones size={20} className="absolute inset-0 m-auto text-gamana-400" />
        </div>
        <p className="text-sm text-gamana-600/70 mt-4 font-medium">Finding stories near you...</p>
      </div>
    );
  }

  if (stories.length === 0) {
    return <LibraryEmptyState tab="nearby" onAction={onEmptyAction} />;
  }

  const [heroStory, ...restStories] = stories;

  return (
    <div className="animate-fade-in">
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gamana-500/10 flex items-center justify-center">
            <BookOpen size={13} className="text-gamana-500" />
          </div>
          <span className="text-xs font-semibold text-body tracking-wide uppercase">
            Stories
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-gamana-500/70 font-medium">
          <Navigation size={11} />
          {stories.length} {stories.length === 1 ? 'story' : 'stories'}
        </div>
      </div>

      <NearbyHeroCard
        story={heroStory}
        isPlaying={isPlaying && currentPlayingId === heroStory.id}
        onPlay={() => onPlayStory(heroStory)}
        onTap={() => onTapStory(heroStory.id)}
      />

      {restStories.length > 0 && (
        <div className="mt-4 px-4">
          <h3 className="text-xs font-semibold text-body/60 uppercase tracking-wider mb-2.5 px-1">
            More stories
          </h3>
          <div className="flex flex-col gap-2">
            {restStories.map((story) => (
              <NearbyStoryRow
                key={story.id}
                story={story}
                isPlaying={isPlaying && currentPlayingId === story.id}
                onPlay={() => onPlayStory(story)}
                onTap={() => onTapStory(story.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
