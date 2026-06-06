import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Play, Pause, Trash2, Loader2, HardDrive, AlertCircle,
  ChevronDown, ChevronUp, Clock, Download,
} from 'lucide-react';
import type { DownloadState } from '../../types';
import { getAllDownloads, deleteDownload } from '../../lib/downloadManager';
import type { Story } from '../../types';
import { getStoryById, getNarrators, getCityPackById, getPackStoryIds, getTourStops } from '../../lib/localDb';

type DownloadFilter = 'all' | 'stories' | 'tours';

const EXPIRY_DAYS = 30;

interface EnrichedDownload extends DownloadState {
  title: string;
  subtitle: string;
  imageUrl: string | null;
  narratorName: string | null;
  durationSeconds: number;
  daysUntilExpiry: number | null;
  city: string | null;
}

interface DownloadsSectionProps {
  onNavigateToStory: (storyId: string) => void;
}

function getExpiryDays(downloadedAt: string | null): number | null {
  if (!downloadedAt) return null;
  const downloaded = new Date(downloadedAt);
  const expiry = new Date(downloaded.getTime() + EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  const now = new Date();
  const diff = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

function formatDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function ExpiryBadge({ days }: { days: number | null }) {
  if (days === null) return null;
  const color = days <= 5 ? 'text-red-500' : days <= 14 ? 'text-amber-500' : 'text-emerald-500';
  const bg = days <= 5 ? 'bg-red-50 dark:bg-red-900/20' : days <= 14 ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20';
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-medium ${color} ${bg} px-1.5 py-0.5 rounded-full`}>
      <Clock size={8} />
      {days === 0 ? 'Expires today' : `Expires in ${days} day${days !== 1 ? 's' : ''}`}
    </span>
  );
}

function DownloadStoryCard({
  item,
  isPlaying,
  onPlay,
  onTap,
  onDelete,
}: {
  item: EnrichedDownload;
  isPlaying: boolean;
  onPlay: () => void;
  onTap: () => void;
  onDelete: () => void;
}) {
  const sizeMb = item.sizeBytes ? (item.sizeBytes / (1024 * 1024)).toFixed(1) : null;

  return (
    <div className="flex items-start gap-3 p-3 bg-surface rounded-2xl shadow-card">
      <button onClick={onTap} className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gamana-50 dark:bg-gamana-900/20">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gamana-100 to-gamana-200" />
        )}
        {item.itemType === 'tour' && (
          <span className="absolute bottom-1 left-1 text-[8px] font-bold text-white bg-gamana-600 px-1.5 py-0.5 rounded">
            TOUR
          </span>
        )}
      </button>

      <div className="flex-1 min-w-0 py-0.5">
        <button onClick={onTap} className="text-left w-full">
          <h4 className="text-[13px] font-semibold text-heading truncate leading-tight">{item.title}</h4>
          <p className="text-[11px] text-muted truncate mt-0.5">
            {item.city ?? item.subtitle}
            {item.durationSeconds > 0 && ` · ${Math.round(item.durationSeconds / 60)} mins`}
          </p>
        </button>
        <div className="flex items-center gap-2 mt-1">
          {item.narratorName && (
            <span className="text-[10px] text-gamana-600/60 font-medium">{item.narratorName}</span>
          )}
          {sizeMb && (
            <span className="text-[10px] text-muted">· {sizeMb} MB</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          {item.downloadedAt && (
            <span className="text-[10px] text-muted">Downloaded {formatDate(item.downloadedAt)}</span>
          )}
        </div>
        <div className="mt-1">
          <ExpiryBadge days={item.daysUntilExpiry} />
        </div>
      </div>

      <div className="flex flex-col items-center gap-1.5 pt-1">
        <button
          onClick={onPlay}
          className="w-10 h-10 rounded-full bg-gamana-500 text-white flex items-center justify-center shadow-sm hover:bg-gamana-600 transition-all active:scale-95"
        >
          {isPlaying ? (
            <Pause size={16} fill="currentColor" />
          ) : (
            <Play size={16} fill="currentColor" className="ml-0.5" />
          )}
        </button>
        <button
          onClick={onDelete}
          className="w-8 h-8 rounded-full border border-border-default flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-colors"
        >
          <Trash2 size={13} className="text-muted" />
        </button>
      </div>
    </div>
  );
}

function getStoryIdsForDownload(item: EnrichedDownload): string[] {
  if (item.itemType === 'pack') return getPackStoryIds(item.itemId);
  if (item.itemType === 'tour') {
    return getTourStops(item.itemId)
      .filter((s) => s.story_id)
      .map((s) => s.story_id!);
  }
  return [];
}

function TourStoryRow({
  story,
  index,
  onTap,
}: {
  story: Story;
  index: number;
  onTap: () => void;
}) {
  const mins = Math.round(story.duration_seconds / 60);
  return (
    <button onClick={onTap} className="flex items-center gap-3 py-2.5 w-full text-left hover:bg-canvas/50 transition-colors">
      <span className="w-5 h-5 rounded-full bg-gamana-100 flex items-center justify-center text-[10px] font-bold text-gamana-600 flex-shrink-0">
        {index + 1}
      </span>
      <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-gamana-50 dark:bg-gamana-900/20">
        {story.image_url ? (
          <img src={story.image_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gamana-100 to-gamana-200" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h5 className="text-[12px] font-medium text-heading truncate leading-tight">{story.title}</h5>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="inline-flex items-center gap-0.5 text-[10px] text-muted font-medium">
            <Clock size={8} /> {mins} mins
          </span>
        </div>
      </div>
      <Play size={12} className="text-gamana-400 flex-shrink-0" />
    </button>
  );
}

function TourExpandedCard({
  item,
  onTap,
  onDelete,
  onNavigateToStory,
}: {
  item: EnrichedDownload;
  onTap: () => void;
  onDelete: () => void;
  onNavigateToStory: (storyId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const sizeMb = item.sizeBytes ? (item.sizeBytes / (1024 * 1024)).toFixed(1) : null;

  const stories = useMemo(() => {
    if (!expanded) return [];
    const ids = getStoryIdsForDownload(item);
    return ids
      .map((id) => getStoryById(id))
      .filter((s): s is Story => s !== null);
  }, [expanded, item]);

  const storyCount = useMemo(() => getStoryIdsForDownload(item).length, [item]);

  return (
    <div className="bg-surface rounded-2xl shadow-card overflow-hidden">
      <div className="flex items-start gap-3 p-3">
        <button onClick={onTap} className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gamana-50 dark:bg-gamana-900/20">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gamana-100 to-gamana-200" />
          )}
          <span className="absolute bottom-1 left-1 text-[8px] font-bold text-white bg-gamana-600 px-1.5 py-0.5 rounded">
            TOUR
          </span>
        </button>

        <div className="flex-1 min-w-0 py-0.5">
          <h4 className="text-[13px] font-semibold text-heading truncate leading-tight">{item.title}</h4>
          <p className="text-[11px] text-muted truncate mt-0.5">
            {storyCount} {storyCount === 1 ? 'story' : 'stories'}
            {item.durationSeconds > 0 && ` · ${Math.round(item.durationSeconds / 60)} mins`}
          </p>
          {sizeMb && (
            <span className="text-[10px] text-muted mt-0.5 block">{sizeMb} MB</span>
          )}
          <div className="flex items-center gap-2 mt-1">
            {item.downloadedAt && (
              <span className="text-[10px] text-muted">Downloaded {formatDate(item.downloadedAt)}</span>
            )}
          </div>
          <div className="mt-1">
            <ExpiryBadge days={item.daysUntilExpiry} />
          </div>
        </div>

        <div className="flex flex-col items-center gap-1.5 pt-1">
          <button className="w-10 h-10 rounded-full bg-gamana-500 text-white flex items-center justify-center shadow-sm hover:bg-gamana-600 transition-all active:scale-95">
            <Play size={16} fill="currentColor" className="ml-0.5" />
          </button>
          <button
            onClick={onDelete}
            className="w-8 h-8 rounded-full border border-border-default flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-colors"
          >
            <Trash2 size={13} className="text-muted" />
          </button>
        </div>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-center gap-1 py-2 w-full text-[11px] font-medium text-gamana-500 hover:bg-gamana-50/50 transition-colors border-t border-border-subtle"
      >
        {expanded ? 'Hide' : 'Show'} {storyCount} {storyCount === 1 ? 'story' : 'stories'}
        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {expanded && stories.length > 0 && (
        <div className="border-t border-border-subtle px-3 divide-y divide-border-subtle">
          {stories.map((story, idx) => (
            <TourStoryRow
              key={story.id}
              story={story}
              index={idx}
              onTap={() => onNavigateToStory(story.id)}
            />
          ))}
        </div>
      )}

      {expanded && stories.length === 0 && (
        <div className="border-t border-border-subtle px-4 py-4 text-center">
          <p className="text-[11px] text-muted">No stories found in this tour</p>
        </div>
      )}
    </div>
  );
}

export default function DownloadsSection({ onNavigateToStory }: DownloadsSectionProps) {
  const [downloads, setDownloads] = useState<EnrichedDownload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<DownloadFilter>('all');

  const narrators = useMemo(() => getNarrators(), []);
  const defaultNarratorName = narrators[0]?.name ?? null;

  const loadDownloads = useCallback(async () => {
    const items = await getAllDownloads();
    const enriched: EnrichedDownload[] = items.map((item) => {
      if (item.itemType === 'story') {
        const story = getStoryById(item.itemId);
        return {
          ...item,
          title: story?.title ?? 'Unknown Story',
          subtitle: story?.subtitle ?? '',
          imageUrl: story?.image_url ?? null,
          narratorName: defaultNarratorName,
          durationSeconds: story?.duration_seconds ?? 0,
          daysUntilExpiry: getExpiryDays(item.downloadedAt),
          city: story?.subtitle?.split('·')[0]?.trim() ?? null,
        };
      }
      if (item.itemType === 'pack') {
        const pack = getCityPackById(item.itemId);
        const storyIds = getPackStoryIds(item.itemId);
        const firstStory = storyIds.length > 0 ? getStoryById(storyIds[0]) : null;
        return {
          ...item,
          title: pack?.title ?? 'Unknown Pack',
          subtitle: pack?.subtitle ?? '',
          imageUrl: firstStory?.image_url ?? null,
          narratorName: null,
          durationSeconds: pack?.total_duration_seconds ?? 0,
          daysUntilExpiry: getExpiryDays(item.downloadedAt),
          city: `${storyIds.length} stories`,
        };
      }
      return {
        ...item,
        title: item.itemId,
        subtitle: '',
        imageUrl: null,
        narratorName: null,
        durationSeconds: 0,
        daysUntilExpiry: getExpiryDays(item.downloadedAt),
        city: null,
      };
    });
    setDownloads(enriched);
    setIsLoading(false);
  }, [defaultNarratorName]);

  useEffect(() => {
    loadDownloads();
  }, [loadDownloads]);

  const handleDelete = async (itemType: DownloadState['itemType'], itemId: string) => {
    await deleteDownload(itemType, itemId);
    setDownloads((prev) => prev.filter((d) => !(d.itemType === itemType && d.itemId === itemId)));
    console.info('download_deleted', { item_type: itemType, item_id: itemId });
  };

  const handleClearAll = async () => {
    for (const d of downloads) {
      await deleteDownload(d.itemType, d.itemId);
    }
    setDownloads([]);
    console.info('downloads_cleared_all', { count: downloads.length });
  };

  const filtered = useMemo(() => {
    if (filter === 'stories') return downloads.filter((d) => d.itemType === 'story');
    if (filter === 'tours') return downloads.filter((d) => d.itemType === 'tour' || d.itemType === 'pack');
    return downloads;
  }, [downloads, filter]);

  const storyCount = downloads.filter((d) => d.itemType === 'story').length;
  const tourCount = downloads.filter((d) => d.itemType === 'tour' || d.itemType === 'pack').length;
  const totalSize = downloads.reduce((acc, d) => acc + (d.sizeBytes ?? 0), 0);
  const expiringCount = downloads.filter((d) => d.daysUntilExpiry !== null && d.daysUntilExpiry <= 7).length;
  const downloadingItems = filtered.filter((d) => d.status === 'downloading' || d.status === 'queued');
  const readyItems = filtered.filter((d) => d.status === 'ready');
  const failedItems = filtered.filter((d) => d.status === 'failed');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="text-gamana-300 animate-spin" />
      </div>
    );
  }

  if (downloads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gamana-50 to-gamana-100 flex items-center justify-center mb-4">
          <Download size={32} className="text-gamana-300" />
        </div>
        <p className="text-base font-semibold text-heading mb-1">No downloads yet</p>
        <p className="text-xs text-muted text-center max-w-[260px] leading-relaxed">
          Unlock stories and download them for offline listening. Downloaded content is available without an internet connection.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-3 pb-4 animate-fade-in">
      {/* Storage header */}
      <div className="rounded-2xl bg-gradient-to-r from-gamana-600 to-gamana-500 p-3.5 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <HardDrive size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Storage Used</p>
              <p className="text-[10px] text-white/70 mt-0.5">
                {tourCount > 0 && `${tourCount} tour${tourCount !== 1 ? 's' : ''}, `}
                {storyCount} {storyCount === 1 ? 'story' : 'stories'} · {(totalSize / (1024 * 1024)).toFixed(1)} MB
              </p>
            </div>
          </div>
          {downloads.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-3 py-1.5 rounded-lg bg-red-400/90 text-white text-[10px] font-semibold hover:bg-red-500 transition-colors active:scale-95"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {([
          { id: 'all' as DownloadFilter, label: 'All', count: downloads.length },
          { id: 'stories' as DownloadFilter, label: 'Stories', count: storyCount },
          { id: 'tours' as DownloadFilter, label: 'Tours', count: tourCount },
        ]).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all ${
              filter === tab.id
                ? 'bg-gamana-500 text-white'
                : 'bg-canvas text-gamana-600/60 hover:bg-sand-200'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Expiry warning */}
      {expiringCount > 0 && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 mb-4">
          <AlertCircle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-amber-800">
              {expiringCount} download{expiringCount !== 1 ? 's' : ''} expire{expiringCount === 1 ? 's' : ''} soon
            </p>
            <p className="text-[10px] text-amber-600/80 mt-0.5 leading-relaxed">
              Downloads expire {EXPIRY_DAYS} days after download date. Play to re-download and extend.
            </p>
          </div>
        </div>
      )}

      {/* Downloading items */}
      {downloadingItems.length > 0 && (
        <div className="mb-4">
          <p className="text-[10px] text-muted font-semibold uppercase tracking-wider mb-2 px-1">Downloading</p>
          <div className="space-y-2.5">
            {downloadingItems.map((item) => (
              <div key={`${item.itemType}-${item.itemId}`} className="flex items-center gap-3 p-3 bg-surface rounded-2xl shadow-card">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gamana-50 dark:bg-gamana-900/20">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gamana-100 to-gamana-200" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-heading truncate">{item.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-surface-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gamana-500 rounded-full transition-all" style={{ width: `${item.progress}%` }} />
                    </div>
                    <span className="text-[10px] text-gamana-500 font-medium">{Math.round(item.progress)}%</span>
                  </div>
                </div>
                <Loader2 size={18} className="text-gamana-400 animate-spin flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ready items */}
      {readyItems.length > 0 && (
        <div className="space-y-2.5 mb-4">
          {readyItems.map((item) => (
            item.itemType === 'tour' || item.itemType === 'pack' ? (
              <TourExpandedCard
                key={`${item.itemType}-${item.itemId}`}
                item={item}
                onTap={() => {}}
                onDelete={() => handleDelete(item.itemType, item.itemId)}
                onNavigateToStory={onNavigateToStory}
              />
            ) : (
              <DownloadStoryCard
                key={`${item.itemType}-${item.itemId}`}
                item={item}
                isPlaying={false}
                onPlay={() => {}}
                onTap={() => onNavigateToStory(item.itemId)}
                onDelete={() => handleDelete(item.itemType, item.itemId)}
              />
            )
          ))}
        </div>
      )}

      {/* Failed items */}
      {failedItems.length > 0 && (
        <div className="mb-4">
          <p className="text-[10px] text-muted font-semibold uppercase tracking-wider mb-2 px-1">Failed</p>
          <div className="space-y-2.5">
            {failedItems.map((item) => (
              <div key={`${item.itemType}-${item.itemId}`} className="flex items-center gap-3 p-3 bg-surface rounded-2xl border border-red-100">
                <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
                  <Download size={18} className="text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-heading truncate">{item.title}</p>
                  <p className="text-[10px] text-red-400 mt-0.5">{item.error ?? 'Download failed'}</p>
                </div>
                <button
                  onClick={() => handleDelete(item.itemType, item.itemId)}
                  className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={14} className="text-muted" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-10">
          <p className="text-sm text-muted">No {filter === 'all' ? '' : filter} downloads</p>
        </div>
      )}
    </div>
  );
}
