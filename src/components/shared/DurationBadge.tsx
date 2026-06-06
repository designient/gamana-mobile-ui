import { Clock } from 'lucide-react';

export default function DurationBadge({ seconds }: { seconds: number }) {
  const mins = Math.round(seconds / 60);
  return (
    <span className="inline-flex items-center gap-1 text-muted text-[11px] font-medium">
      <Clock size={11} />
      {mins} min
    </span>
  );
}
