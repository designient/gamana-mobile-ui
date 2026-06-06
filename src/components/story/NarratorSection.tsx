import { Mic } from 'lucide-react';
import type { Narrator, StoryNarration } from '../../types';

interface NarratorSectionProps {
  narrator: Narrator | null;
  narrations: StoryNarration[];
  onChangeLens: () => void;
}

export default function NarratorSection({ narrator, narrations, onChangeLens }: NarratorSectionProps) {
  if (!narrator) return null;

  return (
    <div className="mx-4 mt-5">
      <h3 className="text-sm font-semibold text-heading mb-3 px-1">Your Narrator</h3>

      <div className="bg-surface rounded-2xl shadow-card p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gamana-100 flex items-center justify-center flex-shrink-0">
            {narrator.avatar_url ? (
              <img src={narrator.avatar_url} alt={narrator.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <Mic size={18} className="text-gamana-500" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-heading">{narrator.name}</span>
              <span className="text-xs text-gamana-400 font-medium">{narrator.style}</span>
            </div>
            <p className="text-xs text-muted mt-0.5 truncate">{narrator.description}</p>
          </div>

          <button
            onClick={onChangeLens}
            className="text-xs font-medium text-gamana-500 hover:text-gamana-600 transition-colors whitespace-nowrap active:scale-95"
          >
            Try another lens
          </button>
        </div>
      </div>

      {narrations.length > 1 && (
        <p className="text-[11px] text-muted mt-2 px-1">
          {narrations.length} narrators available for this story
        </p>
      )}
    </div>
  );
}
