import { Download, CheckCircle2, Loader2 } from 'lucide-react';

interface OfflineBadgeProps {
  status: 'available' | 'downloading' | 'ready';
  compact?: boolean;
}

export default function OfflineBadge({ status, compact }: OfflineBadgeProps) {
  if (status === 'ready') {
    return (
      <span className="inline-flex items-center gap-1 text-safe-success text-[11px] font-medium">
        <CheckCircle2 size={12} />
        {!compact && 'Offline ready'}
      </span>
    );
  }

  if (status === 'downloading') {
    return (
      <span className="inline-flex items-center gap-1 text-gamana-400 text-[11px] font-medium">
        <Loader2 size={12} className="animate-spin" />
        {!compact && 'Downloading...'}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-muted text-[11px] font-medium">
      <Download size={12} />
      {!compact && 'Download'}
    </span>
  );
}
