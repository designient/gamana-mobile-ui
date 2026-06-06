import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Play, Pause, Lock, Flame, Landmark, TreePine, Store, Compass, Clock, type LucideIcon } from 'lucide-react';
import type { Topic, Story } from '../../types';
import { getStoriesByTopic } from '../../lib/localDb';
import { useContentAccess } from '../../hooks/useContentAccess';
import OfflineBadge from '../shared/OfflineBadge';
import TrustChip from '../shared/TrustChip';
import AudioWave from '../shared/AudioWave';
import { useDownloadState } from '../../hooks/useDownloadState';
import LibraryEmptyState from './LibraryEmptyState';

const ICON_MAP: Record<string, LucideIcon> = {
  Flame,
  Landmark,
  TreePine,
  Store,
  Compass,
};

const TOPIC_COLORS = [
  { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600', border: 'border-blue-100', accent: '#3b82f6' },
  { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600', border: 'border-amber-100', accent: '#d97706' },
  { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600', border: 'border-emerald-100', accent: '#059669' },
  { bg: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-600', border: 'border-rose-100', accent: '#e11d48' },
];

interface GoDeeperSectionProps {
  topics: Topic[];
  isLoading: boolean;
  onTapTopic: (topicId: string) => void;
  onTapStory: (storyId: string) => void;
  onPlayStory: (story: Story) => void;
  onUnlockStory: (story: Story) => void;
  currentPlayingId: string | null;
  isPlaying: boolean;
  onEmptyAction: () => void;
}

function TopicStoryRow({
  story,
  index,
  isPlaying,
  onPlay,
  onUnlock,
  onTap,
}: {
  story: Story;
  index: number;
  isPlaying: boolean;
  onPlay: () => void;
  onUnlock: () => void;
  onTap: () => void;
}) {
  const { access } = useContentAccess('story', story.id);
  const { downloadState } = useDownloadState('story', story.id);
  const badgeStatus = downloadState.status === 'ready' ? 'ready' as const : downloadState.status === 'downloading' || downloadState.status === 'queued' ? 'downloading' as const : 'available' as const;
  const mins = Math.round(story.duration_seconds / 60);
  const isLocked = !access.is_unlocked && !access.is_expired;

  const handlePlay = () => {
    if (isLocked) {
      onUnlock();
    } else {
      onPlay();
    }
  };

  return (
    <div className="flex items-center gap-3 py-2.5 px-3">
      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
        isLocked ? 'bg-surface-muted text-muted' : 'bg-gamana-100 text-gamana-600'
      }`}>
        {isLocked ? <Lock size={9} /> : index + 1}
      </span>

      <button onClick={onTap} className="flex-1 min-w-0 text-left">
        <h5 className={`text-[13px] font-medium truncate leading-tight ${isLocked ? 'text-secondary' : 'text-heading'}`}>{story.title}</h5>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="inline-flex items-center gap-0.5 text-[10px] text-muted font-medium">
            <Clock size={9} /> {mins} min
          </span>
          {isLocked ? (
            <span className="text-[10px] text-amber-500 font-medium">Locked</span>
          ) : (
            <>
              <TrustChip level={story.trust_level} />
              <OfflineBadge status={badgeStatus} compact />
              {access.is_expired && (
                <span className="text-[10px] text-red-500 font-medium">Expired</span>
              )}
              {access.days_remaining > 0 && access.days_remaining <= 5 && (
                <span className="text-[10px] text-amber-500 font-medium">{access.days_remaining}d left</span>
              )}
            </>
          )}
        </div>
      </button>

      <button
        onClick={handlePlay}
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-95 flex-shrink-0 ${
          isLocked
            ? 'bg-surface-muted text-muted hover:bg-surface-muted'
            : 'bg-gamana-500/10 text-gamana-600 hover:bg-gamana-500/20'
        }`}
      >
        {isPlaying ? (
          <><Pause size={12} fill="currentColor" /><AudioWave /></>
        ) : isLocked ? (
          <Lock size={12} />
        ) : (
          <Play size={12} fill="currentColor" className="ml-px" />
        )}
      </button>
    </div>
  );
}

function TopicCard({
  topic,
  colorIndex,
  currentPlayingId,
  isPlaying,
  onTapStory,
  onPlayStory,
  onUnlockStory,
}: {
  topic: Topic;
  colorIndex: number;
  currentPlayingId: string | null;
  isPlaying: boolean;
  onTapStory: (storyId: string) => void;
  onPlayStory: (story: Story) => void;
  onUnlockStory: (story: Story) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const color = TOPIC_COLORS[colorIndex % TOPIC_COLORS.length];
  const Icon = ICON_MAP[topic.icon_name] ?? Compass;

  const stories = useMemo(() => {
    if (!expanded) return [];
    return getStoriesByTopic(topic.id);
  }, [expanded, topic.id]);

  return (
    <div className={`rounded-2xl bg-surface shadow-card overflow-hidden transition-all ${expanded ? 'shadow-elevated' : ''}`}>
      <button
        onClick={() => {
          setExpanded(!expanded);
          if (!expanded) {
            console.info('topic_tapped', { topicId: topic.id, topic_title: topic.title });
          }
        }}
        className="flex items-center gap-3 p-4 w-full text-left"
      >
        <div className={`w-11 h-11 rounded-xl ${color.bg} flex items-center justify-center flex-shrink-0`}>
          <Icon size={20} className={color.text} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-[14px] font-semibold text-heading leading-tight">{topic.title}</h4>
          <p className="text-[11px] text-muted mt-0.5 truncate">{topic.subtitle}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[11px] font-medium text-gamana-500 bg-gamana-50 dark:bg-gamana-900/20 px-2 py-0.5 rounded-full">
            {topic.story_count} {topic.story_count === 1 ? 'story' : 'stories'}
          </span>
          {expanded ? (
            <ChevronUp size={16} className="text-muted" />
          ) : (
            <ChevronDown size={16} className="text-muted" />
          )}
        </div>
      </button>

      {expanded && stories.length > 0 && (
        <div className={`border-t ${color.border}`}>
          <div className="divide-y divide-border-subtle">
            {stories.map((story, idx) => (
              <TopicStoryRow
                key={story.id}
                story={story}
                index={idx}
                isPlaying={isPlaying && currentPlayingId === story.id}
                onPlay={() => onPlayStory(story)}
                onUnlock={() => onUnlockStory(story)}
                onTap={() => onTapStory(story.id)}
              />
            ))}
          </div>

          <div className="px-4 py-2.5 bg-canvas/50">
            <p className="text-[10px] text-muted text-center">
              {stories.length} {stories.length === 1 ? 'story' : 'stories'} · ~{Math.round(stories.reduce((a, s) => a + s.duration_seconds, 0) / 60)} min total
            </p>
          </div>
        </div>
      )}

      {expanded && stories.length === 0 && (
        <div className="px-4 py-6 border-t border-border-default text-center">
          <p className="text-xs text-muted">Stories for this topic are coming soon</p>
        </div>
      )}
    </div>
  );
}

export default function GoDeeperSection({
  topics,
  isLoading,
  onTapTopic: _onTapTopic,
  onTapStory,
  onPlayStory,
  onUnlockStory,
  currentPlayingId,
  isPlaying,
  onEmptyAction,
}: GoDeeperSectionProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-10 h-10 rounded-full border-2 border-gamana-200 border-t-gamana-500 animate-spin" />
        <p className="text-sm text-muted mt-3">Loading topics...</p>
      </div>
    );
  }

  if (topics.length === 0) {
    return <LibraryEmptyState tab="topics" onAction={onEmptyAction} />;
  }

  return (
    <div className="px-4 pt-4 animate-fade-in">
      <p className="text-xs text-muted px-1 mb-3">
        Dive into themes that connect the stories around you
      </p>

      <div className="flex flex-col gap-3">
        {topics.map((topic, idx) => (
          <TopicCard
            key={topic.id}
            topic={topic}
            colorIndex={idx}
            currentPlayingId={currentPlayingId}
            isPlaying={isPlaying}
            onTapStory={onTapStory}
            onPlayStory={onPlayStory}
            onUnlockStory={onUnlockStory}
          />
        ))}
      </div>
    </div>
  );
}
