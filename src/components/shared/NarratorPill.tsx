import { Mic, ChevronDown } from 'lucide-react';
import type { Narrator } from '../../types';

interface NarratorPillProps {
  narrator: Narrator | null;
  onTap: () => void;
}

export default function NarratorPill({ narrator, onTap }: NarratorPillProps) {
  return (
    <button
      onClick={onTap}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gamana-50 dark:bg-gamana-900/20 border border-gamana-100 text-body text-xs font-medium transition-colors hover:bg-gamana-100 active:scale-[0.97]"
    >
      <Mic size={12} className="text-gamana-500" />
      <span>Narrator: {narrator?.style ?? 'Historian'}</span>
      <ChevronDown size={12} className="text-gamana-400" />
    </button>
  );
}
