import { useState, useCallback, useEffect } from 'react';
import type { AppRoute, Narrator, Story } from './types';
import { useNarrators } from './hooks/useNarrators';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { useUserProfile } from './hooks/useUserProfile';
import { completeOnboarding, hasOnboarded, getPreferredNarratorId, getGpsEnabled } from './lib/localDb';
import { useAuth } from './hooks/useAuth';
import { useOrgContext } from './hooks/useOrgContext';
import { fetchOrgMemberships, fetchOrgConfig } from './lib/auth';
import { AuthProvider } from './contexts/AuthContext';
import { OrgProvider } from './contexts/OrgContext';
import { ConnectivityProvider } from './contexts/ConnectivityContext';
import { ThemeProvider } from './contexts/ThemeContext';
import MobileFrame from './components/layout/MobileFrame';
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import HomeScreen from './components/home/HomeScreen';
import LibraryScreen from './components/library/LibraryScreen';
import StoryDetailScreen from './components/story/StoryDetailScreen';
import CoinsScreen from './components/coins/CoinsScreen';
import SearchScreen from './components/search/SearchScreen';
import LoginScreen from './components/auth/LoginScreen';
import ProfileScreen from './components/profile/ProfileScreen';
import WishlistScreen from './components/profile/WishlistScreen';
import MyCollectionScreen from './components/profile/MyCollectionScreen';
import AlertsScreen from './components/alerts/AlertsScreen';
import OrgSelectorSheet from './components/overlays/OrgSelectorSheet';
import WalkingTourScreen from './components/tour/WalkingTourScreen';
import ExploreCitiesScreen from './components/cities/ExploreCitiesScreen';
import RequestStoryScreen from './components/request/RequestStoryScreen';
import FamilyScreen from './components/family/FamilyScreen';
import CreateTourScreen from './components/tour/CreateTourScreen';
import ExperiencesExploreScreen from './components/experiences/ExperiencesExploreScreen';
import ExperienceDetailScreen from './components/experiences/ExperienceDetailScreen';
import BookingWebViewScreen from './components/experiences/BookingWebViewScreen';
import OperatorProfileScreen from './components/experiences/OperatorProfileScreen';
import ExperienceSavedScreen from './components/experiences/ExperienceSavedScreen';
import TimeSlotScreen from './components/experiences/booking/TimeSlotScreen';
import PickupSelectionScreen from './components/experiences/booking/PickupSelectionScreen';
import BookingQuestionsScreen from './components/experiences/booking/BookingQuestionsScreen';
import OrderSummaryScreen from './components/experiences/booking/OrderSummaryScreen';
import OnRequestStatusScreen from './components/experiences/booking/OnRequestStatusScreen';
import MyBookingsScreen from './components/experiences/bookings/MyBookingsScreen';
import BookingDetailScreen from './components/experiences/bookings/BookingDetailScreen';
import PreExperienceBriefScreen from './components/experiences/confidence/PreExperienceBriefScreen';
import MeetingPointScreen from './components/experiences/confidence/MeetingPointScreen';
import BookingConfirmedScreen from './components/experiences/booking/BookingConfirmedScreen';
import BookingFailedScreen from './components/experiences/booking/BookingFailedScreen';
import ExperienceCompletedScreen from './components/experiences/post/ExperienceCompletedScreen';
import RateReviewScreen from './components/experiences/post/RateReviewScreen';
import CancelBookingScreen from './components/experiences/bookings/CancelBookingScreen';
import CancellationConfirmedScreen from './components/experiences/bookings/CancellationConfirmedScreen';
import RefundStatusScreen from './components/experiences/bookings/RefundStatusScreen';
import NotificationPreviewScreen from './components/notifications/NotificationPreviewScreen';
import {
  calculateRefundAmount,
  generateCancellationCode,
} from './lib/experience-cancellation';
import { getExperienceBySlugSync, getBookingLink } from './lib/experience-mock-api';
import { experienceSeedData } from './lib/experience-seed-data';
import { MOCK_BOOKINGS } from './lib/experience-bookings-mock';
import { resolveOperatorName } from './lib/experience-seed-helpers';
import {
  generateConfirmationCode,
  isOnRequestExperience,
  needsPickupStep,
  needsTimeSlotStep,
  type BookingFlowState,
} from './lib/experience-booking-flow';
import SOSSheet from './components/family/SOSSheet';
import { useLocation } from './hooks/useLocation';
import { useUnlockedStories } from './hooks/useUnlockedStories';
import { useUserTours } from './hooks/useUserTours';
import { addTourStoryStop, addTourPinnedStop } from './lib/localDb';
import { BENGALURU_CITY_ID } from './lib/constants';

function AppInner() {
  const [isOnboarded, setIsOnboarded] = useState(() => hasOnboarded());
  const [route, setRoute] = useState<AppRoute>(() => {
    const path = window.location.pathname.replace(/\/+$/, '');
    if (path === '/empty') return { screen: 'empty' };
    return { screen: 'home' };
  });
  const { narrators } = useNarrators();
  const player = useAudioPlayer();
  const userProfile = useUserProfile();
  const [selectedNarrator, setSelectedNarrator] = useState<Narrator | null>(null);
  const { session } = useAuth();
  const { config: orgConfig, memberships: orgMemberships, selectOrg, setMemberships, updateConfig } = useOrgContext();
  const [showOrgSelector, setShowOrgSelector] = useState(false);
  const [showSOS, setShowSOS] = useState(false);
  const [gpsEnabled, setGpsEnabledState] = useState(() => getGpsEnabled());
  const location = useLocation(gpsEnabled);

  useEffect(() => {
    const handler = (e: Event) => {
      setGpsEnabledState((e as CustomEvent<boolean>).detail);
    };
    window.addEventListener('gamana_gps_changed', handler);
    return () => window.removeEventListener('gamana_gps_changed', handler);
  }, []);
  const { items: unlockedItems, isLoading: unlockedLoading } = useUnlockedStories();
  const { tours: userTours, createTour, refresh: refreshTours, deleteTour, updateTour } =
    useUserTours(BENGALURU_CITY_ID);

  useEffect(() => {
    if (!narrators.length || selectedNarrator) return;
    const preferredId = getPreferredNarratorId();
    if (preferredId) {
      const found = narrators.find((n) => n.id === preferredId);
      if (found) setSelectedNarrator(found);
    }
  }, [narrators, selectedNarrator]);

  useEffect(() => {
    if (!session) return;
    fetchOrgMemberships(session.userId).then((memberships) => {
      setMemberships(memberships);
      if (memberships.length === 1 && memberships[0].status === 'active') {
        selectOrg(memberships[0].orgId);
        fetchOrgConfig(memberships[0].orgId).then(updateConfig);
      } else if (memberships.length > 1) {
        setShowOrgSelector(true);
      }
    });
  }, [session, setMemberships, selectOrg, updateConfig]);

  const currentNarrator = selectedNarrator ?? narrators[0] ?? null;

  const handleNavigateToStory = useCallback((storyId: string) => {
    setRoute({ screen: 'story_detail', storyId });
  }, []);

  const handleBack = useCallback(() => {
    setRoute({ screen: 'home' });
  }, []);

  const handleTabChange = useCallback((tab: 'home' | 'library' | 'search' | 'profile' | 'alerts') => {
    if (tab === 'home') setRoute({ screen: 'home' });
    else if (tab === 'library') setRoute({ screen: 'library' });
    else if (tab === 'search') setRoute({ screen: 'search' });
    else if (tab === 'profile') setRoute({ screen: 'profile' });
    else if (tab === 'alerts') setRoute({ screen: 'alerts' });
  }, []);

  const handleNavigateToLogin = useCallback(() => {
    setRoute({ screen: 'login' });
  }, []);

  const handleOrgSelect = useCallback((orgId: string) => {
    selectOrg(orgId);
    fetchOrgConfig(orgId).then(updateConfig);
    setShowOrgSelector(false);
  }, [selectOrg, updateConfig]);

  const handleNavigateToCoins = useCallback(() => {
    setRoute({ screen: 'coins' });
  }, []);

  const handleStartWalkingTour = useCallback((tourType: 'recommended' | 'user', tourId: string) => {
    setRoute({ screen: 'walking_tour', tourType, tourId });
  }, []);

  const handleNavigateToExploreCities = useCallback(() => {
    setRoute({ screen: 'explore_cities' });
  }, []);

  const handleNavigateToRequestStory = useCallback(() => {
    setRoute({ screen: 'request_story' });
  }, []);

  const handleNavigateToFamilyTracking = useCallback(() => {
    setRoute({ screen: 'family_tracking' });
  }, []);

  const handleOpenSOS = useCallback(() => {
    setShowSOS(true);
  }, []);

  const handleNavigateToCreateTour = useCallback(() => {
    setRoute({ screen: 'create_tour' });
  }, []);

  const handleNavigateToExperiencesExplore = useCallback((tab?: 'tours' | 'activities') => {
    setRoute({ screen: 'experiences_explore', tab });
  }, []);

  const handleNavigateToExperienceDetail = useCallback((slug: string) => {
    setRoute({ screen: 'experience_detail', slug });
  }, []);

  const handleNavigateToProfile = useCallback(() => {
    setRoute({ screen: 'profile' });
  }, []);

  const handleNavigateToWishlist = useCallback(() => {
    setRoute({ screen: 'profile_wishlist' });
  }, []);

  const handleNavigateToCollection = useCallback(
    (tab?: 'stories' | 'audio_tours' | 'my_tours' | 'bookings') => {
      setRoute({ screen: 'profile_collection', tab });
    },
    [],
  );

  const handleNavigateToLibrary = useCallback(() => {
    setRoute({ screen: 'library' });
  }, []);

  const handleBookExperienceFromSlug = useCallback((slug: string) => {
    setRoute({ screen: 'experience_detail', slug });
  }, []);

  const handleNavigateToOperatorProfile = useCallback(
    (vendorId: string, operatorName: string) => {
      setRoute({ screen: 'operator_profile', vendorId, operatorName });
    },
    [],
  );

  const handleNavigateToExperienceSaved = useCallback(() => {
    setRoute({ screen: 'experience_saved' });
  }, []);

  const handleNavigateToMyBookings = useCallback(() => {
    setRoute({ screen: 'my_bookings' });
  }, []);

  const handleOpenBookingDetail = useCallback((bookingId: string) => {
    setRoute({ screen: 'booking_detail', bookingId });
  }, []);

  const handleNavigateToPreExperienceBrief = useCallback((bookingId: string) => {
    setRoute({ screen: 'pre_experience_brief', bookingId });
  }, []);

  const handleNavigateToMeetingPoint = useCallback((bookingId: string) => {
    setRoute({ screen: 'meeting_point', bookingId });
  }, []);

  const handleNavigateToExperienceCompleted = useCallback((bookingId: string) => {
    setRoute({ screen: 'experience_completed', bookingId });
  }, []);

  const handleNavigateToRateReview = useCallback((bookingId: string) => {
    setRoute({ screen: 'rate_review', bookingId });
  }, []);

  const handleNavigateToCancelBooking = useCallback((bookingId: string) => {
    setRoute({ screen: 'cancel_booking', bookingId });
  }, []);

  const handleNavigateToRefundStatus = useCallback((bookingId: string) => {
    setRoute({ screen: 'refund_status', bookingId });
  }, []);

  const handleViewNotificationDesigns = useCallback(() => {
    setRoute({ screen: 'notification_preview' });
  }, []);

  const handleOpenBooking = useCallback(
    (bookingId: string) => {
      const booking = MOCK_BOOKINGS.find((b) => b.id === bookingId);
      if (booking?.status === 'completed' && bookingId === 'bk-003') {
        handleNavigateToExperienceCompleted(bookingId);
        return;
      }
      handleOpenBookingDetail(bookingId);
    },
    [handleNavigateToExperienceCompleted, handleOpenBookingDetail],
  );

  const handleStartExperienceBooking = useCallback(
    (params: {
      experienceId: string;
      slug: string;
      bookingUrl: string;
      operatorName: string;
      selectedDate?: string;
      selectedTime?: string | null;
    }) => {
      setRoute({
        screen: 'experience_booking',
        experienceId: params.experienceId,
        slug: params.slug,
        bookingUrl: params.bookingUrl,
        operatorName: params.operatorName,
        selectedDate: params.selectedDate,
        selectedTime: params.selectedTime ?? null,
      });
    },
    [],
  );

  const handleBookingFlowContinue = useCallback((flowState: BookingFlowState) => {
    const exp = getExperienceBySlugSync(flowState.slug);
    if (!exp) return;

    if (isOnRequestExperience(exp)) {
      setRoute({ screen: 'booking_questions', flowState });
      return;
    }
    if (needsTimeSlotStep(exp)) {
      setRoute({ screen: 'booking_timeslot', flowState });
      return;
    }
    if (needsPickupStep(exp)) {
      setRoute({ screen: 'booking_pickup', flowState });
      return;
    }
    setRoute({ screen: 'booking_questions', flowState });
  }, []);

  const handleBookingTimeContinue = useCallback((flowState: BookingFlowState) => {
    const exp = getExperienceBySlugSync(flowState.slug);
    if (!exp) return;

    if (needsPickupStep(exp)) {
      setRoute({ screen: 'booking_pickup', flowState });
    } else {
      setRoute({ screen: 'booking_questions', flowState });
    }
  }, []);

  const handleBookingPickupContinue = useCallback((flowState: BookingFlowState) => {
    setRoute({ screen: 'booking_questions', flowState });
  }, []);

  const handleBookingQuestionsContinue = useCallback((flowState: BookingFlowState) => {
    const exp = getExperienceBySlugSync(flowState.slug);
    if (!exp) return;
    setRoute({
      screen: 'booking_review',
      flowState,
      operatorName: resolveOperatorName(exp),
    });
  }, []);

  const handleBookingReviewConfirm = useCallback(
    async (flowState: BookingFlowState, operatorName: string) => {
      const exp = getExperienceBySlugSync(flowState.slug);
      if (!exp) return;

      if (isOnRequestExperience(exp)) {
        setRoute({
          screen: 'on_request_status',
          status: 'pending',
          experienceId: flowState.experienceId,
          slug: flowState.slug,
          operatorName,
          referenceCode: generateConfirmationCode(flowState.experienceId),
          selectedDate: flowState.selectedDate,
        });
        return;
      }

      try {
        const handoff = await getBookingLink(exp.id);
        handleStartExperienceBooking({
          experienceId: exp.id,
          slug: exp.slug,
          bookingUrl: handoff.url,
          operatorName,
          selectedDate: flowState.selectedDate,
          selectedTime: flowState.selectedTime ?? null,
        });
      } catch {
        // Stay on review screen if handoff fails
      }
    },
    [handleStartExperienceBooking],
  );

  const handleSaveNewTour = useCallback(async (data: {
    title: string;
    description: string;
    storyIds: string[];
    pinnedStops: { label: string; lat: number; lng: number }[];
  }) => {
    const tour = await createTour(data.title, data.description);
    if (!tour) return false;

    let order = 0;
    for (const storyId of data.storyIds) {
      addTourStoryStop(tour.id, storyId, order++);
    }
    for (const stop of data.pinnedStops) {
      addTourPinnedStop(tour.id, stop.label, stop.lat, stop.lng, order++);
    }

    await refreshTours();
    return true;
  }, [createTour, refreshTours]);

  const handlePlayStory = useCallback((story: Story, narrator: Narrator | null) => {
    if (player.currentStory?.id === story.id) {
      player.togglePlay();
    } else {
      player.playStory(story, narrator);
    }
  }, [player]);

  const handleSelectNarrator = useCallback((narrator: Narrator) => {
    const previousId = selectedNarrator?.id ?? narrators[0]?.id;
    setSelectedNarrator(narrator);

    console.info('narrator_changed', {
      from: previousId,
      to: narrator.id,
      style: narrator.style,
      was_playing: player.isPlaying,
    });

    if (player.isPlaying && player.currentStory) {
      player.playStory(player.currentStory, narrator);
    }
  }, [selectedNarrator, narrators, player]);

  const handleOnboardingComplete = useCallback((narratorId: string, _locationGranted: boolean) => {
    completeOnboarding();
    setIsOnboarded(true);
    const narrator = narrators.find((n) => n.id === narratorId);
    if (narrator) setSelectedNarrator(narrator);
  }, [narrators]);

  if (!isOnboarded) {
    return (
      <MobileFrame>
        <OnboardingFlow narrators={narrators} onComplete={handleOnboardingComplete} />
      </MobileFrame>
    );
  }

  const renderScreen = () => {
    switch (route.screen) {
      case 'library':
        return (
          <LibraryScreen
            currentNarrator={currentNarrator}
            player={player}
            coinBalance={userProfile.balance}
            onNavigateToStory={handleNavigateToStory}
            onNavigateHome={() => setRoute({ screen: 'home' })}
            onNavigateToCoins={handleNavigateToCoins}
            onNavigateToCreateTour={handleNavigateToCreateTour}
            onTabChange={handleTabChange}
            onBalanceChange={userProfile.updateBalance}
            onStartWalkingTour={handleStartWalkingTour}
            onNavigateToExperiencesExplore={() => handleNavigateToExperiencesExplore()}
          />
        );
      case 'story_detail':
        return (
          <StoryDetailScreen
            storyId={route.storyId}
            narrators={narrators}
            selectedNarrator={selectedNarrator}
            onSelectNarrator={handleSelectNarrator}
            currentPlayingStory={player.currentStory}
            isPlaying={player.isPlaying}
            progress={player.progress}
            coinBalance={userProfile.balance}
            onPlayStory={handlePlayStory}
            onTogglePlay={player.togglePlay}
            onBack={handleBack}
            onNavigateToStory={handleNavigateToStory}
            onNavigateToCoins={handleNavigateToCoins}
            onBalanceChange={userProfile.updateBalance}
          />
        );
      case 'search':
        return (
          <SearchScreen
            player={player}
            currentNarrator={currentNarrator}
            onNavigateToStory={handleNavigateToStory}
            onTabChange={handleTabChange}
          />
        );
      case 'login':
        return (
          <LoginScreen
            onBack={handleBack}
            onLoginSuccess={() => setRoute({ screen: 'home' })}
          />
        );
      case 'profile':
        return (
          <ProfileScreen
            player={player}
            currentNarrator={currentNarrator}
            coinBalance={userProfile.balance}
            onBack={handleBack}
            onTabChange={handleTabChange}
            onNavigateToLogin={handleNavigateToLogin}
            onNavigateToCoins={handleNavigateToCoins}
            onShowOrgSelector={() => setShowOrgSelector(true)}
            onNavigateToFamilyTracking={handleNavigateToFamilyTracking}
            onNavigateToWishlist={handleNavigateToWishlist}
            onNavigateToCollection={handleNavigateToCollection}
            onNavigateToExperienceDetail={handleNavigateToExperienceDetail}
            onNavigateToStory={handleNavigateToStory}
            onNavigateToExperiencesExplore={handleNavigateToExperiencesExplore}
            onNavigateToLibrary={handleNavigateToLibrary}
          />
        );
      case 'profile_wishlist':
        return (
          <WishlistScreen
            onBack={handleNavigateToProfile}
            onOpenExperience={handleNavigateToExperienceDetail}
            onBookExperience={handleBookExperienceFromSlug}
            onExplore={handleNavigateToExperiencesExplore}
          />
        );
      case 'profile_collection':
        return (
          <MyCollectionScreen
            cityId={BENGALURU_CITY_ID}
            initialTab={route.tab}
            coinBalance={userProfile.balance}
            onBack={handleNavigateToProfile}
            onNavigateToStory={handleNavigateToStory}
            onNavigateToExperience={handleNavigateToExperienceDetail}
            onNavigateToCoins={handleNavigateToCoins}
            onBalanceChange={userProfile.updateBalance}
            onStartWalkingTour={handleStartWalkingTour}
            onDeleteUserTour={async (tourId) => {
              await deleteTour(tourId);
            }}
            onToggleShare={async (tourId, isShared) => {
              const tour = userTours.find((t) => t.id === tourId);
              if (!tour) return null;
              const shareCode = isShared
                ? tour.share_code ?? `${Math.random().toString(36).slice(2, 10)}`
                : null;
              return updateTour(tourId, {
                is_shared: isShared,
                share_code: shareCode,
              });
            }}
            onOpenBooking={handleOpenBooking}
            onExploreExperiences={handleNavigateToExperiencesExplore}
            onRateExperience={(bookingId) => handleNavigateToRateReview(bookingId)}
          />
        );
      case 'my_bookings':
        return (
          <MyBookingsScreen
            onBack={handleNavigateToProfile}
            onOpenBooking={handleOpenBooking}
            onExplore={handleNavigateToExperiencesExplore}
            onRateExperience={(bookingId) => handleNavigateToRateReview(bookingId)}
          />
        );
      case 'booking_detail': {
        const detailBooking = MOCK_BOOKINGS.find((b) => b.id === route.bookingId);
        const detailExp = detailBooking
          ? experienceSeedData.find((e) => e.id === detailBooking.experienceId)
          : null;
        return (
          <BookingDetailScreen
            bookingId={route.bookingId}
            onBack={() => setRoute({ screen: 'profile_collection', tab: 'bookings' })}
            onNavigateToStory={
              detailExp?.linkedStoryId
                ? () =>
                    setRoute({ screen: 'story_detail', storyId: detailExp.linkedStoryId! })
                : undefined
            }
            onViewBrief={() => {
              if (detailBooking) {
                setRoute({ screen: 'experience_detail', slug: detailBooking.slug });
              }
            }}
            onViewMeetingPoint={() => {
              if (detailBooking) {
                setRoute({ screen: 'experience_detail', slug: detailBooking.slug });
              }
            }}
            onNavigateToCancelBooking={() =>
              handleNavigateToCancelBooking(route.bookingId)
            }
            onNavigateToRateReview={handleNavigateToRateReview}
            onViewRefundStatus={
              detailBooking?.status === 'cancelled'
                ? () => handleNavigateToRefundStatus(route.bookingId)
                : undefined
            }
            onExplore={handleNavigateToExperiencesExplore}
          />
        );
      }
      case 'cancel_booking': {
        const cancelBooking = MOCK_BOOKINGS.find((b) => b.id === route.bookingId);
        return (
          <CancelBookingScreen
            bookingId={route.bookingId}
            onBack={() =>
              setRoute({ screen: 'booking_detail', bookingId: route.bookingId })
            }
            onConfirm={() => {
              if (!cancelBooking) return;
              const refundAmount = calculateRefundAmount(cancelBooking);
              setRoute({
                screen: 'cancellation_confirmed',
                bookingId: route.bookingId,
                refundAmount,
                cancellationCode: generateCancellationCode(),
              });
            }}
          />
        );
      }
      case 'cancellation_confirmed': {
        const confirmedBooking = MOCK_BOOKINGS.find((b) => b.id === route.bookingId);
        return (
          <CancellationConfirmedScreen
            bookingId={route.bookingId}
            refundAmount={route.refundAmount}
            operatorName={confirmedBooking?.operatorName ?? 'Operator'}
            cancellationCode={route.cancellationCode}
            onBack={handleBack}
            onOpenExperience={handleNavigateToExperienceDetail}
          />
        );
      }
      case 'refund_status':
        return (
          <RefundStatusScreen
            bookingId={route.bookingId}
            onBack={() =>
              setRoute({ screen: 'booking_detail', bookingId: route.bookingId })
            }
          />
        );
      case 'experience_completed': {
        const completedBooking = MOCK_BOOKINGS.find((b) => b.id === route.bookingId);
        const completedExp = completedBooking
          ? experienceSeedData.find((e) => e.id === completedBooking.experienceId)
          : null;
        return (
          <ExperienceCompletedScreen
            bookingId={route.bookingId}
            onBack={handleBack}
            onNavigateToStory={
              completedExp?.linkedStoryId
                ? () =>
                    setRoute({ screen: 'story_detail', storyId: completedExp.linkedStoryId! })
                : undefined
            }
            onRateExperience={() => handleNavigateToRateReview(route.bookingId)}
          />
        );
      }
      case 'rate_review':
        return (
          <RateReviewScreen
            bookingId={route.bookingId}
            onBack={() => {
              const booking = MOCK_BOOKINGS.find((b) => b.id === route.bookingId);
              if (booking?.status === 'completed') {
                setRoute({ screen: 'experience_completed', bookingId: route.bookingId });
              } else {
                setRoute({ screen: 'booking_detail', bookingId: route.bookingId });
              }
            }}
            onSubmit={() =>
              setRoute({ screen: 'profile_collection', tab: 'bookings' })
            }
          />
        );
      case 'alerts':
        return (
          <AlertsScreen
            player={player}
            currentNarrator={currentNarrator}
            onBack={handleBack}
            onTabChange={handleTabChange}
            onNavigateToStory={handleNavigateToStory}
            onViewNotificationDesigns={handleViewNotificationDesigns}
          />
        );
      case 'notification_preview':
        return (
          <NotificationPreviewScreen
            onBack={() => setRoute({ screen: 'alerts' })}
          />
        );
      case 'coins':
        return (
          <CoinsScreen
            balance={userProfile.balance}
            onBack={handleBack}
            onNavigateToStory={handleNavigateToStory}
            onBalanceChange={userProfile.updateBalance}
          />
        );
      case 'walking_tour':
        return (
          <WalkingTourScreen
            tourType={route.tourType}
            tourId={route.tourId}
            narrators={narrators}
            currentNarrator={currentNarrator}
            player={player}
            coinBalance={userProfile.balance}
            onExit={() => setRoute({ screen: route.tourType === 'user' ? 'library' : 'home' })}
            onBalanceChange={userProfile.updateBalance}
          />
        );
      case 'explore_cities':
        return (
          <ExploreCitiesScreen
            onBack={handleBack}
          />
        );
      case 'request_story':
        return (
          <RequestStoryScreen
            onBack={handleBack}
            defaultLat={12.9716}
            defaultLng={77.5946}
          />
        );
      case 'create_tour':
        return (
          <CreateTourScreen
            onClose={() => setRoute({ screen: 'library' })}
            unlockedItems={unlockedItems}
            unlockedLoading={unlockedLoading}
            location={location}
            onSave={handleSaveNewTour}
          />
        );
      case 'family_tracking':
        return (
          <FamilyScreen
            onBack={handleBack}
          />
        );
      case 'experiences_explore':
        return (
          <ExperiencesExploreScreen
            initialTab={route.tab}
            onBack={handleBack}
            onOpenExperience={handleNavigateToExperienceDetail}
          />
        );
      case 'experience_detail':
        return (
          <ExperienceDetailScreen
            slug={route.slug}
            onBack={handleBack}
            onNavigateToStory={handleNavigateToStory}
            onBookingFlowContinue={handleBookingFlowContinue}
          />
        );
      case 'booking_timeslot': {
        const timeslotExp = getExperienceBySlugSync(route.flowState.slug);
        if (!timeslotExp) return null;
        return (
          <TimeSlotScreen
            experience={timeslotExp}
            selectedDate={route.flowState.selectedDate}
            onBack={() =>
              setRoute({ screen: 'experience_detail', slug: route.flowState.slug })
            }
            onContinue={(time, slotId) =>
              handleBookingTimeContinue({
                ...route.flowState,
                selectedTime: time,
                selectedSlotId: slotId,
              })
            }
          />
        );
      }
      case 'booking_pickup': {
        const pickupExp = getExperienceBySlugSync(route.flowState.slug);
        if (!pickupExp) return null;
        return (
          <PickupSelectionScreen
            experience={pickupExp}
            onBack={() => {
              if (needsTimeSlotStep(pickupExp)) {
                setRoute({ screen: 'booking_timeslot', flowState: route.flowState });
              } else {
                setRoute({ screen: 'experience_detail', slug: route.flowState.slug });
              }
            }}
            onContinue={(pickupLocationId) =>
              handleBookingPickupContinue({
                ...route.flowState,
                pickupLocationId,
                pickupMode: pickupLocationId ? 'pickup' : 'meet',
              })
            }
          />
        );
      }
      case 'booking_questions': {
        const questionsExp = getExperienceBySlugSync(route.flowState.slug);
        if (!questionsExp) return null;
        return (
          <BookingQuestionsScreen
            experience={questionsExp}
            onBack={() => {
              if (isOnRequestExperience(questionsExp)) {
                setRoute({ screen: 'experience_detail', slug: route.flowState.slug });
                return;
              }
              if (needsPickupStep(questionsExp)) {
                setRoute({ screen: 'booking_pickup', flowState: route.flowState });
                return;
              }
              if (needsTimeSlotStep(questionsExp)) {
                setRoute({ screen: 'booking_timeslot', flowState: route.flowState });
                return;
              }
              setRoute({ screen: 'experience_detail', slug: route.flowState.slug });
            }}
            onContinue={(answers) =>
              handleBookingQuestionsContinue({ ...route.flowState, answers })
            }
          />
        );
      }
      case 'booking_review': {
        const reviewExp = getExperienceBySlugSync(route.flowState.slug);
        if (!reviewExp) return null;
        return (
          <OrderSummaryScreen
            experience={reviewExp}
            flowState={route.flowState}
            operatorName={route.operatorName}
            onBack={() =>
              setRoute({ screen: 'booking_questions', flowState: route.flowState })
            }
            onConfirm={() =>
              handleBookingReviewConfirm(route.flowState, route.operatorName)
            }
          />
        );
      }
      case 'on_request_status': {
        const statusExp =
          experienceSeedData.find((e) => e.id === route.experienceId) ?? null;
        return (
          <OnRequestStatusScreen
            status={route.status}
            experienceId={route.experienceId}
            slug={route.slug}
            operatorName={route.operatorName}
            referenceCode={route.referenceCode}
            selectedDate={route.selectedDate}
            experience={statusExp}
            onBack={handleBack}
            onViewBooking={() =>
              setRoute({ screen: 'profile_collection', tab: 'bookings' })
            }
            onNavigateToStory={
              statusExp?.linkedStoryId
                ? () =>
                    setRoute({
                      screen: 'story_detail',
                      storyId: statusExp.linkedStoryId!,
                    })
                : undefined
            }
            onRetryBooking={() =>
              setRoute({ screen: 'experience_detail', slug: route.slug })
            }
            onBrowseAlternatives={() => handleNavigateToExperiencesExplore()}
            onCancelRequest={() =>
              setRoute({ screen: 'experience_detail', slug: route.slug })
            }
            onOpenExperience={handleNavigateToExperienceDetail}
          />
        );
      }
      case 'experience_booking':
        return (
          <BookingWebViewScreen
            experienceId={route.experienceId}
            slug={route.slug}
            bookingUrl={route.bookingUrl}
            operatorName={route.operatorName}
            onBack={() =>
              setRoute({ screen: 'experience_detail', slug: route.slug })
            }
            onDone={(result) => {
              const exp = experienceSeedData.find((e) => e.id === route.experienceId);
              if (result.success) {
                setRoute({
                  screen: 'booking_confirmed',
                  experienceId: route.experienceId,
                  slug: route.slug,
                  confirmationCode: generateConfirmationCode(route.experienceId),
                  selectedDate:
                    route.selectedDate ?? new Date().toISOString().slice(0, 10),
                  selectedTime: route.selectedTime ?? null,
                  isOnRequest: false,
                });
              } else {
                setRoute({
                  screen: 'booking_failed',
                  experienceId: route.experienceId,
                  slug: route.slug,
                  reason: result.reason ?? 'payment_error',
                });
              }
            }}
          />
        );
      case 'booking_confirmed': {
        const confirmedExp = experienceSeedData.find((e) => e.id === route.experienceId) ?? null;
        return (
          <BookingConfirmedScreen
            experienceId={route.experienceId}
            slug={route.slug}
            experience={confirmedExp}
            confirmationCode={route.confirmationCode}
            selectedDate={route.selectedDate}
            selectedTime={route.selectedTime}
            isOnRequest={route.isOnRequest}
            hasLinkedStory={confirmedExp?.hasLinkedStory ?? false}
            linkedStoryId={confirmedExp?.linkedStoryId}
            onBack={handleBack}
            onViewBooking={() =>
              setRoute({ screen: 'profile_collection', tab: 'bookings' })
            }
            onViewBrief={() =>
              setRoute({ screen: 'experience_detail', slug: route.slug })
            }
            onNavigateToStory={
              confirmedExp?.linkedStoryId
                ? () =>
                    setRoute({
                      screen: 'story_detail',
                      storyId: confirmedExp.linkedStoryId!,
                    })
                : undefined
            }
            onViewRequestStatus={() =>
              setRoute({ screen: 'profile_collection', tab: 'bookings' })
            }
          />
        );
      }
      case 'booking_failed': {
        const failedExp = experienceSeedData.find((e) => e.id === route.experienceId) ?? null;
        return (
          <BookingFailedScreen
            reason={route.reason}
            experience={failedExp}
            onBack={() =>
              setRoute({ screen: 'experience_detail', slug: route.slug })
            }
            onTryAgain={() =>
              setRoute({ screen: 'experience_detail', slug: route.slug })
            }
            onBrowseAlternatives={() => handleNavigateToExperiencesExplore()}
            onOpenExperience={handleNavigateToExperienceDetail}
          />
        );
      }
      case 'operator_profile':
        return (
          <OperatorProfileScreen
            vendorId={route.vendorId}
            operatorName={route.operatorName}
            onBack={handleBack}
            onOpenExperience={handleNavigateToExperienceDetail}
            onBrowseAll={() => handleNavigateToExperiencesExplore()}
          />
        );
      case 'experience_saved':
        return (
          <ExperienceSavedScreen
            onBack={handleBack}
            onOpenExperience={handleNavigateToExperienceDetail}
            onExplore={() => handleNavigateToExperiencesExplore()}
          />
        );
      case 'empty':
        return (
          <HomeScreen
            narrators={narrators}
            selectedNarrator={selectedNarrator}
            onSelectNarrator={handleSelectNarrator}
            currentNarrator={currentNarrator}
            player={player}
            coinBalance={userProfile.balance}
            onNavigateToStory={handleNavigateToStory}
            onNavigateToCoins={handleNavigateToCoins}
            onNavigateToExploreCities={handleNavigateToExploreCities}
            onNavigateToRequestStory={handleNavigateToRequestStory}
            onTabChange={handleTabChange}
            onBalanceChange={userProfile.updateBalance}
            onStartWalkingTour={handleStartWalkingTour}
            onNavigateToFamilyTracking={handleNavigateToFamilyTracking}
            onOpenSOS={handleOpenSOS}
            onNavigateToExperiencesExplore={handleNavigateToExperiencesExplore}
            onNavigateToExperienceDetail={handleNavigateToExperienceDetail}
            onNavigateToPreExperienceBrief={handleNavigateToPreExperienceBrief}
            onNavigateToMeetingPoint={handleNavigateToMeetingPoint}
            forceEmpty
          />
        );
      case 'pre_experience_brief':
        return (
          <PreExperienceBriefScreen
            bookingId={route.bookingId}
            onBack={handleBack}
            onOpenMeetingPoint={() =>
              handleNavigateToMeetingPoint(route.bookingId)
            }
            onNavigateToStory={(() => {
              const booking = MOCK_BOOKINGS.find((b) => b.id === route.bookingId);
              const exp = booking
                ? experienceSeedData.find((e) => e.id === booking.experienceId)
                : null;
              return exp?.linkedStoryId
                ? () =>
                    setRoute({ screen: 'story_detail', storyId: exp.linkedStoryId! })
                : undefined;
            })()}
          />
        );
      case 'meeting_point':
        return (
          <MeetingPointScreen
            bookingId={route.bookingId}
            onBack={() =>
              setRoute({ screen: 'pre_experience_brief', bookingId: route.bookingId })
            }
          />
        );
      default:
        return (
          <HomeScreen
            narrators={narrators}
            selectedNarrator={selectedNarrator}
            onSelectNarrator={handleSelectNarrator}
            currentNarrator={currentNarrator}
            player={player}
            coinBalance={userProfile.balance}
            onNavigateToStory={handleNavigateToStory}
            onNavigateToCoins={handleNavigateToCoins}
            onNavigateToExploreCities={handleNavigateToExploreCities}
            onNavigateToRequestStory={handleNavigateToRequestStory}
            onTabChange={handleTabChange}
            onBalanceChange={userProfile.updateBalance}
            onStartWalkingTour={handleStartWalkingTour}
            onNavigateToFamilyTracking={handleNavigateToFamilyTracking}
            onOpenSOS={handleOpenSOS}
            onNavigateToExperiencesExplore={handleNavigateToExperiencesExplore}
            onNavigateToExperienceDetail={handleNavigateToExperienceDetail}
            onNavigateToPreExperienceBrief={handleNavigateToPreExperienceBrief}
            onNavigateToMeetingPoint={handleNavigateToMeetingPoint}
          />
        );
    }
  };

  return (
    <MobileFrame>
      {renderScreen()}
      <OrgSelectorSheet
        memberships={orgMemberships}
        selectedOrgId={orgConfig.orgId}
        isOpen={showOrgSelector}
        onSelect={handleOrgSelect}
        onClose={() => setShowOrgSelector(false)}
      />
      <SOSSheet isOpen={showSOS} onClose={() => setShowSOS(false)} />
    </MobileFrame>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <OrgProvider>
          <ConnectivityProvider>
            <AppInner />
          </ConnectivityProvider>
        </OrgProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
