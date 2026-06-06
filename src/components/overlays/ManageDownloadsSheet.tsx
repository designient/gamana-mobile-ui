import { useState, useEffect } from 'react';
import { X, Download, Trash2, CheckCircle2, Loader2, HardDrive, AlertCircle } from 'lucide-react';
import type { DownloadState } from '../../types';
import { getAllDownloads, deleteDownload } from '../../lib/downloadManager';
import { getStoryById } from '../../lib/localDb';

interface ManageDownloadsSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ManageDownloadsSheet({ isOpen, onClose }: ManageDownloadsSheetProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [downloads, setDownloads] = useState<(DownloadState & { title?: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      getAllDownloads().then((items) => {
        const enriched = items.map((item) => {
          if (item.itemType === 'story') {
            const story = getStoryById(item.itemId);
            return { ...item, title: story?.title ?? item.itemId };
          }
          return { ...item, title: item.itemId };
        });
        setDownloads(enriched);
        setIsLoading(false);
      });
    }
  }, [isOpen]);

  if (!isOpen && !isClosing) return null;

  const animState = isClosing ? 'closing' : 'open';

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  };

  const handleDelete = async (itemType: DownloadState['itemType'], itemId: string) => {
    await deleteDownload(itemType, itemId);
    setDownloads((prev) => prev.filter((d) => !(d.itemType === itemType && d.itemId === itemId)));
  };

  const handleDeleteAll = async () => {
    for (const d of downloads) {
      await deleteDownload(d.itemType, d.itemId);
    }
    setDownloads([]);
  };

  const totalSize = downloads.reduce((acc, d) => acc + (d.sizeBytes ?? 0), 0);
  const readyItems = downloads.filter((d) => d.status === 'ready');
  const downloadingItems = downloads.filter((d) => d.status === 'downloading' || d.status === 'queued');
  const failedItems = downloads.filter((d) => d.status === 'failed');

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end pointer-events-auto">
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200 ${
          animState === 'closing' ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
      />

      <div
        className={`relative bg-surface-alt rounded-t-3xl shadow-elevated transition-transform duration-200 ease-out flex flex-col max-h-[85vh] ${
          animState === 'closing' ? 'translate-y-full' : 'translate-y-0'
        }`}
      >
        <div className="flex justify-center pt-3 pb-2 flex-shrink-0 bg-surface rounded-t-3xl">
          <div className="w-10 h-1.5 rounded-full bg-surface-muted" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-surface border-b border-border-default">
          <h2 className="text-lg font-bold text-heading">Manage Downloads</h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-muted text-secondary hover:bg-surface-muted transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Storage Summary */}
        <div className="flex items-center gap-3 mx-5 mt-4 p-3.5 rounded-xl bg-surface border border-border-default">
          <div className="w-10 h-10 rounded-xl bg-gamana-50 dark:bg-gamana-900/20 flex items-center justify-center flex-shrink-0">
            <HardDrive size={18} className="text-gamana-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-heading">
              {readyItems.length} item{readyItems.length !== 1 ? 's' : ''} saved
            </p>
            <p className="text-xs text-muted">{(totalSize / (1024 * 1024)).toFixed(1)} MB used</p>
          </div>
          {readyItems.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="text-xs font-medium text-red-500 hover:text-red-600 transition-colors px-2 py-1"
            >
              Delete All
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-hide">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={24} className="text-gamana-300 animate-spin" />
            </div>
          ) : downloads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-14 h-14 rounded-full bg-surface-muted flex items-center justify-center mb-3">
                <Download size={24} className="text-faint" />
              </div>
              <p className="text-sm font-medium text-heading mb-1">No downloads yet</p>
              <p className="text-xs text-muted text-center max-w-[220px]">
                Unlock stories and download them for offline listening.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Downloading */}
              {downloadingItems.length > 0 && (
                <div>
                  <p className="text-xs text-muted font-semibold uppercase tracking-wider mb-2">Downloading</p>
                  <div className="space-y-2">
                    {downloadingItems.map((item) => (
                      <div key={`${item.itemType}-${item.itemId}`} className="flex items-center gap-3 p-3 bg-surface rounded-xl">
                        <Loader2 size={16} className="text-gamana-500 animate-spin flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-heading truncate">{item.title}</p>
                          <div className="w-full h-1 bg-surface-muted rounded-full mt-1.5">
                            <div className="h-1 bg-gamana-500 rounded-full transition-all" style={{ width: `${item.progress}%` }} />
                          </div>
                        </div>
                        <span className="text-xs text-muted">{item.progress}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ready */}
              {readyItems.length > 0 && (
                <div>
                  <p className="text-xs text-muted font-semibold uppercase tracking-wider mb-2">Offline Ready</p>
                  <div className="space-y-2">
                    {readyItems.map((item) => (
                      <div key={`${item.itemType}-${item.itemId}`} className="flex items-center gap-3 p-3 bg-surface rounded-xl">
                        <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-heading truncate">{item.title}</p>
                          <p className="text-xs text-muted">
                            {item.sizeBytes ? `${(item.sizeBytes / (1024 * 1024)).toFixed(1)} MB` : 'Cached'}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDelete(item.itemType, item.itemId)}
                          className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={14} className="text-muted hover:text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Failed */}
              {failedItems.length > 0 && (
                <div>
                  <p className="text-xs text-muted font-semibold uppercase tracking-wider mb-2">Failed</p>
                  <div className="space-y-2">
                    {failedItems.map((item) => (
                      <div key={`${item.itemType}-${item.itemId}`} className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-red-100">
                        <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-heading truncate">{item.title}</p>
                          <p className="text-xs text-red-400">{item.error ?? 'Download failed'}</p>
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
