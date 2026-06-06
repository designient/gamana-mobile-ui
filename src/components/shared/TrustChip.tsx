import { ShieldCheck, BookOpen, Blend } from 'lucide-react';
import type { TrustLevel } from '../../types';

const config: Record<TrustLevel, { label: string; icon: typeof ShieldCheck; cls: string }> = {
  verified: { label: 'Verified', icon: ShieldCheck, cls: 'bg-trust-verified/10 text-trust-verified' },
  legend: { label: 'Legend', icon: BookOpen, cls: 'bg-trust-legend/10 text-trust-legend' },
  mixed: { label: 'Mixed', icon: Blend, cls: 'bg-trust-mixed/10 text-trust-mixed' },
};

export default function TrustChip({ level }: { level: TrustLevel }) {
  const c = config[level];
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${c.cls}`}>
      <Icon size={11} />
      {c.label}
    </span>
  );
}
