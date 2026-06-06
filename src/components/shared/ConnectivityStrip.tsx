import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Signal, Download, CheckCircle2 } from 'lucide-react';
import { useConnectivity } from '../../hooks/useConnectivity';
import { getAllDownloads } from '../../lib/downloadManager';

export default function ConnectivityStrip() {
  const { isOnline, isWeak } = useConnectivity();
  const [readyCount, setReadyCount] = useState(0);
  const [downloadingCount, setDownloadingCount] = useState(0);

  useEffect(() => {
    getAllDownloads().then((items) => {
      setReadyCount(items.filter((d) => d.status === 'ready').length);
      setDownloadingCount(items.filter((d) => d.status === 'downloading' || d.status === 'queued').length);
    });

    const interval = setInterval(() => {
      getAllDownloads().then((items) => {
        setReadyCount(items.filter((d) => d.status === 'ready').length);
        setDownloadingCount(items.filter((d) => d.status === 'downloading' || d.status === 'queued').length);
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const hasActivity = readyCount > 0 || downloadingCount > 0;

  return (
    <div className="flex items-center justify-between px-5 py-1.5 bg-canvas border-b border-border-default">
      <div className="flex items-center gap-3">
        {!isOnline ? (
          <div className="flex items-center gap-1.5 text-[10px] font-medium text-secondary">
            <WifiOff size={10} />
            <span>Offline — downloaded content available</span>
          </div>
        ) : isWeak ? (
          <div className="flex items-center gap-1.5 text-[10px] font-medium text-amber-600">
            <Signal size={10} />
            <span>Weak connection</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted">
            <Wifi size={10} />
            <span>Connected</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {downloadingCount > 0 && (
          <span className="flex items-center gap-1 text-[10px] font-medium text-gamana-500">
            <Download size={9} className="animate-pulse" />
            {downloadingCount} downloading
          </span>
        )}
        {readyCount > 0 && (
          <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600">
            <CheckCircle2 size={9} />
            {readyCount} offline
          </span>
        )}
        {!hasActivity && (
          <span className="text-[10px] text-faint">No downloads</span>
        )}
      </div>
    </div>
  );
}
