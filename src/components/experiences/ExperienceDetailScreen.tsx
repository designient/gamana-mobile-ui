import { useEffect, useState, useMemo } from 'react';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { useExperienceDetail } from '../../hooks/useExperiences';
import { formatPriceLabel } from '../../lib/experience-mappers';
import { trackExperienceEvent, priceBucket } from '../../lib/experience-analytics';
import { toggleExperienceSaved } from '../../lib/experience-saved';
import { useConnectivity } from '../../hooks/useConnectivity';
import StatusBar from '../layout/StatusBar';
import ExperienceAvailabilityPanel from './ExperienceAvailabilityPanel';
import ExperiencePhotoGallery from './detail/ExperiencePhotoGallery';
import ExperienceDetailHeader from './detail/ExperienceDetailHeader';
import ExperienceActivityFacts from './detail/ExperienceActivityFacts';
import ExperienceHighlights from './detail/ExperienceHighlights';
import ExperienceItinerary from './detail/ExperienceItinerary';
import ExperienceDescriptionBlock from './detail/ExperienceDescriptionBlock';
import ExperienceInclusionsBlock from './detail/ExperienceInclusionsBlock';
import ExperienceRestrictionsBlock from './detail/ExperienceRestrictionsBlock';
import ExperiencePoliciesBlock from './detail/ExperiencePoliciesBlock';
import ExperienceKnowBeforeYouGoBlock from './detail/ExperienceKnowBeforeYouGoBlock';
import ExperienceSoldOutBanner from './detail/ExperienceSoldOutBanner';
import ExperienceOnRequestBadge from './detail/ExperienceOnRequestBadge';
import ExperienceMeetingBlock from './detail/ExperienceMeetingBlock';
import ExperienceReviewsSummary from './detail/ExperienceReviewsSummary';
import ExperienceSectionNav from './detail/ExperienceSectionNav';
import ExperienceDetailBookingBar from './detail/ExperienceDetailBookingBar';
import DetailSection from './detail/DetailSection';
import DatePaxSheet from './booking/DatePaxSheet';
import type { BookingFlowState } from '../../lib/experience-booking-flow';

interface ExperienceDetailScreenProps {
  slug: string;
  onBack: () => void;
  onNavigateToStory?: (storyId: string) => void;
  onBookingFlowContinue: (flowState: BookingFlowState) => void;
}

export default function ExperienceDetailScreen({
  slug,
  onBack,
  onNavigateToStory,
  onBookingFlowContinue,
}: ExperienceDetailScreenProps) {
  const { experience, isLoading } = useExperienceDetail(slug);
  const { isOnline } = useConnectivity();
  const [datePaxOpen, setDatePaxOpen] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const photos = useMemo(() => {
    if (!experience) return [];
    const urls = experience.photoUrls?.length
      ? experience.photoUrls
      : experience.heroImageUrl
        ? [experience.heroImageUrl]
        : [];
    return urls;
  }, [experience]);

  const visibleSectionIds = useMemo(() => {
    if (!experience) return [];
    const ids = ['section-overview', 'section-availability'];
    if (experience.itinerary?.length) ids.push('section-itinerary');
    if (experience.inclusions?.length || experience.exclusions?.length) {
      ids.push('section-includes');
    }
    if (experience.reviewSummary) ids.push('section-reviews');
    return ids;
  }, [experience]);

  useEffect(() => {
    if (experience) {
      trackExperienceEvent('experience_detail_viewed', {
        experienceId: experience.id,
        source: experience.source,
        category: experience.category,
        city: experience.city,
        priceBucket: priceBucket(experience.priceFrom),
        hasLinkedStory: experience.hasLinkedStory,
      });
    }
  }, [experience]);

  function handleBook() {
    if (!experience || slug === 'nandi-hills-day-trip') return;
    trackExperienceEvent('booking_cta_clicked', {
      experienceId: experience.id,
      category: experience.category,
      city: experience.city,
    });
    setBookingError(null);
    setDatePaxOpen(true);
  }

  function handleDatePaxContinue(flowState: BookingFlowState) {
    setDatePaxOpen(false);
    onBookingFlowContinue(flowState);
  }

  function scrollToAvailability() {
    document.getElementById('section-availability')?.scrollIntoView({ behavior: 'smooth' });
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full min-h-0 bg-canvas">
        <StatusBar />
        <div className="flex flex-col items-center justify-center flex-1">
          <div className="w-10 h-10 rounded-full border-2 border-gamana-200 border-t-gamana-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="flex flex-col h-full min-h-0 bg-canvas">
        <StatusBar />
        <div className="p-4">
          <button type="button" onClick={onBack} className="p-2 -ml-2">
            <ArrowLeft size={20} />
          </button>
          <p className="text-sm text-muted mt-8 text-center">Experience not found.</p>
        </div>
      </div>
    );
  }

  const summary = experience.gamanaEditorialSummary ?? experience.shortDescription;
  const priceLabel = formatPriceLabel(experience.priceFrom, experience.priceCurrency);
  const descriptionText =
    experience.longDescription ?? experience.shortDescription;
  const isSoldOut = slug === 'nandi-hills-day-trip';
  const isOnRequest = experience.instantConfirmation === false;
  const isAttractionTicket = experience.experienceType === 'Attraction Ticket';
  const importantInformationText = experience.importantInformation?.join('; ');
  const hasKnowBeforeYouGo =
    !!experience.knowBeforeYouGo ||
    !!importantInformationText ||
    (experience.whatToBring?.length ?? 0) > 0;

  function handleSaveToWishlist() {
    toggleExperienceSaved(experience.id);
  }

  return (
    <div className="relative flex flex-col h-full min-h-0 bg-canvas">
      <StatusBar />

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
        <div className="relative flex-shrink-0">
          <ExperiencePhotoGallery photos={photos} title={experience.title} />
          <button
            type="button"
            onClick={onBack}
            className="absolute top-3 left-3 p-2 rounded-full bg-black/40 text-white z-10"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
        </div>

        {isSoldOut && (
          <ExperienceSoldOutBanner
            onCheckDates={scrollToAvailability}
            onSaveToWishlist={handleSaveToWishlist}
          />
        )}

        <ExperienceSectionNav visibleIds={visibleSectionIds} />

        <div id="section-overview">
          <ExperienceDetailHeader experience={experience} />

          <DetailSection noBorder>
            <ExperienceActivityFacts experience={experience} />
          </DetailSection>

          {isOnRequest && <ExperienceOnRequestBadge />}

          <DetailSection title="Why Gamana recommends this">
            <p className="text-sm text-heading leading-relaxed">{summary}</p>
          </DetailSection>

          {experience.hasLinkedStory && experience.linkedStoryId && onNavigateToStory && (
            <div className="px-4 pb-5">
              <button
                type="button"
                onClick={() => {
                  trackExperienceEvent('linked_story_clicked', {
                    experienceId: experience.id,
                    storyId: experience.linkedStoryId,
                  });
                  onNavigateToStory(experience.linkedStoryId!);
                }}
                className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-gamana-500/8 border border-gamana-200"
              >
                <BookOpen size={20} className="text-gamana-500 flex-shrink-0" />
                <div className="text-left flex-1 min-w-0">
                  <p className="text-sm font-semibold text-heading">Listen to linked story</p>
                  <p className="text-xs text-muted truncate">
                    {experience.linkedStoryLabel ?? 'Related audio'}
                  </p>
                </div>
              </button>
            </div>
          )}
        </div>

        {experience.highlights && experience.highlights.length > 0 && (
          <DetailSection title="Highlights">
            <ExperienceHighlights highlights={experience.highlights} />
          </DetailSection>
        )}

        {experience.itinerary && experience.itinerary.length > 0 && (
          <DetailSection id="section-itinerary" title="Itinerary">
            <p className="text-[11px] text-muted mb-3 -mt-1">
              For reference only. Itineraries may change.
            </p>
            <ExperienceItinerary stops={experience.itinerary} experienceId={experience.id} />
          </DetailSection>
        )}

        <DetailSection title="About this experience">
          <ExperienceDescriptionBlock text={descriptionText} experienceId={experience.id} />
        </DetailSection>

        {(experience.inclusions?.length || experience.exclusions?.length) ? (
          <DetailSection id="section-includes" title="What's included">
            <ExperienceInclusionsBlock
              inclusions={experience.inclusions ?? []}
              exclusions={experience.exclusions ?? []}
            />
          </DetailSection>
        ) : null}

        {hasKnowBeforeYouGo && (
          <DetailSection>
            <ExperienceKnowBeforeYouGoBlock
              knowBeforeYouGo={experience.knowBeforeYouGo}
              importantInformation={importantInformationText}
              whatToBring={experience.whatToBring}
            />
          </DetailSection>
        )}

        <DetailSection noBorder>
          <ExperienceRestrictionsBlock
            notSuitableFor={experience.notSuitableFor}
          />
        </DetailSection>

        <DetailSection noBorder>
          <ExperiencePoliciesBlock
            cancellationPolicy={experience.cancellationPolicy}
          />
        </DetailSection>

        {(experience.meetingPointText || experience.pickupAvailable) && (
          <DetailSection title="Meeting & pickup" noBorder>
            <ExperienceMeetingBlock experience={experience} />
          </DetailSection>
        )}

        {experience.reviewSummary && (
          <DetailSection id="section-reviews" title="Reviews">
            <ExperienceReviewsSummary reviews={experience.reviewSummary} />
          </DetailSection>
        )}

        <DetailSection
          id="section-availability"
          title={isAttractionTicket ? 'Get your ticket' : 'Check availability'}
          noBorder
        >
          <ExperienceAvailabilityPanel
            experienceId={experience.id}
            category={experience.category}
            city={experience.city}
            experienceType={experience.experienceType}
          />
        </DetailSection>

        <div className="h-3" aria-hidden />
      </div>

      <ExperienceDetailBookingBar
        priceLabel={priceLabel}
        priceFrom={experience.priceFrom}
        priceWas={experience.priceWas}
        bookingError={bookingError}
        bookingLoading={false}
        isOnline={isOnline}
        bookable={experience.bookableInApp}
        instantConfirmation={experience.instantConfirmation}
        soldOut={isSoldOut}
        onCheckDates={scrollToAvailability}
        onBook={handleBook}
      />

      <DatePaxSheet
        isOpen={datePaxOpen}
        experience={experience}
        onClose={() => setDatePaxOpen(false)}
        onContinue={handleDatePaxContinue}
      />
    </div>
  );
}
