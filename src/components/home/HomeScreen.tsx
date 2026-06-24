import { useState, useMemo, useCallback } from 'react';
import type { QuickMode, Narrator, Story, ModeContent, CityPack } from '../../types';
import { BENGALURU_CITY_ID, STORY_COIN_COST } from '../../lib/constants';
import { cityPacks } from '../../lib/seed-data';
import { useLocation } from '../../hooks/useLocation';
import { useNearbyStories } from '../../hooks/useNearbyStories';
import { useModeContent } from '../../hooks/useModeContent';
import { useConnectivity } from '../../hooks/useConnectivity';
import StatusBar from '../layout/StatusBar';
import HeaderBar from '../layout/HeaderBar';
import BottomTabBar from '../layout/BottomTabBar';
import RecommendedTours from './RecommendedTours';
import ExperiencesToBookSection from '../experiences/ExperiencesToBookSection';
import ExploreCityGrid, { type ExploreTabId } from './ExploreCityGrid';
import ContentPanel from './ContentPanel';
import MiniPlayer from '../../components/overlays/MiniPlayer';
import NarratorSheet from '../../components/overlays/NarratorSheet';
import TourPreviewSheet from '../../components/overlays/TourPreviewSheet';
import UnlockSheet from '../../components/overlays/UnlockSheet';
import InsufficientBalanceSheet from '../../components/overlays/InsufficientBalanceSheet';
import WeakGPSBanner from '../../components/overlays/WeakGPSBanner';
import OfflineBanner from '../overlays/OfflineBanner';
import ConnectivityStrip from '../shared/ConnectivityStrip';
import AppGuideFAB from './AppGuideFAB';
import { experienceSeedData } from '../../lib/experience-seed-data';
import HomeAlertCard from './HomeAlertCard';
import TodaysBestPickSlider from './TodaysBestPickSlider';
import { HOME_ALERTS, getUnreadAlertCount } from '../../lib/home-alerts';

interface HomeScreenProps {
  narrators: Narrator[];
  selectedNarrator: Narrator | null;
  onSelectNarrator: (narrator: Narrator) => void;
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
  onNavigateToCoins: () => void;
  onNavigateToExploreCities: () => void;
  onNavigateToRequestStory: () => void;
  onTabChange: (tab: 'home' | 'library' | 'search' | 'profile' | 'alerts') => void;
  onBalanceChange: (newBalance: number) => void;
  onStartWalkingTour?: (tourType: 'recommended' | 'user', tourId: string) => void;
  onNavigateToFamilyTracking?: () => void;
  onOpenSOS?: () => void;
  onNavigateToExperiencesExplore?: (tab?: 'tours' | 'activities') => void;
  onNavigateToExperienceDetail?: (slug: string) => void;
  forceEmpty?: boolean;
}

export default function HomeScreen({
  narrators,
  onSelectNarrator,
  currentNarrator,
  player,
  coinBalance,
  onNavigateToStory,
  onNavigateToCoins,
  onNavigateToExploreCities,
  onNavigateToRequestStory,
  onTabChange,
  onBalanceChange,
  onStartWalkingTour,
  onNavigateToFamilyTracking,
  onOpenSOS,
  onNavigateToExperiencesExplore,
  onNavigateToExperienceDetail,
  forceEmpty = false,
}: HomeScreenProps) {
  const { isOnline } = useConnectivity();
  const location = useLocation();
  const { stories } = useNearbyStories(location.lat, location.lng);

  const [activeExploreTab, setActiveExploreTab] = useState<ExploreTabId>('nearby');
  const [narratorSheetOpen, setNarratorSheetOpen] = useState(false);
  const [previewTour, setPreviewTour] = useState<CityPack | null>(null);
  const [unlockStory, setUnlockStory] = useState<Story | null>(null);
  const [unlockPack, setUnlockPack] = useState<CityPack | null>(null);
  const [showInsufficientBalance, setShowInsufficientBalance] = useState(false);
  const [showGuide, setShowGuide] = useState(true);

  const activeMode: QuickMode | null =
    activeExploreTab === 'nearby'
      ? 'nearby'
      : activeExploreTab === 'city_facts'
        ? 'quick_facts'
        : activeExploreTab === 'speak_local'
          ? 'languages'
          : null;
  const { content: modeContent } = useModeContent(BENGALURU_CITY_ID, activeMode);

  const featuredStory = useMemo(() => {
    return stories.find((s) => s.is_featured) ?? stories[0] ?? null;
  }, [stories]);

  const hasNearbyStories = !forceEmpty && stories.length > 0;
  const bestPickTour = cityPacks[0] ?? null;
  const bestPickExperience = useMemo(
    () =>
      experienceSeedData.find((item) => item.bookableInApp && item.publicationStatus === 'published') ??
      null,
    [],
  );

  const handlePlayStory = useCallback((story: Story) => {
    if (player.currentStory?.id === story.id) {
      player.togglePlay();
    } else {
      player.playStory(story, currentNarrator);
    }
  }, [player, currentNarrator]);

  const handlePlayContent = useCallback((_content: ModeContent) => {}, []);

  const handleNarratorSelect = useCallback((narrator: Narrator) => {
    onSelectNarrator(narrator);
    setNarratorSheetOpen(false);
  }, [onSelectNarrator]);

  const handleUnlocked = useCallback((newBalance: number) => {
    onBalanceChange(newBalance);
    if (unlockStory) {
      setTimeout(() => {
        player.playStory(unlockStory, currentNarrator);
      }, 1600);
    }
  }, [onBalanceChange, unlockStory, player, currentNarrator]);

  const handlePackUnlocked = useCallback((newBalance: number) => {
    onBalanceChange(newBalance);
    // After unlocking pack, we don't automatically play a story but could do so.
  }, [onBalanceChange]);

  return (
    <div className="relative flex flex-col h-full">
      <StatusBar />
      <HeaderBar locationName="Bengaluru" coinBalance={coinBalance} onCoinsTap={onNavigateToCoins} onLocationTap={onNavigateToExploreCities} />
      <ConnectivityStrip />
      {!isOnline && <OfflineBanner />}

      {location.isWeak && <WeakGPSBanner />}

      <div className="flex-1 overflow-y-auto scrollbar-hide pb-32">
        {!forceEmpty && HOME_ALERTS[0] && (
          <HomeAlertCard
            alert={HOME_ALERTS[0]}
            onOpenAlerts={() => onTabChange('alerts')}
          />
        )}

        {!forceEmpty && onNavigateToExperienceDetail && (
          <TodaysBestPickSlider
            story={hasNearbyStories ? featuredStory : null}
            tour={bestPickTour}
            experience={bestPickExperience}
            onOpenStory={onNavigateToStory}
            onOpenTour={(tourId) => {
              const found = cityPacks.find((item) => item.id === tourId);
              if (found) setPreviewTour(found);
            }}
            onOpenExperience={onNavigateToExperienceDetail}
            onOpenIntro={() => onNavigateToRequestStory()}
          />
        )}

        {!forceEmpty && onNavigateToExperiencesExplore && (
          <ExploreCityGrid
            activeTab={activeExploreTab}
            onTabSelect={setActiveExploreTab}
            onNavigateToExperiencesExplore={onNavigateToExperiencesExplore}
            onNavigateToFamilyTracking={onNavigateToFamilyTracking}
            onOpenSOS={onOpenSOS}
          />
        )}

        {!forceEmpty && activeMode && (
          <ContentPanel
            activeMode={activeMode}
            stories={stories}
            modeContent={modeContent}
            currentPlayingId={player.currentStory?.id ?? null}
            isPlaying={player.isPlaying}
            onPlayStory={handlePlayStory}
            onPlayContent={handlePlayContent}
            onTapStoryDetail={(story) => onNavigateToStory(story.id)}
            pinNearbyTitle
          />
        )}

        <RecommendedTours
          tours={cityPacks}
          onPreviewTour={setPreviewTour}
          onViewAll={() => onNavigateToExperiencesExplore?.('tours')}
        />

        {onNavigateToExperiencesExplore && onNavigateToExperienceDetail && (
          <ExperiencesToBookSection
            onSeeAll={() => onNavigateToExperiencesExplore()}
            onOpenExperience={onNavigateToExperienceDetail}
          />
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
          activeTab="home"
          onTabChange={onTabChange}
          unreadAlertsCount={getUnreadAlertCount()}
        />
      </div>

      {showGuide && (
        <AppGuideFAB
          onDismiss={() => setShowGuide(false)}
        />
      )}

      <NarratorSheet
        narrators={narrators}
        selectedId={currentNarrator?.id ?? null}
        isOpen={narratorSheetOpen}
        onSelect={handleNarratorSelect}
        onClose={() => setNarratorSheetOpen(false)}
      />

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
        isOpen={!!unlockStory}
        onClose={() => setUnlockStory(null)}
        itemType="story"
        story={unlockStory}
        coinCost={STORY_COIN_COST}
        userBalance={coinBalance}
        onUnlocked={handleUnlocked}
        onInsufficientBalance={() => {
          setUnlockStory(null);
          setShowInsufficientBalance(true);
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
          setUnlockPack(null);
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
