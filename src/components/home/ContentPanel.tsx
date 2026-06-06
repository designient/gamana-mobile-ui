import { useState } from 'react';
import type { QuickMode, Story, ModeContent } from '../../types';
import { MODE_LABELS } from '../../lib/constants';
import { List, Map } from 'lucide-react';
import ContentCard from './ContentCard';
import StoryMapView from './StoryMapView';

interface ContentPanelProps {
  activeMode: QuickMode | null;
  stories: Story[];
  modeContent: ModeContent[];
  currentPlayingId: string | null;
  isPlaying: boolean;
  onPlayStory: (story: Story) => void;
  onPlayContent: (content: ModeContent) => void;
  onTapStoryDetail?: (story: Story) => void;
  /** When true and mode is nearby, always show "Nearby Stories" as section title */
  pinNearbyTitle?: boolean;
}

export default function ContentPanel({
  activeMode,
  stories,
  modeContent,
  currentPlayingId,
  isPlaying,
  onPlayStory,
  onPlayContent,
  onTapStoryDetail,
  pinNearbyTitle = false,
}: ContentPanelProps) {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const showStories = !activeMode || activeMode === 'nearby';
  const title =
    pinNearbyTitle && (!activeMode || activeMode === 'nearby')
      ? 'Nearby Stories'
      : activeMode
        ? MODE_LABELS[activeMode]
        : 'Nearby Stories';

  return (
    <div className="px-4 mt-5 pb-4">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-sm font-semibold text-heading">{title}</h3>
        {showStories && (
          <div className="flex items-center bg-surface-muted/80 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-surface shadow-sm text-heading' : 'text-muted hover:text-secondary'}`}
            >
              <List size={14} />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'map' ? 'bg-surface shadow-sm text-heading' : 'text-muted hover:text-secondary'}`}
            >
              <Map size={14} />
            </button>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2.5">
        {showStories ? (
          viewMode === 'map' ? (
            <StoryMapView stories={stories} />
          ) : stories.length > 0 ? (
            stories.map((story) => (
              <ContentCard
                key={story.id}
                type="story"
                data={story}
                isPlaying={isPlaying && currentPlayingId === story.id}
                onPlay={() => onPlayStory(story)}
                onTapDetail={onTapStoryDetail ? () => onTapStoryDetail(story) : undefined}
              />
            ))
          ) : (
            <div className="text-center py-8 text-muted text-sm">
              No stories found nearby
            </div>
          )
        ) : (
          modeContent.length > 0 ? (
            modeContent.map((content) => (
              <ContentCard
                key={content.id}
                type="mode_content"
                data={content}
                isPlaying={isPlaying && currentPlayingId === content.id}
                onPlay={() => onPlayContent(content)}
              />
            ))
          ) : (
            <div className="text-center py-8 text-muted text-sm">
              Content coming soon for this mode
            </div>
          )
        )}
      </div>
    </div>
  );
}
