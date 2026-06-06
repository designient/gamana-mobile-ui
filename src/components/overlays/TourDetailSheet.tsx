import { useState, useCallback } from 'react';
import {
  X, MapPin, Trash2, Share2, Copy, Clock,
  CheckCircle2, ExternalLink, Download, Loader2, PlayCircle,
} from 'lucide-react';
import type { UserTour, UserTourStop } from '../../types';
import { useUserTourStops } from '../../hooks/useUserTourStops';
import { enqueueDownload } from '../../lib/downloadManager';

interface TourDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  tour: UserTour | null;
  onDeleteTour: (tourId: string) => void;
  onToggleShare: (tourId: string, isShared: boolean) => Promise<UserTour | null>;
  onNavigateToStory: (storyId: string) => void;
  onStartWalkingTour?: (tourId: string) => void;
}

export default function TourDetailSheet({
  isOpen,
  onClose,
  tour,
  onDeleteTour,
  onToggleShare,
  onNavigateToStory,
  onStartWalkingTour,
}: TourDetailSheetProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isTogglingShare, setIsTogglingShare] = useState(false);
  const [bulkDownloading, setBulkDownloading] = useState(false);
  const [downloadedCount, setDownloadedCount] = useState(0);
  const { stops, isLoading: stopsLoading } = useUserTourStops(tour?.id ?? null);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setLinkCopied(false);
      onClose();
    }, 200);
  }, [onClose]);

  const handleToggleShare = useCallback(async () => {
    if (!tour) return;
    setIsTogglingShare(true);
    await onToggleShare(tour.id, !tour.is_shared);
    setIsTogglingShare(false);
  }, [tour, onToggleShare]);

  const shareUrl = tour?.share_code
    ? `${window.location.origin}/tour/${tour.share_code}`
    : '';

  const handleCopyLink = useCallback(async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      /* clipboard not available */
    }
  }, [shareUrl]);

  const handleNativeShare = useCallback(async () => {
    if (!tour || !shareUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: tour.title,
          text: `Check out my tour: ${tour.title}`,
          url: shareUrl,
        });
      } catch {
        /* share cancelled */
      }
    }
  }, [tour, shareUrl]);

  const handleDelete = useCallback(() => {
    if (!tour) return;
    onDeleteTour(tour.id);
    handleClose();
  }, [tour, onDeleteTour, handleClose]);

  const handleBulkDownload = useCallback(async () => {
    if (!tour || bulkDownloading) return;
    setBulkDownloading(true);
    setDownloadedCount(0);
    const storyStops = stops.filter((s) => s.story_id);
    console.info('tour_bulk_download_tapped', { tour_id: tour.id, stop_count: storyStops.length });
    for (let i = 0; i < storyStops.length; i++) {
      if (storyStops[i].story_id) {
        await enqueueDownload('story', storyStops[i].story_id!);
        setDownloadedCount(i + 1);
      }
    }
    setBulkDownloading(false);
    console.info('tour_bulk_download_completed', { tour_id: tour.id, stop_count: storyStops.length, total_size_bytes: 0 });
  }, [tour, stops, bulkDownloading]);

  if ((!isOpen && !isClosing) || !tour) return null;

  const animState = isClosing ? 'closing' : 'open';

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div
        className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-200 ${
          animState === 'closing' ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
      />

      <div
        className={`relative bg-surface rounded-t-3xl shadow-elevated transition-transform duration-200 ease-out max-h-[85vh] flex flex-col ${
          animState === 'closing' ? 'translate-y-full' : 'animate-slide-up'
        }`}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-8 h-1 rounded-full bg-surface-muted" />
        </div>

        <div className="px-5 pt-2 pb-3 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-heading truncate">{tour.title}</h3>
            {tour.description && (
              <p className="text-xs text-muted mt-0.5 truncate">{tour.description}</p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-muted hover:bg-surface-muted transition-colors ml-2"
          >
            <X size={16} className="text-secondary" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-4">
          <div className="mb-5 p-4 rounded-2xl bg-canvas">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-body uppercase tracking-wider flex items-center gap-1.5">
                <Share2 size={12} />
                Share Tour
              </p>
              <button
                onClick={handleToggleShare}
                disabled={isTogglingShare}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                  tour.is_shared ? 'bg-gamana-500' : 'bg-surface-muted'
                }`}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-surface shadow transition-transform duration-200 ${
                  tour.is_shared ? 'translate-x-[22px]' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            {tour.is_shared && shareUrl ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface border border-sand-200">
                  <span className="text-[11px] text-secondary flex-1 truncate">{shareUrl}</span>
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gamana-50 text-gamana-600 text-[11px] font-medium hover:bg-gamana-100 transition-colors"
                  >
                    {linkCopied ? (
                      <>
                        <CheckCircle2 size={11} />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy size={11} />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                {typeof navigator.share === 'function' && (
                  <button
                    onClick={handleNativeShare}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gamana-500 text-white text-xs font-semibold hover:bg-gamana-600 transition-colors active:scale-[0.98]"
                  >
                    <ExternalLink size={13} />
                    Share with friends
                  </button>
                )}
              </div>
            ) : (
              <p className="text-[11px] text-muted">
                Enable sharing to get a link you can send to friends.
              </p>
            )}
          </div>

          {onStartWalkingTour && (
            <button
              onClick={() => {
                handleClose();
                if (tour) setTimeout(() => onStartWalkingTour(tour.id), 200);
              }}
              disabled={stops.length === 0}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gamana-500 text-white font-semibold text-sm transition-all hover:bg-gamana-600 active:scale-[0.98] shadow-md shadow-gamana-500/20 disabled:opacity-50 mb-3"
            >
              <PlayCircle size={18} />
              Start Walking Tour
            </button>
          )}

          <button
            onClick={handleBulkDownload}
            disabled={bulkDownloading || stops.length === 0}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gamana-200 text-sm font-medium text-gamana-600 hover:bg-gamana-50 transition-colors disabled:opacity-50 mb-3"
          >
            {bulkDownloading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Downloading {downloadedCount} of {stops.filter((s) => s.story_id).length}...
              </>
            ) : (
              <>
                <Download size={16} />
                Download all stops
              </>
            )}
          </button>

          <div className="mb-5">
            <p className="text-xs font-semibold text-body uppercase tracking-wider mb-2">
              {stops.length} {stops.length === 1 ? 'Stop' : 'Stops'}
            </p>

            {stopsLoading ? (
              <div className="flex justify-center py-6">
                <div className="w-7 h-7 rounded-full border-2 border-gamana-200 border-t-gamana-500 animate-spin" />
              </div>
            ) : stops.length === 0 ? (
              <p className="text-xs text-muted py-4 text-center">No stops in this tour yet.</p>
            ) : (
              <div className="flex flex-col gap-1">
                {stops.map((stop, index) => (
                  <StopRow
                    key={stop.id}
                    stop={stop}
                    index={index}
                    isLast={index === stops.length - 1}
                    onTap={() => {
                      if (stop.story_id) onNavigateToStory(stop.story_id);
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleDelete}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors"
          >
            <Trash2 size={14} />
            Delete Tour
          </button>
        </div>
      </div>
    </div>
  );
}

function StopRow({
  stop,
  index,
  isLast,
  onTap,
}: {
  stop: UserTourStop;
  index: number;
  isLast: boolean;
  onTap: () => void;
}) {
  const isStory = !!stop.story_id;
  return (
    <button
      onClick={onTap}
      disabled={!isStory}
      className="flex items-stretch gap-3 text-left group"
    >
      <div className="flex flex-col items-center w-6">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
          isStory ? 'bg-gamana-100 text-gamana-600' : 'bg-amber-100 text-amber-600'
        }`}>
          {index + 1}
        </div>
        {!isLast && <div className="w-px flex-1 bg-sand-200 my-0.5" />}
      </div>

      <div className={`flex-1 pb-3 flex items-center gap-2.5 ${!isLast ? 'border-b border-sand-100' : ''}`}>
        {isStory && stop.story ? (
          <>
            <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-gamana-100">
              {stop.story.image_url && (
                <img src={stop.story.image_url} alt="" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-heading truncate group-hover:text-gamana-600 transition-colors">
                {stop.story.title}
              </p>
              <span className="text-[11px] text-muted flex items-center gap-0.5">
                <Clock size={9} />
                {Math.round(stop.story.duration_seconds / 60)} min
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
              <MapPin size={14} className="text-amber-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-heading truncate">
                {stop.pinned_label ?? 'Pinned location'}
              </p>
              {stop.pinned_lat != null && stop.pinned_lng != null && (
                <span className="text-[11px] text-muted">
                  {stop.pinned_lat.toFixed(4)}, {stop.pinned_lng.toFixed(4)}
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </button>
  );
}
