import { useState, useEffect, useCallback } from 'react';
import type { DownloadState } from '../types';
import {
  getDownloadState,
  enqueueDownload,
  deleteDownload,
  subscribeDownloads,
} from '../lib/downloadManager';

interface UseDownloadStateReturn {
  downloadState: DownloadState;
  startDownload: () => void;
  removeDownload: () => void;
  isDownloaded: boolean;
  isDownloading: boolean;
}

export function useDownloadState(
  itemType: DownloadState['itemType'],
  itemId: string,
): UseDownloadStateReturn {
  const [downloadState, setDownloadState] = useState<DownloadState>({
    itemType,
    itemId,
    status: 'none',
    progress: 0,
    downloadedAt: null,
    sizeBytes: null,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    getDownloadState(itemType, itemId).then((state) => {
      if (mounted) setDownloadState(state);
    });

    const unsub = subscribeDownloads((state) => {
      if (state.itemType === itemType && state.itemId === itemId && mounted) {
        setDownloadState(state);
      }
    });

    return () => {
      mounted = false;
      unsub();
    };
  }, [itemType, itemId]);

  const startDownload = useCallback(() => {
    enqueueDownload(itemType, itemId);
  }, [itemType, itemId]);

  const remove = useCallback(() => {
    deleteDownload(itemType, itemId);
  }, [itemType, itemId]);

  return {
    downloadState,
    startDownload,
    removeDownload: remove,
    isDownloaded: downloadState.status === 'ready',
    isDownloading: downloadState.status === 'downloading' || downloadState.status === 'queued',
  };
}
