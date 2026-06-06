import type { DownloadState } from '../types';
import { DOWNLOAD_CACHE_NAME } from './constants';
import { setDownload, getDownload, removeDownload, getAllDownloads, saveStoryOffline, getDownloadsByStatus } from './offlineDb';
import { getStoryById, getStoryNarrations, getTourStops, getPackStoryIds } from './localDb';

type DownloadListener = (state: DownloadState) => void;

const listeners = new Set<DownloadListener>();
const queue: DownloadState[] = [];
let processing = false;

(async function recoverStuckDownloads() {
  try {
    const stuck = [
      ...(await getDownloadsByStatus('downloading')),
      ...(await getDownloadsByStatus('queued')),
    ];
    for (const item of stuck) {
      await removeDownload(item.itemType, item.itemId);
    }
  } catch { /* best effort cleanup */ }
})();

function notify(state: DownloadState): void {
  listeners.forEach((fn) => fn(state));
}

export function subscribeDownloads(fn: DownloadListener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

async function openCache(): Promise<Cache> {
  return caches.open(DOWNLOAD_CACHE_NAME);
}

const IS_MOCK = true;
const MOCK_STEP_DELAY_MS = 300;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function cacheUrl(cache: Cache, url: string): Promise<void> {
  if (IS_MOCK) {
    await sleep(MOCK_STEP_DELAY_MS);
    return;
  }
  await cache.add(url);
}

async function downloadStoryById(
  item: DownloadState,
  cache: Cache,
  storyId: string,
  _progressOffset: number,
  _progressRange: number,
  totalSteps: number,
  completedRef: { count: number },
): Promise<number> {
  const story = getStoryById(storyId);
  if (!story) return 0;

  const narrations = getStoryNarrations(storyId);
  let storySize = 0;

  if (story.image_url) {
    try { await cacheUrl(cache, story.image_url); } catch { /* non-critical */ }
  }

  for (const narration of narrations) {
    try {
      await cacheUrl(cache, narration.audio_url);
      storySize += 500_000;
    } catch { /* individual failure is recoverable */ }

    completedRef.count++;
    const progress = Math.round((completedRef.count / totalSteps) * 100);
    const progressState: DownloadState = { ...item, status: 'downloading', progress };
    await setDownload(progressState);
    notify(progressState);
  }

  if (narrations.length === 0) {
    completedRef.count++;
    const progress = Math.round((completedRef.count / totalSteps) * 100);
    const progressState: DownloadState = { ...item, status: 'downloading', progress };
    await setDownload(progressState);
    notify(progressState);
  }

  await saveStoryOffline({ ...story, narrations });
  return storySize;
}

async function processQueue(): Promise<void> {
  if (processing) return;
  processing = true;

  try {
  while (queue.length > 0) {
    const item = queue.shift()!;
    try {
      const downloadingState: DownloadState = { ...item, status: 'downloading', progress: 0 };
      await setDownload(downloadingState);
      notify(downloadingState);

      const cache = await openCache();

      if (item.itemType === 'story') {
        const story = getStoryById(item.itemId);
        if (!story) throw new Error('Story not found');

        const narrations = getStoryNarrations(item.itemId);
        const totalSteps = Math.max(narrations.length, 1);
        const completedRef = { count: 0 };

        const totalSize = await downloadStoryById(item, cache, item.itemId, 0, 100, totalSteps, completedRef);

        const readyState: DownloadState = {
          ...item,
          status: 'ready',
          progress: 100,
          downloadedAt: new Date().toISOString(),
          sizeBytes: totalSize,
          error: null,
        };
        await setDownload(readyState);
        notify(readyState);

        console.info('download_completed', {
          item_type: item.itemType,
          item_id: item.itemId,
          size_bytes: totalSize,
        });
      }

      if (item.itemType === 'tour') {
        const stops = getTourStops(item.itemId);
        const storyStops = stops.filter((s) => s.story_id && s.story);
        if (storyStops.length === 0) throw new Error('Tour has no story stops');

        const totalSteps = storyStops.reduce((acc, s) => {
          const narrations = s.story_id ? getStoryNarrations(s.story_id) : [];
          return acc + Math.max(narrations.length, 1);
        }, 0);

        const completedRef = { count: 0 };
        let totalSize = 0;

        for (const stop of storyStops) {
          if (!stop.story_id || !stop.story) continue;
          const stopSize = await downloadStoryById(item, cache, stop.story_id, 0, 100, totalSteps, completedRef);
          totalSize += stopSize;
        }

        const readyState: DownloadState = {
          ...item,
          status: 'ready',
          progress: 100,
          downloadedAt: new Date().toISOString(),
          sizeBytes: totalSize,
          error: null,
        };
        await setDownload(readyState);
        notify(readyState);

        console.info('download_completed', {
          item_type: item.itemType,
          item_id: item.itemId,
          size_bytes: totalSize,
          stop_count: storyStops.length,
        });
      }

      if (item.itemType === 'pack') {
        const storyIds = getPackStoryIds(item.itemId);
        if (storyIds.length === 0) throw new Error('Pack has no stories');

        const totalSteps = storyIds.reduce((acc, sid) => {
          const narrations = getStoryNarrations(sid);
          return acc + Math.max(narrations.length, 1);
        }, 0);

        const completedRef = { count: 0 };
        let totalSize = 0;

        for (const storyId of storyIds) {
          const stopSize = await downloadStoryById(item, cache, storyId, 0, 100, totalSteps, completedRef);
          totalSize += stopSize;
        }

        const readyState: DownloadState = {
          ...item,
          status: 'ready',
          progress: 100,
          downloadedAt: new Date().toISOString(),
          sizeBytes: totalSize,
          error: null,
        };
        await setDownload(readyState);
        notify(readyState);

        console.info('download_completed', {
          item_type: item.itemType,
          item_id: item.itemId,
          size_bytes: totalSize,
          story_count: storyIds.length,
        });
      }
    } catch (err) {
      const failedState: DownloadState = {
        ...item,
        status: 'failed',
        error: err instanceof Error ? err.message : 'Download failed',
      };
      await setDownload(failedState);
      notify(failedState);

      console.info('download_failed', {
        item_type: item.itemType,
        item_id: item.itemId,
        error: failedState.error,
      });
    }
  }
  } finally {
    processing = false;
  }
}

export async function enqueueDownload(
  itemType: DownloadState['itemType'],
  itemId: string,
): Promise<void> {
  const existing = await getDownload(itemType, itemId);
  if (existing && (existing.status === 'ready' || existing.status === 'downloading' || existing.status === 'queued')) {
    return;
  }

  const state: DownloadState = {
    itemType,
    itemId,
    status: 'queued',
    progress: 0,
    downloadedAt: null,
    sizeBytes: null,
    error: null,
  };

  await setDownload(state);
  notify(state);
  queue.push(state);

  console.info('download_tapped', { item_type: itemType, item_id: itemId });

  processQueue();
}

export async function deleteDownload(
  itemType: DownloadState['itemType'],
  itemId: string,
): Promise<void> {
  const existing = await getDownload(itemType, itemId);
  if (!existing) return;

  const cache = await openCache();

  if (itemType === 'story') {
    const narrations = getStoryNarrations(itemId);
    for (const n of narrations) {
      try { await cache.delete(n.audio_url); } catch { /* best effort */ }
    }
    const story = getStoryById(itemId);
    if (story?.image_url) {
      try { await cache.delete(story.image_url); } catch { /* best effort */ }
    }
  }

  if (itemType === 'tour') {
    const stops = getTourStops(itemId);
    for (const stop of stops) {
      if (!stop.story_id) continue;
      const narrations = getStoryNarrations(stop.story_id);
      for (const n of narrations) {
        try { await cache.delete(n.audio_url); } catch { /* best effort */ }
      }
      const story = stop.story_id ? getStoryById(stop.story_id) : null;
      if (story?.image_url) {
        try { await cache.delete(story.image_url); } catch { /* best effort */ }
      }
    }
  }

  if (itemType === 'pack') {
    const storyIds = getPackStoryIds(itemId);
    for (const sid of storyIds) {
      const narrations = getStoryNarrations(sid);
      for (const n of narrations) {
        try { await cache.delete(n.audio_url); } catch { /* best effort */ }
      }
      const story = getStoryById(sid);
      if (story?.image_url) {
        try { await cache.delete(story.image_url); } catch { /* best effort */ }
      }
    }
  }

  await removeDownload(itemType, itemId);

  const clearedState: DownloadState = {
    itemType,
    itemId,
    status: 'none',
    progress: 0,
    downloadedAt: null,
    sizeBytes: null,
    error: null,
  };
  notify(clearedState);

  console.info('download_deleted', { item_type: itemType, item_id: itemId });
}

export async function getDownloadState(
  itemType: DownloadState['itemType'],
  itemId: string,
): Promise<DownloadState> {
  const state = await getDownload(itemType, itemId);
  return state ?? {
    itemType,
    itemId,
    status: 'none',
    progress: 0,
    downloadedAt: null,
    sizeBytes: null,
    error: null,
  };
}

export { getAllDownloads };

export async function isAudioCached(url: string): Promise<boolean> {
  try {
    const cache = await openCache();
    const response = await cache.match(url);
    return !!response;
  } catch {
    return false;
  }
}

export async function getCachedAudioUrl(url: string): Promise<string | null> {
  try {
    const cache = await openCache();
    const response = await cache.match(url);
    if (!response) return null;
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}
