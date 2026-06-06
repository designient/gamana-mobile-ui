import { Headphones, Coins } from 'lucide-react';
import type { Story } from '../../types';
import { STORY_COIN_COST } from '../../lib/constants';

interface NearbyUnlocksProps {
  stories: Story[];
  onTapStory: (storyId: string) => void;
}

export default function NearbyUnlocks({ stories, onTapStory }: NearbyUnlocksProps) {
  const displayStories = stories.slice(0, 5);
  if (displayStories.length === 0) return null;

  return (
    <div className="px-5 pt-2">
      <h3 className="text-sm font-semibold text-heading mb-3 px-1">Unlock nearby</h3>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
        {displayStories.map((story) => (
          <button
            key={story.id}
            onClick={() => onTapStory(story.id)}
            className="flex-shrink-0 w-32 rounded-2xl bg-surface shadow-card overflow-hidden transition-all hover:shadow-elevated active:scale-[0.97]"
          >
            <div className="relative h-20">
              {story.image_url ? (
                <img src={story.image_url} alt={story.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gamana-100 dark:bg-gamana-800/30" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-black/30 backdrop-blur-sm">
                <Coins size={9} className="text-amber-400" />
                <span className="text-[9px] font-semibold text-white">{STORY_COIN_COST}</span>
              </div>
            </div>
            <div className="p-2.5">
              <p className="text-[11px] font-semibold text-heading leading-tight line-clamp-2">{story.title}</p>
              <div className="flex items-center gap-1 mt-1.5">
                <Headphones size={9} className="text-gamana-400" />
                <span className="text-[9px] text-gamana-500">{Math.round(story.duration_seconds / 60)} min</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
