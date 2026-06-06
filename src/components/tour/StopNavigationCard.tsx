import type { TourSessionStop } from '../../types';
import { MapPin, Navigation, Headphones, CheckCircle2 } from 'lucide-react';

interface StopNavigationCardProps {
  stop: TourSessionStop;
  stopNumber: number;
  totalStops: number;
  distanceMeters: number;
  etaMinutes: number;
  isPlaying: boolean;
  progress: number;
  compact?: boolean;
}

/** Compact peek-state card — one row with essential info */
function CompactCard({
  stop,
  stopNumber,
  distanceMeters,
  etaMinutes,
  isPlaying,
}: Pick<StopNavigationCardProps, 'stop' | 'stopNumber' | 'distanceMeters' | 'etaMinutes' | 'isPlaying'>) {
  const title = stop.story?.title ?? stop.pinnedLabel ?? `Stop ${stopNumber}`;

  return (
    <div className="flex items-center gap-3">
      {/* Stop badge */}
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
        stop.status === 'completed'
          ? 'bg-emerald-500'
          : stop.status === 'arrived'
            ? 'bg-gamana-500'
            : 'bg-gamana-100'
      }`}>
        {stop.status === 'completed' ? (
          <CheckCircle2 size={18} className="text-white" />
        ) : stop.status === 'arrived' ? (
          <Headphones size={16} className="text-white" />
        ) : (
          <span className="text-sm font-bold text-gamana-600">{stopNumber}</span>
        )}
      </div>

      {/* Title & status */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-heading truncate">{title}</p>
        <p className="text-[11px] text-secondary mt-0.5">
          {stop.status === 'completed'
            ? 'Completed ✓'
            : stop.status === 'arrived'
              ? isPlaying ? 'Now playing...' : 'Tap play to listen'
              : `${distanceMeters > 999 ? `${(distanceMeters / 1000).toFixed(1)} km` : `${distanceMeters} m`} · ~${etaMinutes} min`
          }
        </p>
      </div>

      {/* Status indicator */}
      {stop.status !== 'completed' && stop.status !== 'arrived' && (
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gamana-50 dark:bg-gamana-900/20">
          <Navigation size={10} className="text-gamana-500" />
          <span className="text-[10px] font-semibold text-gamana-600">
            {distanceMeters > 999 ? `${(distanceMeters / 1000).toFixed(1)}km` : `${distanceMeters}m`}
          </span>
        </div>
      )}

      {stop.status === 'arrived' && isPlaying && (
        <div className="flex items-end gap-[2px] h-4 px-2">
          <div className="w-[3px] bg-gamana-500 rounded-full animate-[soundbar_0.8s_ease-in-out_infinite]" style={{ height: '40%' }} />
          <div className="w-[3px] bg-gamana-500 rounded-full animate-[soundbar_0.8s_ease-in-out_infinite_0.2s]" style={{ height: '70%' }} />
          <div className="w-[3px] bg-gamana-500 rounded-full animate-[soundbar_0.8s_ease-in-out_infinite_0.4s]" style={{ height: '50%' }} />
        </div>
      )}
    </div>
  );
}

/** Full stop card (for half/expanded sheet states) */
function FullCard({
  stop,
  stopNumber,
  totalStops,
  distanceMeters,
  etaMinutes,
  isPlaying,
  progress,
}: StopNavigationCardProps) {
  const title = stop.story?.title ?? stop.pinnedLabel ?? `Stop ${stopNumber}`;
  const subtitle = stop.story?.subtitle ?? '';
  const imageUrl = stop.story?.image_url;

  return (
    <div className="bg-surface rounded-2xl shadow-card overflow-hidden border border-border-default/50">
      {/* Status banner */}
      {stop.status === 'completed' ? (
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border-b border-emerald-100">
          <CheckCircle2 size={14} className="text-emerald-500" />
          <span className="text-xs font-semibold text-emerald-700">Stop completed!</span>
        </div>
      ) : stop.status === 'arrived' ? (
        <div className="flex items-center gap-2 px-4 py-2 bg-gamana-50 dark:bg-gamana-900/20 border-b border-gamana-100">
          <Headphones size={14} className="text-gamana-600" />
          <span className="text-xs font-semibold text-body">
            {isPlaying ? 'Now playing...' : 'You\'ve arrived! Tap play to listen'}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2 px-4 py-2 bg-canvas border-b border-sand-100">
          <Navigation size={14} className="text-gamana-500" />
          <span className="text-xs font-medium text-body">
            Walking to stop {stopNumber} of {totalStops}
          </span>
        </div>
      )}

      <div className="flex gap-3 p-3.5">
        {/* Image */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-16 h-16 rounded-xl object-cover flex-shrink-0 shadow-sm"
          />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-gamana-50 dark:bg-gamana-900/20 flex items-center justify-center flex-shrink-0">
            <MapPin size={20} className="text-gamana-400" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-heading truncate">{title}</h4>
          {subtitle && (
            <p className="text-xs text-secondary line-clamp-1 mt-0.5">{subtitle}</p>
          )}

          {stop.status !== 'arrived' && stop.status !== 'completed' && (
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs font-medium text-gamana-600 flex items-center gap-1">
                <Navigation size={10} />
                {distanceMeters > 999
                  ? `${(distanceMeters / 1000).toFixed(1)} km`
                  : `${distanceMeters} m`}
              </span>
              <span className="text-xs text-muted">~{etaMinutes} min walk</span>
            </div>
          )}
        </div>
      </div>

      {/* Proximity progress bar (when walking) */}
      {stop.status === 'locked' && (
        <div className="px-4 pb-3">
          <div className="h-1.5 bg-surface-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gamana-400 to-gamana-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(2, 100 - Math.min(100, distanceMeters / 10))}%` }}
            />
          </div>
        </div>
      )}

      {/* Audio progress (when playing) */}
      {stop.status === 'arrived' && isPlaying && (
        <div className="px-4 pb-3">
          <div className="h-1.5 bg-gamana-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gamana-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function StopNavigationCard(props: StopNavigationCardProps) {
  if (props.compact) {
    return <CompactCard {...props} />;
  }
  return <FullCard {...props} />;
}
