import { useState, useCallback, useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { CityPack, Story, UserTour } from '../../types';
import {
  useMyCollection,
  type CollectionTab,
  type CollectionPreviewItem,
} from '../../hooks/useMyCollection';
import { getCityPackById } from '../../lib/localDb';
import StatusBar from '../layout/StatusBar';
import CollectionListRow from './CollectionListRow';
import TourPreviewSheet from '../overlays/TourPreviewSheet';
import TourDetailSheet from '../overlays/TourDetailSheet';
import UnlockSheet from '../overlays/UnlockSheet';
import InsufficientBalanceSheet from '../overlays/InsufficientBalanceSheet';
import MyBookingsScreen from '../experiences/bookings/MyBookingsScreen';

const TABS: { id: CollectionTab; label: string }[] = [
  { id: 'stories', label: 'Stories' },
  { id: 'audio_tours', label: 'Audio tours' },
  { id: 'my_tours', label: 'My tours' },
  { id: 'bookings', label: 'Bookings' },
];

interface MyCollectionScreenProps {
  cityId: string;
  initialTab?: CollectionTab;
  coinBalance: number;
  onBack: () => void;
  onNavigateToStory: (storyId: string) => void;
  onNavigateToExperience: (slug: string) => void;
  onNavigateToCoins: () => void;
  onBalanceChange: (newBalance: number) => void;
  onStartWalkingTour?: (tourType: 'recommended' | 'user', tourId: string) => void;
  onDeleteUserTour?: (tourId: string) => Promise<void>;
  onToggleShare?: (tourId: string, isShared: boolean) => Promise<UserTour | null>;
  onOpenBooking?: (bookingId: string) => void;
  onExploreExperiences?: () => void;
  onRateExperience?: (bookingId: string) => void;
}

function toPreviewStory(item: { story: Story; expires_at: string; is_expired: boolean }): CollectionPreviewItem {
  return {
    id: `story-${item.story.id}`,
    kind: 'story',
    title: item.story.title,
    subtitle: item.story.subtitle,
    imageUrl: item.story.image_url ?? undefined,
    sortAt: item.expires_at,
    isExpired: item.is_expired,
    storyId: item.story.id,
  };
}

function toPreviewPack(item: { pack: CityPack; expires_at: string; is_expired: boolean }): CollectionPreviewItem {
  return {
    id: `pack-${item.pack.id}`,
    kind: 'audio_tour',
    title: item.pack.title,
    subtitle: item.pack.subtitle,
    imageUrl: item.pack.image_url ?? undefined,
    sortAt: item.expires_at,
    isExpired: item.is_expired,
    packId: item.pack.id,
  };
}

function toPreviewTour(item: { tour: UserTour }): CollectionPreviewItem {
  return {
    id: `tour-${item.tour.id}`,
    kind: 'my_tour',
    title: item.tour.title,
    subtitle: item.tour.description || `${item.tour.stop_count ?? 0} stops`,
    sortAt: item.tour.updated_at,
    tourId: item.tour.id,
  };
}

function toPreviewBooking(item: { booking: import('../../lib/experience-bookings').ExperienceBookingRecord }): CollectionPreviewItem {
  return {
    id: `booking-${item.booking.id}`,
    kind: 'booking',
    title: item.booking.title,
    subtitle: item.booking.operatorName,
    imageUrl: item.booking.heroImageUrl,
    sortAt: item.booking.bookedAt,
    slug: item.booking.slug,
    experienceId: item.booking.experienceId,
    uiTabIntent: item.booking.uiTabIntent,
  };
}

export default function MyCollectionScreen({
  cityId,
  initialTab = 'stories',
  coinBalance,
  onBack,
  onNavigateToStory,
  onNavigateToExperience,
  onNavigateToCoins,
  onBalanceChange,
  onStartWalkingTour,
  onDeleteUserTour,
  onToggleShare,
  onOpenBooking,
  onExploreExperiences,
  onRateExperience,
}: MyCollectionScreenProps) {
  const [activeTab, setActiveTab] = useState<CollectionTab>(initialTab);
  const { stories, audioTours, myTours, bookings, isLoading, refresh } = useMyCollection(cityId);

  const [previewPack, setPreviewPack] = useState<CityPack | null>(null);
  const [unlockPack, setUnlockPack] = useState<CityPack | null>(null);
  const [selectedTour, setSelectedTour] = useState<UserTour | null>(null);
  const [showInsufficientBalance, setShowInsufficientBalance] = useState(false);
  const [insufficientCost, setInsufficientCost] = useState(0);

  const tabItems = useMemo((): CollectionPreviewItem[] => {
    switch (activeTab) {
      case 'stories':
        return stories.map(toPreviewStory);
      case 'audio_tours':
        return audioTours.map(toPreviewPack);
      case 'my_tours':
        return myTours.map(toPreviewTour);
      case 'bookings':
        return bookings.map(toPreviewBooking);
      default:
        return [];
    }
  }, [activeTab, stories, audioTours, myTours, bookings]);

  const handleRowPress = useCallback(
    (item: CollectionPreviewItem) => {
      if (item.kind === 'story' && item.storyId) {
        onNavigateToStory(item.storyId);
        return;
      }
      if (item.kind === 'audio_tour' && item.packId) {
        const pack = getCityPackById(item.packId);
        if (pack) setPreviewPack(pack);
        return;
      }
      if (item.kind === 'my_tour' && item.tourId) {
        const tour = myTours.find((t) => t.tour.id === item.tourId)?.tour;
        if (tour) setSelectedTour(tour);
        return;
      }
      if (item.kind === 'booking' && item.slug) {
        onNavigateToExperience(item.slug);
      }
    },
    [myTours, onNavigateToStory, onNavigateToExperience],
  );

  const handlePackUnlocked = useCallback(
    (newBalance: number) => {
      onBalanceChange(newBalance);
      refresh();
      setUnlockPack(null);
    },
    [onBalanceChange, refresh],
  );

  return (
    <div className="flex flex-col h-full min-h-0 bg-canvas">
      <StatusBar />
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gamana-100">
        <button type="button" onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-gamana-500/10">
          <ArrowLeft size={20} className="text-heading" />
        </button>
        <h1 className="text-base font-semibold text-heading">My Collection</h1>
      </div>

      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide px-4 py-2.5 border-b border-gamana-100/80">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-none px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              activeTab === tab.id
                ? 'bg-gamana-500 text-white'
                : 'border border-gamana-200/80 text-gamana-600 bg-surface'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
        {activeTab === 'bookings' && onOpenBooking && onExploreExperiences ? (
          <MyBookingsScreen
            embedded
            onBack={onBack}
            onOpenBooking={onOpenBooking}
            onExplore={onExploreExperiences}
            onRateExperience={onRateExperience ?? (() => {})}
          />
        ) : isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 rounded-full border-2 border-gamana-200 border-t-gamana-500 animate-spin" />
          </div>
        ) : tabItems.length === 0 ? (
          <p className="text-sm text-muted text-center py-16 px-4 leading-relaxed">
            {activeTab === 'stories' && 'Unlock stories with coins to see them here.'}
            {activeTab === 'audio_tours' && 'Unlock audio walking tours from the Library.'}
            {activeTab === 'my_tours' && 'Create a custom tour from unlocked stories.'}
          </p>
        ) : (
          <div className="flex flex-col gap-2 px-4 py-4 pb-8">
            {tabItems.map((item) => (
              <CollectionListRow key={item.id} item={item} onPress={() => handleRowPress(item)} />
            ))}
          </div>
        )}
      </div>

      <TourPreviewSheet
        isOpen={!!previewPack}
        onClose={() => setPreviewPack(null)}
        tour={previewPack}
        onUnlockTap={(tour) => {
          setPreviewPack(null);
          setUnlockPack(tour);
        }}
        onStartTour={(tourId) => {
          setPreviewPack(null);
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
          setInsufficientCost(unlockPack?.coin_cost ?? 10);
          setUnlockPack(null);
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

      {onDeleteUserTour && onToggleShare && (
        <TourDetailSheet
          isOpen={!!selectedTour}
          onClose={() => setSelectedTour(null)}
          tour={selectedTour}
          onDeleteTour={async (tourId) => {
            await onDeleteUserTour(tourId);
            refresh();
            setSelectedTour(null);
          }}
          onToggleShare={onToggleShare}
          onNavigateToStory={(storyId) => {
            setSelectedTour(null);
            onNavigateToStory(storyId);
          }}
          onStartWalkingTour={(tourId) => {
            setSelectedTour(null);
            onStartWalkingTour?.('user', tourId);
          }}
        />
      )}
    </div>
  );
}
