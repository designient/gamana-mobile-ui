import { useState, useCallback, useMemo } from 'react';
import { Ticket } from 'lucide-react';
import type { LibraryTab, Story, Narrator, CityPack, UserTour } from '../../types';
import { BENGALURU_CITY_ID, STORY_COIN_COST } from '../../lib/constants';
import { getContentAccess } from '../../lib/localDb';
import { useConnectivity } from '../../hooks/useConnectivity';
import { useLocation } from '../../hooks/useLocation';
import { useNearbyStories } from '../../hooks/useNearbyStories';
import { useCityPacks as useCityPacksData } from '../../hooks/useCityPacks';
import { useTopics } from '../../hooks/useTopics';
import { useUserTours } from '../../hooks/useUserTours';

import StatusBar from '../layout/StatusBar';
import HeaderBar from '../layout/HeaderBar';
import BottomTabBar from '../layout/BottomTabBar';
import MiniPlayer from '../overlays/MiniPlayer';
import OfflineBanner from '../overlays/OfflineBanner';
import UnlockSheet from '../overlays/UnlockSheet';
import InsufficientBalanceSheet from '../overlays/InsufficientBalanceSheet';
import TourDetailSheet from '../overlays/TourDetailSheet';
import TourPreviewSheet from '../overlays/TourPreviewSheet';
import LibraryTabSwitcher from './LibraryTabSwitcher';
import NearbySection from './NearbySection';
import StoriesToolbar, { type StoryFilter, type StorySort, type RadiusOption } from './StoriesToolbar';
import ToursTabContent from './ToursTabContent';
import GoDeeperSection from './GoDeeperSection';
import DownloadsSection from './DownloadsSection';
import ConnectivityStrip from '../shared/ConnectivityStrip';

interface LibraryScreenProps {
  currentNarrator: Narrator | null;
  player: {
    currentStory: Story | null;
    isPlaying: boolean;
    progress: number;
    playStory: (story: Story, narrator: Narrator | null) => void;
    togglePlay: () => void;
  };
  coinBalance: number;
  onNavigateToStory: (storyId: string) => void;
  onNavigateHome: () => void;
  onNavigateToCoins: () => void;
  onNavigateToCreateTour: () => void;
  onTabChange: (tab: 'home' | 'library' | 'search' | 'profile' | 'alerts') => void;
  onBalanceChange: (newBalance: number) => void;
  onStartWalkingTour?: (tourType: 'recommended' | 'user', tourId: string) => void;
  onNavigateToExperiencesExplore?: () => void;
}

function generateShareCode(): string {
  const chars = 'abcdefghijkmnpqrstuvwxyz23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export default function LibraryScreen({
  currentNarrator,
  player,
  coinBalance,
  onNavigateToStory,
  onNavigateHome,
  onNavigateToCoins,
  onNavigateToCreateTour,
  onTabChange,
  onBalanceChange,
  onStartWalkingTour,
  onNavigateToExperiencesExplore,
}: LibraryScreenProps) {
  const [activeTab, setActiveTab] = useState<LibraryTab>('nearby');
  const [unlockPack, setUnlockPack] = useState<CityPack | null>(null);
  const [unlockStory, setUnlockStory] = useState<Story | null>(null);
  const [previewTour, setPreviewTour] = useState<CityPack | null>(null);
  const [showInsufficientBalance, setShowInsufficientBalance] = useState(false);
  const [insufficientCost, setInsufficientCost] = useState(0);
  const [selectedTour, setSelectedTour] = useState<UserTour | null>(null);

  const [storySearch, setStorySearch] = useState('');
  const [storyRadius, setStoryRadius] = useState<RadiusOption>(10000);
  const [storyFilter, setStoryFilter] = useState<StoryFilter>('all');
  const [storySort, setStorySort] = useState<StorySort>('nearest');

  const { isOnline } = useConnectivity();
  const location = useLocation();

  const nearbyRadius = storyRadius ?? 999_999_999;
  const { stories: rawNearbyStories, isLoading: nearbyLoading } = useNearbyStories(location.lat, location.lng, nearbyRadius);

  const filteredStories = useMemo(() => {
    let stories = [...rawNearbyStories];

    if (storySearch.trim()) {
      const words = storySearch.toLowerCase().split(/\s+/);
      stories = stories.filter((s) => {
        const hay = `${s.title} ${s.subtitle}`.toLowerCase();
        return words.every((w) => hay.includes(w));
      });
    }

    switch (storyFilter) {
      case 'featured':
        stories = stories.filter((s) => s.is_featured);
        break;
      case 'verified':
        stories = stories.filter((s) => s.trust_level === 'verified');
        break;
      case 'legend':
        stories = stories.filter((s) => s.trust_level === 'legend');
        break;
      case 'unlocked': {
        stories = stories.filter((s) => {
          const access = getContentAccess('story', s.id);
          return access.is_unlocked && !access.is_expired;
        });
        break;
      }
      case 'short':
        stories = stories.filter((s) => s.duration_seconds < 300);
        break;
      case 'long':
        stories = stories.filter((s) => s.duration_seconds >= 300);
        break;
    }

    switch (storySort) {
      case 'farthest':
        stories.sort((a, b) => (b.distance_meters ?? 0) - (a.distance_meters ?? 0));
        break;
      case 'duration_asc':
        stories.sort((a, b) => a.duration_seconds - b.duration_seconds);
        break;
      case 'duration_desc':
        stories.sort((a, b) => b.duration_seconds - a.duration_seconds);
        break;
      case 'newest':
        stories.sort((a, b) => b.created_at.localeCompare(a.created_at));
        break;
      default:
        stories.sort((a, b) => (a.distance_meters ?? 0) - (b.distance_meters ?? 0));
    }

    return stories;
  }, [rawNearbyStories, storySearch, storyFilter, storySort]);
  const { packs, isLoading: packsLoading } = useCityPacksData(BENGALURU_CITY_ID);
  const { topics, isLoading: topicsLoading } = useTopics(BENGALURU_CITY_ID);
  const { tours: userTours, isLoading: userToursLoading, deleteTour, updateTour } = useUserTours(BENGALURU_CITY_ID);

  const handlePlayStory = useCallback((story: Story) => {
    if (player.currentStory?.id === story.id) {
      player.togglePlay();
    } else {
      player.playStory(story, currentNarrator);
    }
  }, [player, currentNarrator]);

  const handleUnlockStory = useCallback((story: Story) => {
    console.info('unlock_sheet_shown', {
      item_type: 'story',
      item_id: story.id,
      cost: STORY_COIN_COST,
      balance: coinBalance,
    });
    setUnlockStory(story);
  }, [coinBalance]);

  const handleStoryUnlocked = useCallback((newBalance: number) => {
    onBalanceChange(newBalance);
    if (unlockStory) {
      setTimeout(() => {
        player.playStory(unlockStory, currentNarrator);
      }, 1600);
    }
  }, [onBalanceChange, unlockStory, player, currentNarrator]);

  const handleEmptyAction = useCallback((targetTab?: LibraryTab) => {
    if (targetTab) {
      setActiveTab(targetTab);
    } else {
      setActiveTab('nearby');
    }
  }, []);

  const handleTapPack = useCallback((packId: string) => {
    const pack = packs.find((p) => p.id === packId);
    if (!pack) return;
    setPreviewTour(pack);
  }, [packs]);

  const handlePackUnlocked = useCallback((newBalance: number) => {
    onBalanceChange(newBalance);
  }, [onBalanceChange]);

  const handleToggleShare = useCallback(async (tourId: string, isShared: boolean) => {
    const tour = userTours.find((t) => t.id === tourId);
    const shareCode = isShared
      ? (tour?.share_code || generateShareCode())
      : tour?.share_code ?? null;

    const updated = await updateTour(tourId, { is_shared: isShared, share_code: shareCode });
    if (updated) setSelectedTour(updated);
    return updated;
  }, [userTours, updateTour]);

  const handleDeleteTour = useCallback(async (tourId: string) => {
    await deleteTour(tourId);
    setSelectedTour(null);
  }, [deleteTour]);

  return (
    <div className="relative flex flex-col h-full">
      <StatusBar />
      <HeaderBar locationName="Bengaluru" coinBalance={coinBalance} onCoinsTap={onNavigateToCoins} />
      <ConnectivityStrip />
      {!isOnline && <OfflineBanner />}

      <LibraryTabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

      {onNavigateToExperiencesExplore && (
        <div className="px-4 pt-3 pb-1">
          <button
            type="button"
            onClick={onNavigateToExperiencesExplore}
            className="w-full flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-gamana-500/15 to-gamana-500/5 border border-gamana-200 text-left active:scale-[0.99] transition-transform"
          >
            <div className="w-10 h-10 rounded-xl bg-gamana-500 flex items-center justify-center flex-shrink-0">
              <Ticket size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-heading">Book experiences</p>
              <p className="text-xs text-muted">Guided tours, workshops &amp; tickets in Bengaluru</p>
            </div>
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto scrollbar-hide pb-32">
        {activeTab === 'nearby' && (
          <>
            <StoriesToolbar
              searchQuery={storySearch}
              onSearchChange={setStorySearch}
              selectedRadius={storyRadius}
              onRadiusChange={setStoryRadius}
              activeFilter={storyFilter}
              onFilterChange={setStoryFilter}
              sortBy={storySort}
              onSortChange={setStorySort}
            />
            <NearbySection
              stories={filteredStories}
              isLoading={nearbyLoading}
              currentPlayingId={player.currentStory?.id ?? null}
              isPlaying={player.isPlaying}
              onPlayStory={handlePlayStory}
              onTapStory={onNavigateToStory}
              onEmptyAction={() => handleEmptyAction('tours')}
            />
          </>
        )}

        {activeTab === 'tours' && (
          <ToursTabContent
            userTours={userTours}
            userToursLoading={userToursLoading}
            recommendedPacks={packs}
            packsLoading={packsLoading}
            onCreateTour={onNavigateToCreateTour}
            onTapUserTour={setSelectedTour}
            onDeleteTour={handleDeleteTour}
            onTapRecommendedPack={handleTapPack}
          />
        )}

        {activeTab === 'topics' && (
          <GoDeeperSection
            topics={topics}
            isLoading={topicsLoading}
            onTapTopic={(topicId) => {
              console.info('topic_tapped', { topicId });
            }}
            onTapStory={onNavigateToStory}
            onPlayStory={handlePlayStory}
            onUnlockStory={handleUnlockStory}
            currentPlayingId={player.currentStory?.id ?? null}
            isPlaying={player.isPlaying}
            onEmptyAction={() => handleEmptyAction('nearby')}
          />
        )}

        {activeTab === 'downloads' && (
          <DownloadsSection onNavigateToStory={onNavigateToStory} />
        )}
      </div>

      {player.currentStory && (
        <div className="absolute bottom-16 left-0 right-0 z-30">
          <MiniPlayer
            story={player.currentStory}
            narrator={currentNarrator}
            isPlaying={player.isPlaying}
            progress={player.progress}
            onTogglePlay={player.togglePlay}
          />
        </div>
      )}

      <div className="sticky bottom-0 z-20">
        <BottomTabBar
          activeTab="library"
          onTabChange={onTabChange}
        />
      </div>

      <TourPreviewSheet
        isOpen={!!previewTour}
        onClose={() => setPreviewTour(null)}
        tour={previewTour}
        onUnlockTap={(tour) => {
          setUnlockPack(tour);
        }}
        onStartTour={(tourId) => {
          onStartWalkingTour?.('recommended', tourId);
        }}
      />

      <UnlockSheet
        isOpen={!!unlockPack}
        onClose={() => setUnlockPack(null)}
        itemType="pack"
        pack={unlockPack}
        coinCost={unlockPack?.coin_cost ?? 10}
        userBalance={coinBalance}
        onUnlocked={handlePackUnlocked}
        onInsufficientBalance={() => {
          const cost = unlockPack?.coin_cost ?? 10;
          setUnlockPack(null);
          setInsufficientCost(cost);
          setShowInsufficientBalance(true);
        }}
      />

      <UnlockSheet
        isOpen={!!unlockStory}
        onClose={() => setUnlockStory(null)}
        itemType="story"
        story={unlockStory}
        coinCost={STORY_COIN_COST}
        userBalance={coinBalance}
        onUnlocked={handleStoryUnlocked}
        onInsufficientBalance={() => {
          setUnlockStory(null);
          setInsufficientCost(STORY_COIN_COST);
          setShowInsufficientBalance(true);
        }}
      />

      <InsufficientBalanceSheet
        isOpen={showInsufficientBalance}
        onClose={() => setShowInsufficientBalance(false)}
        currentBalance={coinBalance}
        requiredCost={insufficientCost}
        onNavigateToCoins={onNavigateToCoins}
      />

      <TourDetailSheet
        isOpen={!!selectedTour}
        onClose={() => setSelectedTour(null)}
        tour={selectedTour}
        onDeleteTour={handleDeleteTour}
        onToggleShare={handleToggleShare}
        onNavigateToStory={(storyId) => {
          setSelectedTour(null);
          onNavigateToStory(storyId);
        }}
        onStartWalkingTour={(tourId) => {
          setSelectedTour(null);
          onStartWalkingTour?.('user', tourId);
        }}
      />
    </div>
  );
}
