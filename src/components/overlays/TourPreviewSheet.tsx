import { useEffect, useState, useCallback } from 'react';
import { X, Headphones, Clock, MapPin, PlayCircle, Lock, CalendarClock, Share2, Download, Loader2 } from 'lucide-react';
import type { CityPack, Story, ContentAccessStatus } from '../../types';
import { cityPackStories, stories as allStories } from '../../lib/seed-data';
import { getContentAccess } from '../../lib/localDb';
import { enqueueDownload } from '../../lib/downloadManager';

interface TourPreviewSheetProps {
  isOpen: boolean;
  onClose: () => void;
  tour: CityPack | null;
  onUnlockTap: (tour: CityPack) => void;
  onStartTour?: (tourId: string) => void;
}

export default function TourPreviewSheet({ isOpen, onClose, tour, onUnlockTap, onStartTour }: TourPreviewSheetProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [packStories, setPackStories] = useState<Story[]>([]);
  const [access, setAccess] = useState<ContentAccessStatus>({ is_unlocked: false, is_expired: false, days_remaining: 0 });
  const [bulkDownloading, setBulkDownloading] = useState(false);
  const [downloadedCount, setDownloadedCount] = useState(0);

  useEffect(() => {
    if (tour) {
      const storyIds = cityPackStories.filter(ps => ps.pack_id === tour.id).map(ps => ps.story_id);
      const filtered = allStories.filter(s => storyIds.includes(s.id));
      setPackStories(filtered as Story[]);
      const accessResult = getContentAccess('pack', tour.id);
      setAccess(accessResult);
    } else {
      setPackStories([]);
      setAccess({ is_unlocked: false, is_expired: false, days_remaining: 0 });
    }
  }, [tour, isOpen]);

  const handleShareTour = useCallback(async () => {
    if (!tour) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: tour.title,
          text: `Check out this tour: ${tour.title} — ${tour.subtitle}`,
          url: window.location.origin,
        });
      } catch {
        /* share cancelled */
      }
    }
  }, [tour]);

  const handleBulkDownload = useCallback(async () => {
    if (!tour || bulkDownloading || packStories.length === 0) return;
    setBulkDownloading(true);
    setDownloadedCount(0);
    for (let i = 0; i < packStories.length; i++) {
      await enqueueDownload('story', packStories[i].id);
      setDownloadedCount(i + 1);
    }
    setBulkDownloading(false);
  }, [tour, packStories, bulkDownloading]);



  if (!isOpen && !isClosing) return null;

  const animState = isClosing ? 'closing' : 'open';

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  };

  if (!tour) return null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end pointer-events-auto">
      <div 
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200 ${
          animState === 'closing' ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
      />
      
      <div 
        className={`relative bg-surface-alt rounded-t-3xl shadow-elevated transition-transform duration-200 ease-out flex flex-col max-h-[90vh] ${
          animState === 'closing' ? 'translate-y-full' : 'translate-y-0'
        }`}
      >
        <div className="flex justify-center pt-3 pb-2 flex-shrink-0 bg-surface rounded-t-3xl">
          <div className="w-10 h-1.5 rounded-full bg-surface-muted" />
        </div>
        
        <div className="absolute top-4 right-4 z-10">
          <button 
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/30 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto scrollbar-hide flex-1 pb-32">
          {/* Header Image & Info */}
          <div className="relative h-56 w-full bg-surface-muted rounded-b-3xl overflow-hidden shadow-sm">
            <img 
              src={tour.image_url ?? ''} 
              alt={tour.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-4 left-5 right-5">
              <h2 className="text-2xl font-bold text-white mb-1 leading-tight">{tour.title}</h2>
              <p className="text-sm text-gray-200 line-clamp-2">{tour.subtitle}</p>
              
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-white/90 text-sm font-medium">
                  <MapPin size={14} />
                  <span>{tour.story_count} stops</span>
                </div>
                <div className="flex items-center gap-1.5 text-white/90 text-sm font-medium">
                  <Clock size={14} />
                  <span>{Math.round(tour.total_duration_seconds / 60)} min</span>
                </div>
              </div>
            </div>
          </div>

          <div className="px-5 mt-6 mb-2">
            <h3 className="text-sm font-bold text-heading uppercase tracking-wider mb-4">Tour Route</h3>
            
            <div className="relative border-l-2 border-dashed border-border-default ml-3 pl-6 space-y-6">
              {packStories.map((story, idx) => (
                <div key={story.id} className="relative">
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-surface border-4 border-gamana-500 shadow-sm" />
                  <div className="flex gap-3">
                    <img 
                      src={story.image_url ?? ''} 
                      alt={story.title}
                      className="w-16 h-16 rounded-xl object-cover shadow-sm flex-shrink-0 bg-surface-muted"
                    />
                    <div>
                      <h4 className="font-semibold text-heading text-sm">{idx + 1}. {story.title}</h4>
                      <p className="text-xs text-secondary mt-1 line-clamp-2">{story.subtitle}</p>
                      <div className="flex items-center gap-1 mt-1.5 text-xs text-gamana-500 font-medium">
                        <Headphones size={12} />
                        {Math.round(story.duration_seconds / 60)} min audio
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-6">
              {typeof navigator.share === 'function' && (
                <button
                  onClick={handleShareTour}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gamana-200 text-sm font-medium text-gamana-600 hover:bg-gamana-50 transition-colors"
                >
                  <Share2 size={16} />
                  Share Tour
                </button>
              )}
              <button
                onClick={handleBulkDownload}
                disabled={bulkDownloading || packStories.length === 0}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gamana-200 text-sm font-medium text-gamana-600 hover:bg-gamana-50 transition-colors disabled:opacity-50"
              >
                {bulkDownloading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {downloadedCount}/{packStories.length}
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    Download All Stops
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Sticky footer */}
        <div className="absolute bottom-0 left-0 right-0 bg-surface border-t border-border-default p-4 pb-8 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <div className="flex flex-col gap-2">
            {/* Show Start Walking Tour only if unlocked and not expired */}
            {access.is_unlocked && !access.is_expired ? (
              <>
                <button
                  onClick={() => {
                    handleClose();
                    if (onStartTour) setTimeout(() => onStartTour(tour.id), 200);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gamana-500 text-white font-semibold text-sm transition-all hover:bg-gamana-600 active:scale-[0.98] shadow-md shadow-gamana-500/20"
                >
                  <PlayCircle size={18} />
                  Start Walking Tour
                </button>
                {access.days_remaining !== undefined && access.days_remaining <= 7 && (
                  <div className="flex items-center justify-center gap-1.5 text-xs text-amber-600">
                    <CalendarClock size={12} />
                    <span>Expires in {access.days_remaining} day{access.days_remaining !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </>
            ) : access.is_unlocked && access.is_expired ? (
              <>
                <div className="flex items-center justify-center gap-1.5 text-xs text-red-500 mb-1">
                  <CalendarClock size={12} />
                  <span>Tour access expired — re-unlock to continue</span>
                </div>
                <button
                  onClick={() => {
                    handleClose();
                    setTimeout(() => onUnlockTap(tour), 200);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gamana-500 text-white font-semibold text-sm transition-all hover:bg-gamana-600 active:scale-[0.98] shadow-md shadow-gamana-500/20"
                >
                  <Lock size={16} />
                  Re-Unlock for {tour.coin_cost} coins
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  handleClose();
                  setTimeout(() => onUnlockTap(tour), 200);
                }}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gamana-500 text-white font-semibold text-sm transition-all hover:bg-gamana-600 active:scale-[0.98] shadow-md shadow-gamana-500/20"
              >
                <Lock size={16} />
                Unlock Tour for {tour.coin_cost} coins
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
