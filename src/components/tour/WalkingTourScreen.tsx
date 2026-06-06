import { useCallback } from 'react';
import type { Story, Narrator } from '../../types';
import { useTourSession } from '../../hooks/useTourSession';
import { useBadges } from '../../hooks/useBadges';
import { useConnectivity } from '../../hooks/useConnectivity';
import { cityPacks } from '../../lib/seed-data';
import StatusBar from '../layout/StatusBar';
import TourPrepScreen from './TourPrepScreen';
import WalkingTourActive from './WalkingTourActive';
import TourCompletionSheet from './TourCompletionSheet';

interface WalkingTourScreenProps {
  tourType: 'recommended' | 'user';
  tourId: string;
  narrators: import('../../types').Narrator[];
  currentNarrator: import('../../types').Narrator | null;
  player: import('../../types').PlaybackState & { togglePlay: () => void; playStory: (story: Story, narrator: Narrator | null) => void };
  coinBalance: number;
  onExit: () => void;
  onBalanceChange: (balance: number) => void;
}

export default function WalkingTourScreen({
  tourType,
  tourId,
  narrators,
  currentNarrator,
  player,
  coinBalance,
  onExit,
  onBalanceChange,
}: WalkingTourScreenProps) {
  const {
    session,
    currentStop,
    nextStop,
    progress: tourProgress,
    startTour,
    arriveAtStop,
    completeStop,
    pauseTour,
    resumeTour,
    exitTour,
  } = useTourSession(tourType, tourId);

  const { badges, newlyEarned, checkAndAward, clearNewlyEarned } = useBadges();
  const { isOnline } = useConnectivity();

  // When tour completes, evaluate badges
  const handleTourCompletion = useCallback(() => {
    if (session && session.status === 'completed') {
      checkAndAward(session, !isOnline);
    }
  }, [session, checkAndAward, isOnline]);

  // Check for completion after each stop complete
  const handleCompleteStop = useCallback((index: number) => {
    completeStop(index);
  }, [completeStop]);

  const handlePlayStory = useCallback((story: Story, narrator: Narrator | null) => {
    player.playStory(story, narrator);
  }, [player]);

  const handleExit = useCallback(() => {
    exitTour();
    onExit();
  }, [exitTour, onExit]);

  if (!session) {
    return (
      <div className="h-full flex items-center justify-center bg-canvas">
        <div className="w-8 h-8 rounded-full border-2 border-gamana-200 border-t-gamana-500 animate-spin" />
      </div>
    );
  }

  // Get tour image
  const tourPack = cityPacks.find((p) => p.id === tourId);
  const tourImage = tourPack?.image_url ?? session.stops[0]?.story?.image_url ?? null;

  // Phase: Preparing
  if (session.status === 'preparing') {
    return (
      <TourPrepScreen
        tourTitle={session.title}
        tourImage={tourImage}
        stops={session.stops}
        onStart={startTour}
        onBack={handleExit}
      />
    );
  }

  // Phase: Completed
  if (session.status === 'completed') {
    // Trigger badge evaluation on first render of completion
    if (newlyEarned.length === 0) {
      // Run async-like
      setTimeout(() => handleTourCompletion(), 100);
    }

    return (
      <TourCompletionSheet
        session={session}
        earnedBadges={newlyEarned}
        onGoHome={onExit}
      />
    );
  }

  // Phase: Active / Paused
  return (
    <WalkingTourActive
      session={session}
      currentStop={currentStop}
      narrator={currentNarrator}
      isPlaying={player.isPlaying}
      progress={player.progress}
      onArriveAtStop={arriveAtStop}
      onCompleteStop={handleCompleteStop}
      onPlayStory={handlePlayStory}
      onTogglePlay={player.togglePlay}
      onExitTour={handleExit}
    />
  );
}
