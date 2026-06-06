import { useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export default function OfflineBanner() {
  useEffect(() => {
    console.info('offline_banner_shown', { screen: 'global', has_downloads: false });
  }, []);

  return (
    <div className="mx-4 mt-2 flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-muted border border-border-default">
      <WifiOff size={14} className="text-secondary flex-shrink-0" />
      <p className="text-xs text-secondary font-medium">
        You're offline — playing downloaded stories
      </p>
    </div>
  );
}
