import { useState, useMemo, useCallback } from 'react';
import type { QuickMode, Narrator, Story, ModeContent, CityPack } from '../../types';
import { BENGALURU_CITY_ID, STORY_COIN_COST } from '../../lib/constants';
import { cityPacks } from '../../lib/seed-data';
import { useLocation } from '../../hooks/useLocation';
import { useNearbyStories } from '../../hooks/useNearbyStories';
import { useModeContent } from '../../hooks/useModeContent';
import { useContentAccess } from '../../hooks/useContentAccess';
import { useConnectivity } from '../../hooks/useConnectivity';
import StatusBar from '../layout/StatusBar';
import HeaderBar from '../layout/HeaderBar';
import BottomTabBar from '../layout/BottomTabBar';
import HeroCard from './HeroCard';
import EmptyState from './EmptyState';
import RecommendedTours from './RecommendedTours';
import ExperiencesToBookSection from '../experiences/ExperiencesToBookSection';
import ExploreCityGrid from './ExploreCityGrid';
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
import FamilySafetyCard from './FamilySafetyCard';
import { useUpcomingBookings } from '../../hooks/useUpcomingBookings';
import { experienceSeedData } from '../../lib/experience-seed-data';
import DayOfExperienceCard from '../experiences/confidence/DayOfExperienceCard';
import UpcomingExperienceCard from '../experiences/confidence/UpcomingExperienceCard';

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
  onNavigateToPreExperienceBrief?: (bookingId: string) => void;
  onNavigateToMeetingPoint?: (bookingId: string) => void;
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
  onNavigateToPreExperienceBrief,
  onNavigateToMeetingPoint,
  forceEmpty = false,
}: HomeScreenProps) {
  const { daysBefore, tomorrow, today } = useUpcomingBookings();
  const { isOnline } = useConnectivity();
  const location = useLocation();
  const { stories, isLoading: storiesLoading } = useNearbyStories(location.lat, location.lng);

  const [activeMode, setActiveMode] = useState<QuickMode | null>('nearby');
  const [narratorSheetOpen, setNarratorSheetOpen] = useState(false);
  const [previewTour, setPreviewTour] = useState<CityPack | null>(null);
  const [unlockStory, setUnlockStory] = useState<Story | null>(null);
  const [unlockPack, setUnlockPack] = useState<CityPack | null>(null);
  const [showInsufficientBalance, setShowInsufficientBalance] = useState(false);
  const [showGuide, setShowGuide] = useState(true);

  const { content: modeContent } = useModeContent(BENGALURU_CITY_ID, activeMode);

  const featuredStory = useMemo(() => {
    return stories.find((s) => s.is_featured) ?? stories[0] ?? null;
  }, [stories]);

  const { access: heroAccess } = useContentAccess('story', featuredStory?.id ?? null);

  const hasNearbyStories = !forceEmpty && stories.length > 0;
  const isCurrentHeroPlaying = player.currentStory?.id === featuredStory?.id;

  const handlePlayHero = useCallback(() => {
    if (!featuredStory) return;
    if (isCurrentHeroPlaying) {
      player.togglePlay();
      return;
    }
    if (heroAccess.is_unlocked) {
      player.playStory(featuredStory, currentNarrator);
    } else {
      console.info('unlock_sheet_shown', {
        item_type: 'story',
        item_id: featuredStory.id,
        cost: STORY_COIN_COST,
        balance: coinBalance,
      });
      setUnlockStory(featuredStory);
    }
  }, [featuredStory, isCurrentHeroPlaying, heroAccess, player, currentNarrator, coinBalance]);

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
        {!forceEmpty &&
          today &&
          onNavigateToPreExperienceBrief &&
          onNavigateToMeetingPoint && (() => {
            const exp = experienceSeedData.find((e) => e.id === today.booking.experienceId);
            if (!exp) return null;
            return (
              <DayOfExperienceCard
                booking={today.booking}
                experience={exp}
                onOpenBrief={() => onNavigateToPreExperienceBrief(today.booking.id)}
                onOpenMeetingPoint={() => onNavigateToMeetingPoint(today.booking.id)}
              />
            );
          })()}

        {!forceEmpty && storiesLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-10 h-10 rounded-full border-2 border-gamana-200 border-t-gamana-500 animate-spin" />
            <p className="text-sm text-muted mt-3">Finding stories near you...</p>
          </div>
        ) : hasNearbyStories ? (
          <HeroCard
            story={featuredStory}
            narrator={currentNarrator}
            isPlaying={player.isPlaying}
            isCurrentStory={isCurrentHeroPlaying}
            onPlay={handlePlayHero}
            onNarratorTap={() => setNarratorSheetOpen(true)}
            onTapDetail={() => featuredStory && onNavigateToStory(featuredStory.id)}
          />
        ) : (
          <EmptyState
            onExploreCities={onNavigateToExploreCities}
            onSearch={() => onTabChange('search')}
            onRequestStory={onNavigateToRequestStory}
          />
        )}

        <RecommendedTours
          tours={cityPacks}
          onPreviewTour={setPreviewTour}
        />

        {!forceEmpty &&
          tomorrow &&
          onNavigateToPreExperienceBrief && (() => {
            const exp = experienceSeedData.find((e) => e.id === tomorrow.booking.experienceId);
            if (!exp) return null;
            return (
              <UpcomingExperienceCard
                booking={tomorrow.booking}
                experience={exp}
                variant="tomorrow"
                onGetReady={() => onNavigateToPreExperienceBrief(tomorrow.booking.id)}
              />
            );
          })()}

        {!forceEmpty &&
          daysBefore &&
          onNavigateToPreExperienceBrief && (() => {
            const exp = experienceSeedData.find((e) => e.id === daysBefore.booking.experienceId);
            if (!exp) return null;
            return (
              <UpcomingExperienceCard
                booking={daysBefore.booking}
                experience={exp}
                variant="7days"
                daysUntil={daysBefore.daysUntil}
                onGetReady={() => onNavigateToPreExperienceBrief(daysBefore.booking.id)}
              />
            );
          })()}

        {onNavigateToExperiencesExplore && onNavigateToExperienceDetail && (
          <ExperiencesToBookSection
            onSeeAll={() => onNavigateToExperiencesExplore()}
            onOpenExperience={onNavigateToExperienceDetail}
          />
        )}

        {onNavigateToFamilyTracking && onOpenSOS && (
          <FamilySafetyCard
            onNavigateToFamilyTracking={onNavigateToFamilyTracking}
            onOpenSOS={onOpenSOS}
          />
        )}

        {!forceEmpty && onNavigateToExperiencesExplore && (
          <ExploreCityGrid
            activeMode={activeMode}
            onModeSelect={(mode) => setActiveMode(mode)}
            onNavigateToExperiencesExplore={onNavigateToExperiencesExplore}
          />
        )}

        {!forceEmpty && (
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
