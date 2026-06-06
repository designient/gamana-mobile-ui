import { useState, useCallback, useRef, useEffect } from 'react';
import type { Story, Narrator } from '../../types';
import { STORY_COIN_COST } from '../../lib/constants';
import { useStoryDetail } from '../../hooks/useStoryDetail';
import { useRelatedStories } from '../../hooks/useRelatedStories';
import { useStoryNarrations } from '../../hooks/useStoryNarrations';
import { useContentAccess } from '../../hooks/useContentAccess';
import { useConnectivity } from '../../hooks/useConnectivity';
import { useDownloadState } from '../../hooks/useDownloadState';
import StatusBar from '../layout/StatusBar';
import BottomTabBar from '../layout/BottomTabBar';
import MiniPlayer from '../overlays/MiniPlayer';
import NarratorSheet from '../overlays/NarratorSheet';
import UnlockSheet from '../overlays/UnlockSheet';
import InsufficientBalanceSheet from '../overlays/InsufficientBalanceSheet';
import StoryDetailSkeleton from './StoryDetailSkeleton';
import StoryNotFound from './StoryNotFound';
import StoryHero from './StoryHero';
import StoryActionBar from './StoryActionBar';
import TrustCard from './TrustCard';
import NarratorSection from './NarratorSection';
import RelatedSection from './RelatedSection';
import PracticalCues from './PracticalCues';
import ExpiredBanner from './ExpiredBanner';
import OfflineBanner from '../overlays/OfflineBanner';

interface StoryDetailScreenProps {
  storyId: string;
  narrators: Narrator[];
  selectedNarrator: Narrator | null;
  onSelectNarrator: (narrator: Narrator) => void;
  currentPlayingStory: Story | null;
  isPlaying: boolean;
  progress: number;
  coinBalance: number;
  onPlayStory: (story: Story, narrator: Narrator | null) => void;
  onTogglePlay: () => void;
  onBack: () => void;
  onNavigateToStory: (storyId: string) => void;
  onNavigateToCoins: () => void;
  onBalanceChange: (newBalance: number) => void;
}

export default function StoryDetailScreen({
  storyId,
  narrators,
  selectedNarrator,
  onSelectNarrator,
  currentPlayingStory,
  isPlaying,
  progress,
  coinBalance,
  onPlayStory,
  onTogglePlay,
  onBack,
  onNavigateToStory,
  onNavigateToCoins,
  onBalanceChange,
}: StoryDetailScreenProps) {
  const { isOnline } = useConnectivity();
  const { downloadState, startDownload, isDownloaded, isDownloading } = useDownloadState('story', storyId);
  const { story, sources, notices, practicalCues, isLoading } = useStoryDetail(storyId);
  const { related } = useRelatedStories(storyId);
  const { narrations } = useStoryNarrations(storyId);
  const { access, refresh: refreshAccess } = useContentAccess('story', storyId);
  const [narratorSheetOpen, setNarratorSheetOpen] = useState(false);
  const [showUnlockSheet, setShowUnlockSheet] = useState(false);
  const [showInsufficientBalance, setShowInsufficientBalance] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentNarrator = selectedNarrator ?? narrators[0] ?? null;
  const isCurrentStory = currentPlayingStory?.id === story?.id;

  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  }, [storyId]);

  const handlePlay = useCallback(() => {
    if (!story) return;
    if (isCurrentStory) {
      onTogglePlay();
      return;
    }
    if (access.is_unlocked) {
      onPlayStory(story, currentNarrator);
    } else {
      console.info('unlock_sheet_shown', {
        item_type: 'story',
        item_id: story.id,
        cost: STORY_COIN_COST,
        balance: coinBalance,
      });
      setShowUnlockSheet(true);
    }
  }, [story, isCurrentStory, access, onTogglePlay, onPlayStory, currentNarrator, coinBalance]);

  const handleNarratorSelect = useCallback((narrator: Narrator) => {
    onSelectNarrator(narrator);
    setNarratorSheetOpen(false);
  }, [onSelectNarrator]);

  const handleUnlocked = useCallback((newBalance: number) => {
    onBalanceChange(newBalance);
    refreshAccess();
    if (story) {
      setTimeout(() => {
        onPlayStory(story, currentNarrator);
      }, 1600);
    }
  }, [onBalanceChange, refreshAccess, story, onPlayStory, currentNarrator]);

  const handleReUnlock = useCallback(() => {
    console.info('re_unlock_started', {
      item_type: 'story',
      item_id: storyId,
      cost: STORY_COIN_COST,
    });
    setShowUnlockSheet(true);
  }, [storyId]);

  return (
    <div className="relative flex flex-col h-full animate-slide-in-right">
      <StatusBar />
      {!isOnline && <OfflineBanner />}

      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-hide pb-32">
        {isLoading ? (
          <StoryDetailSkeleton />
        ) : !story ? (
          <StoryNotFound onBack={onBack} />
        ) : (
          <>
            <StoryHero story={story} onBack={onBack} />

            {/* Download / Offline status banner */}
            <div className="mx-4 mt-3">
              {isDownloaded ? (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0"><circle cx="7" cy="7" r="7" fill="#10b981"/><path d="M4 7l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span className="text-xs font-medium text-emerald-700">Available offline</span>
                  {!isOnline && <span className="ml-auto text-[10px] text-emerald-500 font-medium">Playing from device</span>}
                </div>
              ) : isDownloading ? (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gamana-50 dark:bg-gamana-900/20 border border-gamana-100">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-gamana-300 border-t-gamana-600 animate-spin flex-shrink-0" />
                  <span className="text-xs font-medium text-body">Downloading for offline...</span>
                  {downloadState.progress > 0 && (
                    <span className="ml-auto text-[10px] text-gamana-500 font-medium">{Math.round(downloadState.progress)}%</span>
                  )}
                </div>
              ) : !isOnline ? (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-alt border border-border-default">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0"><circle cx="7" cy="7" r="7" fill="#9ca3af"/><path d="M5 5l4 4M9 5l-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  <span className="text-xs font-medium text-secondary">Not downloaded — requires connection</span>
                </div>
              ) : access.is_unlocked && !isDownloaded ? (
                <button
                  onClick={() => startDownload()}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gamana-50 dark:bg-gamana-900/20 border border-gamana-100 w-full text-left hover:bg-gamana-100 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0"><circle cx="7" cy="7" r="7" fill="#1a5f7a" opacity="0.15"/><path d="M7 4v4M5 7l2 2 2-2M4.5 10.5h5" stroke="#1a5f7a" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span className="text-xs font-medium text-body">Download for offline listening</span>
                </button>
              ) : null}
            </div>

            {access.is_expired && (
              <ExpiredBanner cost={STORY_COIN_COST} onReUnlock={handleReUnlock} />
            )}

            <StoryActionBar
              story={story}
              isPlaying={isPlaying}
              isCurrentStory={isCurrentStory}
              access={access}
              onPlay={handlePlay}
            />

            <TrustCard
              story={story}
              sources={sources}
              notices={notices}
            />

            <NarratorSection
              narrator={currentNarrator}
              narrations={narrations}
              onChangeLens={() => setNarratorSheetOpen(true)}
            />

            <RelatedSection
              related={related}
              onNavigateToStory={onNavigateToStory}
            />

            <PracticalCues cues={practicalCues} />

            <div className="h-8" />
          </>
        )}
      </div>

      {currentPlayingStory && (
        <div className="absolute bottom-16 left-0 right-0 z-30">
          <MiniPlayer
            story={currentPlayingStory}
            narrator={currentNarrator}
            isPlaying={isPlaying}
            progress={progress}
            onTogglePlay={onTogglePlay}
          />
        </div>
      )}

      <div className="sticky bottom-0 z-20">
        <BottomTabBar />
      </div>

      <NarratorSheet
        narrators={narrators}
        selectedId={currentNarrator?.id ?? null}
        isOpen={narratorSheetOpen}
        onSelect={handleNarratorSelect}
        onClose={() => setNarratorSheetOpen(false)}
      />

      <UnlockSheet
        isOpen={showUnlockSheet}
        onClose={() => setShowUnlockSheet(false)}
        itemType="story"
        story={story}
        coinCost={STORY_COIN_COST}
        userBalance={coinBalance}
        onUnlocked={handleUnlocked}
        onInsufficientBalance={() => {
          setShowUnlockSheet(false);
          setShowInsufficientBalance(true);
        }}
      />

      <InsufficientBalanceSheet
        isOpen={showInsufficientBalance}
        onClose={() => setShowInsufficientBalance(false)}
        currentBalance={coinBalance}
        requiredCost={STORY_COIN_COST}
        onNavigateToCoins={onNavigateToCoins}
      />
    </div>
  );
}
