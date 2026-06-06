import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Navigation, Locate, Play, ShieldAlert, Users } from 'lucide-react';
import type { TourSession, TourSessionStop, Story, Narrator } from '../../types';
import TourMapHeader from './TourMapHeader';
import StopNavigationCard from './StopNavigationCard';
import TourAudioPlayer from './TourAudioPlayer';
import TourBottomSheet, { type SheetState } from './TourBottomSheet';
import TourExitConfirmSheet from './TourExitConfirmSheet';
import SOSSheet from '../family/SOSSheet';
import TourFamilyPanel from './TourFamilyPanel';
import { useGPSTracking } from '../../hooks/useGPSTracking';
import { useFamilyTracking } from '../../hooks/useFamilyTracking';
import { useFamilyMessages } from '../../hooks/useFamilyMessages';
import { getAutoTrigger } from '../../lib/localDb';

interface WalkingTourActiveProps {
  session: TourSession;
  currentStop: TourSessionStop | null;
  narrator: Narrator | null;
  isPlaying: boolean;
  progress: number;
  onArriveAtStop: (index: number) => void;
  onCompleteStop: (index: number) => void;
  onPlayStory: (story: Story, narrator: Narrator | null) => void;
  onTogglePlay: () => void;
  onExitTour: () => void;
}

export default function WalkingTourActive({
  session,
  currentStop,
  narrator,
  isPlaying,
  progress,
  onArriveAtStop,
  onCompleteStop,
  onPlayStory,
  onTogglePlay,
  onExitTour,
}: WalkingTourActiveProps) {
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showSOS, setShowSOS] = useState(false);
  const [showFamilyPanel, setShowFamilyPanel] = useState(false);
  const [autoPlayTriggered, setAutoPlayTriggered] = useState<string | null>(null);
  const [sheetState, setSheetState] = useState<SheetState>('half');
  const [autoTriggerEnabled] = useState(() => getAutoTrigger());

  const { groups, activeGroup } = useFamilyTracking();
  const firstGroup = activeGroup ?? groups[0] ?? null;
  const { unreadCount } = useFamilyMessages(firstGroup?.id ?? null);
  const hasFamily = groups.length > 0;
  const sharingCount = firstGroup
    ? firstGroup.members.filter((m) => m.visibility === 'visible' && m.location).length
    : 0;

  const {
    userLat,
    userLng,
    distanceToNextStop,
    etaMinutes,
    isWithinRadius,
    bearingToNextStop,
  } = useGPSTracking(session.stops, session.currentStopIndex, session.status === 'active');

  // Auto-arrive when within geofence radius
  useEffect(() => {
    if (isWithinRadius && currentStop && currentStop.status === 'locked') {
      onArriveAtStop(session.currentStopIndex);
    }
  }, [isWithinRadius, currentStop, session.currentStopIndex, onArriveAtStop]);

  // Auto-play when arrived at stop (gated by user's auto-trigger preference)
  useEffect(() => {
    if (
      autoTriggerEnabled &&
      currentStop?.status === 'arrived' &&
      currentStop.story &&
      autoPlayTriggered !== currentStop.id
    ) {
      setAutoPlayTriggered(currentStop.id);
      const timer = setTimeout(() => {
        onPlayStory(currentStop.story!, narrator);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [autoTriggerEnabled, currentStop, autoPlayTriggered, narrator, onPlayStory]);

  // Auto-complete stop when audio finishes (progress hits 100)
  useEffect(() => {
    if (currentStop?.status === 'arrived' && isPlaying && progress >= 99) {
      const timer = setTimeout(() => {
        onCompleteStop(session.currentStopIndex);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentStop, isPlaying, progress, session.currentStopIndex, onCompleteStop]);

  // Auto-adjust sheet state based on stop status
  useEffect(() => {
    if (currentStop?.status === 'arrived') {
      // Expand to show audio player when arriving
      setSheetState('half');
    } else if (currentStop?.status === 'locked') {
      // Collapse to peek mode when walking
      setSheetState('peek');
    }
  }, [currentStop?.status]);

  const completedCount = session.stops.filter((s) => s.status === 'completed').length;

  const isNearStop = distanceToNextStop <= 50;
  const distanceDisplay = distanceToNextStop > 999
    ? `${(distanceToNextStop / 1000).toFixed(1)} km`
    : `${distanceToNextStop} m`;

  const handleOpenGoogleMaps = useCallback(() => {
    if (!currentStop) return;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${currentStop.lat},${currentStop.lng}&travelmode=walking`;
    window.open(url, '_blank');
  }, [currentStop, userLat, userLng]);

  const handleSkip = useCallback(() => {
    onCompleteStop(session.currentStopIndex);
  }, [session.currentStopIndex, onCompleteStop]);

  const handleManualPlay = useCallback(() => {
    if (currentStop?.story) {
      setAutoPlayTriggered(currentStop.id);
      onPlayStory(currentStop.story, narrator);
    }
  }, [currentStop, narrator, onPlayStory]);

  // ─── Peek content: compact nav card + optional mini player ───
  const peekContent = (
    <div>
      {currentStop && (
        <StopNavigationCard
          stop={currentStop}
          stopNumber={session.currentStopIndex + 1}
          totalStops={session.stops.length}
          distanceMeters={distanceToNextStop}
          etaMinutes={etaMinutes}
          isPlaying={isPlaying}
          progress={progress}
          compact
        />
      )}
      {currentStop?.status === 'arrived' && currentStop.story && isPlaying && (
        <TourAudioPlayer
          story={currentStop.story}
          narrator={narrator}
          isPlaying={isPlaying}
          progress={progress}
          onTogglePlay={onTogglePlay}
          onSkip={handleSkip}
          mini
        />
      )}
      {currentStop?.status === 'arrived' && currentStop.story && !isPlaying && !autoTriggerEnabled && autoPlayTriggered !== currentStop.id && (
        <button
          onClick={handleManualPlay}
          className="w-full flex items-center justify-center gap-2 py-2.5 mt-2 rounded-xl bg-gamana-500 text-white text-sm font-semibold active:scale-[0.97] transition-transform"
        >
          <Play size={16} fill="white" />
          Play Story
        </button>
      )}
    </div>
  );

  // ─── Half content: full stop card + full audio player ───
  const halfContent = (
    <div className="space-y-3">
      {currentStop && (
        <StopNavigationCard
          stop={currentStop}
          stopNumber={session.currentStopIndex + 1}
          totalStops={session.stops.length}
          distanceMeters={distanceToNextStop}
          etaMinutes={etaMinutes}
          isPlaying={isPlaying}
          progress={progress}
        />
      )}
      {currentStop?.status === 'arrived' && currentStop.story && (isPlaying || autoTriggerEnabled || autoPlayTriggered === currentStop.id) && (
        <TourAudioPlayer
          story={currentStop.story}
          narrator={narrator}
          isPlaying={isPlaying}
          progress={progress}
          onTogglePlay={onTogglePlay}
          onSkip={handleSkip}
        />
      )}
      {currentStop?.status === 'arrived' && currentStop.story && !isPlaying && !autoTriggerEnabled && autoPlayTriggered !== currentStop.id && (
        <button
          onClick={handleManualPlay}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gamana-500 text-white text-sm font-semibold active:scale-[0.97] transition-transform"
        >
          <Play size={16} fill="white" />
          Play Story
        </button>
      )}
    </div>
  );

  // ─── Expanded content: all stops list ───
  const expandedContent = (
    <div className="mt-2">
      <h4 className="text-xs font-semibold text-body uppercase tracking-wider mb-2">
        All Stops
      </h4>
      <div className="flex flex-col gap-1">
        {session.stops.map((stop, i) => (
          <div
            key={stop.id}
            className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
              i === session.currentStopIndex ? 'bg-gamana-50 dark:bg-gamana-900/20' : ''
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${
                stop.status === 'completed'
                  ? 'bg-emerald-500 text-white'
                  : i === session.currentStopIndex
                    ? 'bg-gamana-500 text-white'
                    : 'bg-surface-muted text-secondary'
              }`}
            >
              {stop.status === 'completed' ? '✓' : i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-medium truncate ${
                stop.status === 'completed' ? 'text-muted line-through' : 'text-heading'
              }`}>
                {stop.story?.title ?? stop.pinnedLabel ?? `Stop ${i + 1}`}
              </p>
            </div>
            {stop.story && (
              <span className="text-[10px] text-muted">
                {Math.round(stop.story.duration_seconds / 60)}m
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-canvas relative">
      {/* Minimal header bar — floating over map */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-3 pt-12 pb-2">
        <button
          onClick={() => setShowExitConfirm(true)}
          className="w-8 h-8 rounded-full bg-surface/90 backdrop-blur-md shadow-sm flex items-center justify-center"
        >
          <ArrowLeft size={16} className="text-heading" />
        </button>
        <div className="px-3 py-1 rounded-full bg-surface/90 backdrop-blur-md shadow-sm">
          <span className="text-xs font-semibold text-heading">
            Stop {session.currentStopIndex + 1} of {session.stops.length}
          </span>
        </div>
        <button
          onClick={() => setShowSOS(true)}
          className="w-8 h-8 rounded-full bg-red-500 shadow-sm flex items-center justify-center active:scale-95 transition-transform"
          title="Emergency SOS"
        >
          <ShieldAlert size={14} className="text-white" />
        </button>
      </div>

      {/* Map — fills available space above the bottom sheet */}
      <TourMapHeader
        stops={session.stops}
        currentStopIndex={session.currentStopIndex}
        userLat={userLat}
        userLng={userLng}
        distanceMeters={distanceToNextStop}
        etaMinutes={etaMinutes}
        bearingDeg={bearingToNextStop}
      />

      {/* Bottom Sheet */}
      <TourBottomSheet
        state={sheetState}
        onStateChange={setSheetState}
        peekContent={peekContent}
        halfContent={halfContent}
        expandedContent={expandedContent}
      />

      {/* Get Directions FAB — floats above bottom sheet */}
      {currentStop && currentStop.status !== 'completed' && (
        <button
          onClick={handleOpenGoogleMaps}
          className="absolute right-4 z-50 flex items-center gap-2.5 pl-3.5 pr-4 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-xl shadow-blue-600/30 hover:shadow-blue-600/40 active:scale-[0.97] transition-all duration-300"
          style={{ bottom: sheetState === 'peek' ? 'calc(18% + 12px)' : sheetState === 'half' ? 'calc(45% + 12px)' : 'calc(88% + 12px)' }}
          title="Navigate with Google Maps"
        >
          <div className="w-9 h-9 rounded-xl bg-surface/20 flex items-center justify-center flex-shrink-0">
            <Navigation size={20} className="text-white" fill="white" />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-sm font-bold leading-tight">Directions</span>
            {!isNearStop && (
              <span className="text-[10px] text-white/75 leading-tight mt-0.5">
                {distanceDisplay} · {etaMinutes} min
              </span>
            )}
            {isNearStop && (
              <span className="text-[10px] text-emerald-200 leading-tight mt-0.5">
                Almost there!
              </span>
            )}
          </div>
        </button>
      )}

      {/* Family tracking FAB — floats above re-center, left side */}
      {hasFamily && (
        <button
          onClick={() => setShowFamilyPanel(true)}
          className="absolute left-4 z-50 w-10 h-10 rounded-xl bg-surface/95 shadow-lg border border-border-default/80 backdrop-blur-sm flex items-center justify-center hover:bg-surface active:scale-95 transition-all duration-300"
          style={{ bottom: sheetState === 'peek' ? 'calc(18% + 68px)' : sheetState === 'half' ? 'calc(45% + 68px)' : 'calc(88% + 68px)' }}
          title="Family tracking"
        >
          <Users size={18} className="text-gamana-600" />
          {(unreadCount > 0 || sharingCount > 0) && (
            <span className={`absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center border-2 border-white px-0.5 ${
              unreadCount > 0 ? 'bg-red-500' : 'bg-emerald-500'
            }`}>
              {unreadCount > 0 ? (unreadCount > 9 ? '9+' : unreadCount) : sharingCount}
            </span>
          )}
        </button>
      )}

      {/* Re-center button — floats above bottom sheet, left side */}
      <button
        onClick={() => window.location.reload()}
        className="absolute left-4 z-50 w-10 h-10 rounded-xl bg-surface/95 shadow-lg border border-border-default/80 backdrop-blur-sm flex items-center justify-center hover:bg-surface active:scale-95 transition-all duration-300"
        style={{ bottom: sheetState === 'peek' ? 'calc(18% + 16px)' : sheetState === 'half' ? 'calc(45% + 16px)' : 'calc(88% + 16px)' }}
        title="Re-center map"
      >
        <Locate size={18} className="text-gamana-600" />
      </button>

      {/* Exit Confirm */}
      <TourExitConfirmSheet
        isOpen={showExitConfirm}
        onClose={() => setShowExitConfirm(false)}
        onExitTour={onExitTour}
        stopsCompleted={completedCount}
        totalStops={session.stops.length}
      />

      {/* Emergency SOS overlay */}
      <SOSSheet isOpen={showSOS} onClose={() => setShowSOS(false)} />

      {/* Family tracking panel */}
      {firstGroup && (
        <TourFamilyPanel
          isOpen={showFamilyPanel}
          onClose={() => setShowFamilyPanel(false)}
          group={firstGroup}
        />
      )}
    </div>
  );
}
