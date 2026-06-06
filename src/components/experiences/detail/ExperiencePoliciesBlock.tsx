import { Info } from 'lucide-react';

interface ExperiencePoliciesBlockProps {
  cancellationPolicy?: string;
}

export default function ExperiencePoliciesBlock({
  cancellationPolicy,
}: ExperiencePoliciesBlockProps) {
  if (!cancellationPolicy) return null;

  return (
    <div className="px-4 py-5 border-b border-gamana-100/70">
      <h2 className="text-sm font-semibold text-heading mb-3 flex items-center gap-2">
        <Info size={16} className="text-gamana-500" />
        Cancellation policy
      </h2>
      <div className="rounded-xl border border-gamana-100 bg-surface p-3.5">
        <p className="text-xs text-muted leading-relaxed">{cancellationPolicy}</p>
      </div>
    </div>
  );
}
